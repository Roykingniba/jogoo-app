-- JOGOO client accounts on Supabase: profiles, roles, project journey, and
-- email-code 2-step verification enforced by the database.
--
-- How 2-step works: a password sign-in gives a Supabase session, but every
-- table and function here also requires that session to be VERIFIED
-- (private.verified_sessions), which only the `auth-codes` Edge Function can
-- record, after the user types the 6-digit code emailed to them (or presents a
-- trusted-device token). A stolen password alone reads nothing.
--
-- Supabase dashboard setting required: Authentication → Sign In / Providers →
-- Email → "Confirm email" OFF (email ownership is confirmed by our own code).

create extension if not exists pgcrypto with schema extensions;
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

-- ---------------------------------------------------------------- types
do $$ begin
  create type public.user_role as enum ('client', 'admin', 'super_admin');
exception when duplicate_object then null; end $$;
do $$ begin
  create type public.journey_stage as enum (
    'signed_up', 'contacted', 'site_visit', 'quote_sent',
    'payment_made', 'installation_scheduled', 'installed');
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------- tables
create table if not exists public.profiles (
  id             uuid primary key references auth.users (id) on delete cascade,
  full_name      text not null check (char_length(full_name) between 1 and 120),
  phone          text check (phone ~ '^[+0-9 ()-]{6,32}$'),
  location       text check (char_length(location) <= 120),
  farm_size_ha   numeric(8, 2) check (farm_size_ha >= 0 and farm_size_ha <= 100000),
  role           public.user_role not null default 'client',
  lang           text not null default 'en' check (lang in ('en', 'fr')),
  email_verified boolean not null default false,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create table if not exists public.journey_events (
  id          uuid primary key default gen_random_uuid(),
  client_id   uuid not null references public.profiles (id) on delete cascade,
  stage       public.journey_stage not null,
  note        text check (char_length(note) <= 1000),
  created_by  uuid references public.profiles (id) on delete set null,
  created_at  timestamptz not null default clock_timestamp()
);
create index if not exists journey_events_client_idx on public.journey_events (client_id, created_at);

-- Private bookkeeping (never exposed through the API).
create table if not exists private.settings (key text primary key, value text not null);
insert into private.settings (key, value)
  values ('code_secret', encode(extensions.gen_random_bytes(32), 'hex'))
  on conflict (key) do nothing;

create table if not exists private.super_admin_emails (email text primary key);
insert into private.super_admin_emails values ('roykingnibajogoo@gmail.com') on conflict do nothing;

create table if not exists private.verified_sessions (
  session_id  uuid primary key,
  user_id     uuid not null references auth.users (id) on delete cascade,
  created_at  timestamptz not null default now(),
  expires_at  timestamptz not null
);
create index if not exists verified_sessions_user_idx on private.verified_sessions (user_id);

create table if not exists private.trusted_devices (
  token_hash  text primary key,
  user_id     uuid not null references auth.users (id) on delete cascade,
  created_at  timestamptz not null default now(),
  expires_at  timestamptz not null
);
create index if not exists trusted_devices_user_idx on private.trusted_devices (user_id);

create table if not exists private.auth_challenges (
  token_hash    text primary key,
  user_id       uuid not null references auth.users (id) on delete cascade,
  purpose       text not null check (purpose in ('verify_email', 'login', 'reset_password')),
  code_hash     text not null,
  attempts      int not null default 0,
  sends         int not null default 1,
  last_sent_at  timestamptz not null default now(),
  expires_at    timestamptz not null
);
create index if not exists auth_challenges_user_idx on private.auth_challenges (user_id, purpose);

create table if not exists private.rate_events (
  id          bigint generated always as identity primary key,
  kind        text not null,
  key         text not null,
  created_at  timestamptz not null default now()
);
create index if not exists rate_events_idx on private.rate_events (kind, key, created_at);

-- ---------------------------------------------------------------- helpers
create or replace function private.hmac(v text) returns text
  language sql stable security definer set search_path = '' as $$
  select encode(extensions.hmac(v, (select value from private.settings where key = 'code_secret'), 'sha256'), 'hex');
$$;

create or replace function private.current_session_id() returns uuid
  language sql stable set search_path = '' as $$
  select nullif(auth.jwt() ->> 'session_id', '')::uuid;
$$;

/** True when this request's session passed the email code (or a trusted device). */
create or replace function private.session_ok() returns boolean
  language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from private.verified_sessions v
     where v.session_id = private.current_session_id()
       and v.user_id = auth.uid()
       and v.expires_at > now());
