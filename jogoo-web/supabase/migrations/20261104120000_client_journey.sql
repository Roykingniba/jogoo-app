-- Supabase (Postgres) version of server/sql/schema.mysql.sql.
-- Apply when moving client accounts from the cPanel PHP API to Supabase.
-- Users live in auth.users (Supabase Auth); this adds profiles + journey.

create type public.user_role as enum ('client', 'admin');
create type public.journey_stage as enum (
  'signed_up', 'contacted', 'site_visit', 'quote_sent',
  'payment_made', 'installation_scheduled', 'installed'
);

create table public.profiles (
  id            uuid primary key references auth.users (id) on delete cascade,
  full_name     text not null check (char_length(full_name) between 1 and 120),
  phone         text check (phone ~ '^[+0-9 ()-]{6,32}$'),
  location      text check (char_length(location) <= 120),
  farm_size_ha  numeric(8, 2) check (farm_size_ha >= 0),
  role          public.user_role not null default 'client',
  lang          text not null default 'en' check (lang in ('en', 'fr')),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table public.journey_events (
  id          uuid primary key default gen_random_uuid(),
  client_id   uuid not null references public.profiles (id) on delete cascade,
  stage       public.journey_stage not null,
  note        text check (char_length(note) <= 1000),
  created_by  uuid references public.profiles (id) on delete set null,
  created_at  timestamptz not null default now()
);
create index journey_events_client_idx on public.journey_events (client_id, created_at);

-- Current stage per client (latest event).
create view public.client_stage with (security_invoker = true) as
  select distinct on (client_id) client_id, stage, created_at as stage_at
  from public.journey_events order by client_id, created_at desc;

-- Helpers -------------------------------------------------------------------
create schema if not exists private;
create or replace function private.is_admin() returns boolean
  language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

-- New sign-ups: create the profile (from sign-up metadata) and the first step.
create or replace function private.handle_new_user() returns trigger
  language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, full_name, phone, location, farm_size_ha, lang)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data ->> 'full_name', ''), split_part(new.email, '@', 1)),
    nullif(new.raw_user_meta_data ->> 'phone', ''),
    nullif(new.raw_user_meta_data ->> 'location', ''),
    nullif(new.raw_user_meta_data ->> 'farm_size_ha', '')::numeric,
    coalesce(new.raw_user_meta_data ->> 'lang', 'en')
  );
  insert into public.journey_events (client_id, stage) values (new.id, 'signed_up');
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function private.handle_new_user();

-- Clients may not promote themselves.
create or replace function private.protect_role() returns trigger
  language plpgsql security definer set search_path = '' as $$
begin
  if new.role <> old.role and not private.is_admin() then
    raise exception 'only staff can change roles';
  end if;
  new.updated_at := now();
  return new;
end $$;
create trigger profiles_protect_role before update on public.profiles
  for each row execute function private.protect_role();

-- Row-level security ----------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.journey_events enable row level security;

create policy "own profile or staff" on public.profiles for select
  using (id = auth.uid() or private.is_admin());
create policy "update own profile or staff" on public.profiles for update
  using (id = auth.uid() or private.is_admin());

create policy "own journey or staff" on public.journey_events for select
  using (client_id = auth.uid() or private.is_admin());
create policy "staff add steps" on public.journey_events for insert
  with check (private.is_admin() and created_by = auth.uid());

grant execute on function private.is_admin() to authenticated;