$$;

create or replace function private.my_role() returns public.user_role
  language sql stable security definer set search_path = '' as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function private.is_staff() returns boolean
  language sql stable security definer set search_path = '' as $$
  select private.session_ok() and coalesce(private.my_role() in ('admin', 'super_admin'), false);
$$;

create or replace function private.is_super_admin() returns boolean
  language sql stable security definer set search_path = '' as $$
  select private.session_ok() and coalesce(private.my_role() = 'super_admin', false);
$$;

grant usage on schema private to authenticated;
grant execute on function private.session_ok(), private.is_staff(), private.is_super_admin(),
  private.current_session_id(), private.my_role() to authenticated;

-- ---------------------------------------------------------------- triggers
-- New sign-up → profile (from sign-up metadata) + first journey step.
create or replace function private.handle_new_user() returns trigger
  language plpgsql security definer set search_path = '' as $$
declare
  m jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  farm numeric;
begin
  begin
    farm := nullif(m ->> 'farm_size_ha', '')::numeric;
  exception when others then farm := null;
  end;
  insert into public.profiles (id, full_name, phone, location, farm_size_ha, lang)
  values (
    new.id,
    left(coalesce(nullif(trim(m ->> 'full_name'), ''), split_part(new.email, '@', 1)), 120),
    case when (m ->> 'phone') ~ '^[+0-9 ()-]{6,32}$' then m ->> 'phone' end,
    left(nullif(trim(m ->> 'location'), ''), 120),
    case when farm between 0 and 100000 then round(farm, 2) end,
    case when m ->> 'lang' = 'fr' then 'fr' else 'en' end
  )
  on conflict (id) do nothing;
  insert into public.journey_events (client_id, stage) values (new.id, 'signed_up');
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function private.handle_new_user();

create or replace function private.touch_profile() returns trigger
  language plpgsql set search_path = '' as $$
begin
  new.updated_at := now();
  return new;
end $$;
drop trigger if exists profiles_touch on public.profiles;
create trigger profiles_touch before update on public.profiles
  for each row execute function private.touch_profile();

-- ---------------------------------------------------------------- row-level security
alter table public.profiles enable row level security;
alter table public.journey_events enable row level security;

drop policy if exists "own profile or staff" on public.profiles;
create policy "own profile or staff" on public.profiles for select to authenticated
  using ((id = (select auth.uid()) and (select private.session_ok())) or (select private.is_staff()));

drop policy if exists "update own profile" on public.profiles;
create policy "update own profile" on public.profiles for update to authenticated
  using (id = (select auth.uid()) and (select private.session_ok()))
  with check (id = (select auth.uid()));

drop policy if exists "own journey or staff" on public.journey_events;
create policy "own journey or staff" on public.journey_events for select to authenticated
  using ((client_id = (select auth.uid()) and (select private.session_ok())) or (select private.is_staff()));

-- Clients may only change these columns; role and email_verified change
-- only through the functions below.
revoke all on public.profiles from anon, authenticated;
revoke all on public.journey_events from anon, authenticated;
grant select on public.profiles to authenticated;
grant update (full_name, phone, location, farm_size_ha, lang) on public.profiles to authenticated;
grant select on public.journey_events to authenticated;

-- ---------------------------------------------------------------- app API (signed-in users)
create or replace function private.profile_json(p public.profiles) returns jsonb
  language sql stable security definer set search_path = '' as $$
  select jsonb_build_object(
    'id', p.id,
    'email', (select email from auth.users where id = p.id),
    'fullName', p.full_name, 'phone', p.phone, 'location', p.location,
    'farmSizeHa', p.farm_size_ha, 'role', p.role, 'lang', p.lang,
    'createdAt', p.created_at);
$$;

create or replace function private.journey_json(cid uuid) returns jsonb
  language sql stable security definer set search_path = '' as $$
  select jsonb_build_object(
    'stages', to_jsonb(enum_range(null::public.journey_stage)),
    'current', coalesce((select stage from public.journey_events where client_id = cid
                         order by created_at desc, id desc limit 1), 'signed_up'),
    'events', coalesce((select jsonb_agg(jsonb_build_object(
                 'id', e.id, 'stage', e.stage, 'note', e.note, 'at', e.created_at, 'by', a.full_name)
                 order by e.created_at, e.id)
               from public.journey_events e left join public.profiles a on a.id = e.created_by
               where e.client_id = cid), '[]'::jsonb));
$$;

/** The signed-in user's profile and whether this session passed 2-step. */
create or replace function public.me() returns jsonb
  language plpgsql stable security definer set search_path = '' as $$
declare p public.profiles;
begin
  select * into p from public.profiles where id = auth.uid();
  if not found then return null; end if;
  return jsonb_build_object('verified', private.session_ok(), 'emailVerified', p.email_verified,
                            'profile', case when private.session_ok() then private.profile_json(p) end);
end $$;

create or replace function public.my_journey() returns jsonb
  language plpgsql stable security definer set search_path = '' as $$
begin
  if not private.session_ok() then raise exception 'not_verified' using errcode = '42501'; end if;
  return private.journey_json(auth.uid());
end $$;

create or replace function public.update_my_profile(patch jsonb) returns jsonb
  language plpgsql security definer set search_path = '' as $$
declare p public.profiles;
begin
  if not private.session_ok() then raise exception 'not_verified' using errcode = '42501'; end if;
  update public.profiles set
    full_name = case when patch ? 'fullName' then left(trim(patch ->> 'fullName'), 120) else full_name end,
    phone = case when patch ? 'phone' then nullif(trim(patch ->> 'phone'), '') else phone end,
    location = case when patch ? 'location' then left(nullif(trim(patch ->> 'location'), ''), 120) else location end,
    farm_size_ha = case when patch ? 'farmSizeHa' then nullif(patch ->> 'farmSizeHa', '')::numeric else farm_size_ha end,
    lang = case when patch ->> 'lang' in ('en', 'fr') then patch ->> 'lang' else lang end
  where id = auth.uid() returning * into p;
  return private.profile_json(p);
end $$;

-- ---------------------------------------------------------------- staff API
create or replace function public.admin_list_clients(q text default '', stage_filter text default '',
                                                     staff boolean default false, page int default 1)
  returns jsonb language plpgsql stable security definer set search_path = '' as $$
declare
  per int := 50;
  pg int := greatest(page, 1);
  pat text := '%' || replace(replace(replace(left(coalesce(q, ''), 100), '\', '\\'), '%', '\%'), '_', '\_') || '%';
  result jsonb;
begin
  if not private.is_staff() then raise exception 'forbidden' using errcode = '42501'; end if;
  if staff and not private.is_super_admin() then raise exception 'forbidden' using errcode = '42501'; end if;
  with base as (
    select p.*, u.email,
           coalesce((select e.stage::text from public.journey_events e where e.client_id = p.id
                     order by e.created_at desc, e.id desc limit 1), 'signed_up') as stage,
           (select max(e.created_at) from public.journey_events e where e.client_id = p.id) as stage_at
      from public.profiles p join auth.users u on u.id = p.id
     where (case when staff then p.role in ('admin', 'super_admin') else p.role = 'client' end)
       and (coalesce(q, '') = '' or p.full_name ilike pat or u.email ilike pat or p.phone ilike pat or p.location ilike pat)
  ), filtered as (
    select * from base where coalesce(stage_filter, '') = '' or stage = stage_filter
  )
  select jsonb_build_object(
    'clients', coalesce((select jsonb_agg(private.profile_json(row(f.id, f.full_name, f.phone, f.location, f.farm_size_ha, f.role, f.lang,
                                   f.email_verified, f.created_at, f.updated_at)::public.profiles)
                                 || jsonb_build_object('stage', f.stage, 'stageAt', f.stage_at)
                                 order by f.stage_at desc nulls last, f.created_at desc)
                         from (select * from filtered order by stage_at desc nulls last, created_at desc
                               limit per offset (pg - 1) * per) f), '[]'::jsonb),
    'total', (select count(*) from filtered),
    'page', pg, 'perPage', per,
    'stageCounts', (select jsonb_object_agg(s, (select count(*) from public.profiles p2
                       where p2.role = 'client' and coalesce((select e.stage::text from public.journey_events e
                         where e.client_id = p2.id order by e.created_at desc, e.id desc limit 1), 'signed_up') = s))
                    from unnest(enum_range(null::public.journey_stage)::text[]) s),
    'staffCount', (select count(*) from public.profiles where role in ('admin', 'super_admin'))
  ) into result;
  return result;
end $$;

create or replace function public.admin_get_client(client uuid) returns jsonb
  language plpgsql stable security definer set search_path = '' as $$
declare p public.profiles;
begin
  if not private.is_staff() then raise exception 'forbidden' using errcode = '42501'; end if;
  select * into p from public.profiles where id = client;
  if not found then raise exception 'not_found' using errcode = 'P0002'; end if;
  return jsonb_build_object('profile', private.profile_json(p), 'journey', private.journey_json(client));
end $$;

create or replace function public.admin_add_event(client uuid, stage text, note text default null) returns jsonb
  language plpgsql security definer set search_path = '' as $$
begin
  if not private.is_staff() then raise exception 'forbidden' using errcode = '42501'; end if;
  if not exists (select 1 from public.profiles where id = client) then raise exception 'not_found' using errcode = 'P0002'; end if;
  insert into public.journey_events (client_id, stage, note, created_by)
    values (client, stage::public.journey_stage, left(nullif(trim(note), ''), 1000), auth.uid());
  return private.journey_json(client);
end $$;

create or replace function public.admin_set_role(target uuid, new_role text) returns jsonb
  language plpgsql security definer set search_path = '' as $$
declare p public.profiles;
begin
  if not private.is_super_admin() then raise exception 'forbidden' using errcode = '42501'; end if;
  if new_role not in ('client', 'admin') or target = auth.uid() then raise exception 'forbidden' using errcode = '42501'; end if;
  update public.profiles set role = new_role::public.user_role
    where id = target and role <> 'super_admin' returning * into p;
  if not found then raise exception 'forbidden' using errcode = '42501'; end if;
  return private.profile_json(p);
end $$;

revoke all on function public.me(), public.my_journey(), public.update_my_profile(jsonb),
  public.admin_list_clients(text, text, boolean, int), public.admin_get_client(uuid),
  public.admin_add_event(uuid, text, text), public.admin_set_role(uuid, text) from public, anon;
grant execute on function public.me(), public.my_journey(), public.update_my_profile(jsonb),
  public.admin_list_clients(text, text, boolean, int), public.admin_get_client(uuid),
  public.admin_add_event(uuid, text, text), public.admin_set_role(uuid, text) to authenticated;

-- ---------------------------------------------------------------- Edge Function API (service_role only)
-- Rate limit: true if allowed (and records the event).
create or replace function public.svc_rate(kind text, key text, max_count int, minutes int) returns boolean
  language plpgsql security definer set search_path = '' as $$
begin
  if (select count(*) from private.rate_events r
       where r.kind = svc_rate.kind and r.key = svc_rate.key
         and r.created_at > now() - make_interval(mins => minutes)) >= max_count then
    return false;
  end if;
  insert into private.rate_events (kind, key) values (svc_rate.kind, svc_rate.key);
  if random() < 0.02 then
    delete from private.rate_events where created_at < now() - interval '2 days';
    delete from private.auth_challenges where expires_at < now();
    delete from private.verified_sessions where expires_at < now();
    delete from private.trusted_devices where expires_at < now();
  end if;
  return true;
end $$;

create or replace function public.svc_user(uid uuid default null, mail text default null) returns jsonb
  language sql stable security definer set search_path = '' as $$
  select jsonb_build_object('id', u.id, 'email', u.email, 'fullName', p.full_name, 'lang', p.lang,
                            'emailVerified', p.email_verified)
    from auth.users u join public.profiles p on p.id = u.id
   where (uid is not null and u.id = uid) or (mail is not null and lower(u.email) = lower(mail))
   limit 1;
$$;

/** New challenge: returns {token, code}; replaces any open challenge of that purpose. */
create or replace function public.svc_start_challenge(uid uuid, purpose text, ttl_minutes int default 10) returns jsonb
  language plpgsql security definer set search_path = '' as $$
declare
  token text := encode(extensions.gen_random_bytes(32), 'hex');
  code text := lpad((('x' || encode(extensions.gen_random_bytes(4), 'hex'))::bit(32)::bigint % 1000000)::text, 6, '0');
begin
  delete from private.auth_challenges c where c.user_id = uid and c.purpose = svc_start_challenge.purpose;
  insert into private.auth_challenges (token_hash, user_id, purpose, code_hash, expires_at)
    values (private.hmac(token), uid, svc_start_challenge.purpose, private.hmac(code),
            now() + make_interval(mins => ttl_minutes));
  return jsonb_build_object('token', token, 'code', code);
end $$;

/** Checks a code. Returns {ok, userId, purpose} or {ok:false, error, attemptsLeft}. */
create or replace function public.svc_verify_challenge(token text, code text, purposes text[], max_tries int default 5)
  returns jsonb language plpgsql security definer set search_path = '' as $$
declare c private.auth_challenges;
begin
  select * into c from private.auth_challenges
   where token_hash = private.hmac(token) and expires_at > now() and purpose = any(purposes)
   for update;
  if not found then return jsonb_build_object('ok', false, 'error', 'code_expired'); end if;
  if c.code_hash <> private.hmac(regexp_replace(coalesce(code, ''), '\D', '', 'g')) then
    if c.attempts + 1 >= max_tries then
      delete from private.auth_challenges where token_hash = c.token_hash;
      return jsonb_build_object('ok', false, 'error', 'code_expired');
    end if;
    update private.auth_challenges set attempts = attempts + 1 where token_hash = c.token_hash;
    return jsonb_build_object('ok', false, 'error', 'invalid_code', 'attemptsLeft', max_tries - c.attempts - 1);
  end if;
  delete from private.auth_challenges where token_hash = c.token_hash;
  return jsonb_build_object('ok', true, 'userId', c.user_id, 'purpose', c.purpose);
end $$;

/** New code for an open challenge (max once a minute, 5 sends). Returns {code, userId, purpose} or {error}. */
create or replace function public.svc_resend_challenge(token text, ttl_minutes int default 10) returns jsonb
  language plpgsql security definer set search_path = '' as $$
declare
  c private.auth_challenges;
  code text := lpad((('x' || encode(extensions.gen_random_bytes(4), 'hex'))::bit(32)::bigint % 1000000)::text, 6, '0');
begin
  select * into c from private.auth_challenges where token_hash = private.hmac(token) and expires_at > now() for update;
  if not found then return jsonb_build_object('error', 'code_expired'); end if;
  if c.sends >= 5 then return jsonb_build_object('error', 'too_many_attempts'); end if;
  if c.last_sent_at > now() - interval '60 seconds' then return jsonb_build_object('error', 'wait_before_resend'); end if;
  update private.auth_challenges
     set code_hash = private.hmac(code), attempts = 0, sends = sends + 1, last_sent_at = now(),
         expires_at = now() + make_interval(mins => ttl_minutes)
   where token_hash = c.token_hash;
  return jsonb_build_object('code', code, 'userId', c.user_id, 'purpose', c.purpose);
end $$;

/** Marks a session as having passed 2-step (lifetime matches a 30-day refresh). */
create or replace function public.svc_verify_session(sid uuid, uid uuid) returns void
  language sql security definer set search_path = '' as $$
  insert into private.verified_sessions (session_id, user_id, expires_at)
  values (sid, uid, now() + interval '30 days')
  on conflict (session_id) do update set expires_at = excluded.expires_at
  where private.verified_sessions.user_id = excluded.user_id;
$$;

create or replace function public.svc_trust_device(uid uuid, days int default 30) returns text
  language plpgsql security definer set search_path = '' as $$
declare token text := encode(extensions.gen_random_bytes(32), 'hex');
begin
  insert into private.trusted_devices (token_hash, user_id, expires_at)
    values (private.hmac(token), uid, now() + make_interval(days => days));
  return token;
end $$;

/** A short-lived device grant (minutes), e.g. right after a password reset. */
create or replace function public.svc_grant_device(uid uuid, minutes int) returns text
  language plpgsql security definer set search_path = '' as $$
declare token text := encode(extensions.gen_random_bytes(32), 'hex');
begin
  insert into private.trusted_devices (token_hash, user_id, expires_at)
    values (private.hmac(token), uid, now() + make_interval(mins => minutes));
  return token;
end $$;

create or replace function public.svc_device_ok(uid uuid, token text) returns boolean
  language sql stable security definer set search_path = '' as $$
  select exists (select 1 from private.trusted_devices
                  where token_hash = private.hmac(coalesce(token, '')) and user_id = uid and expires_at > now());
$$;

/** Email proven: mark it, confirm it in Supabase Auth, and apply the super admin list. */
create or replace function public.svc_email_verified(uid uuid) returns void
  language plpgsql security definer set search_path = '' as $$
begin
  update public.profiles set email_verified = true where id = uid;
  update auth.users set email_confirmed_at = coalesce(email_confirmed_at, now()) where id = uid;
  update public.profiles p set role = 'super_admin'
    from auth.users u
   where p.id = uid and u.id = uid and lower(u.email) in (select lower(email) from private.super_admin_emails);
end $$;

/** After a password reset or change: forget verified sessions and trusted devices, end other sign-ins. */
create or replace function public.svc_revoke_all(uid uuid, keep_session uuid default null) returns void
  language plpgsql security definer set search_path = '' as $$
begin
  delete from private.verified_sessions where user_id = uid and session_id is distinct from keep_session;
  delete from private.trusted_devices where user_id = uid;
  delete from private.auth_challenges where user_id = uid;
  delete from auth.sessions where user_id = uid and id is distinct from keep_session;
end $$;

do $$
declare f text;
begin
  foreach f in array array[
    'public.svc_rate(text, text, int, int)', 'public.svc_user(uuid, text)',
    'public.svc_start_challenge(uuid, text, int)', 'public.svc_verify_challenge(text, text, text[], int)',
    'public.svc_resend_challenge(text, int)', 'public.svc_verify_session(uuid, uuid)',
    'public.svc_trust_device(uuid, int)', 'public.svc_grant_device(uuid, int)',
    'public.svc_device_ok(uuid, text)', 'public.svc_email_verified(uuid)', 'public.svc_revoke_all(uuid, uuid)']
  loop
    execute format('revoke all on function %s from public, anon, authenticated', f);
    execute format('grant execute on function %s to service_role', f);
  end loop;
end $$;
