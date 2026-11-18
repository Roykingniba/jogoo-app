-- Clients must not be able to tell that staff accounts exist:
--  - their journey no longer carries the name of the staff member who moved it,
--  - their own profile no longer carries a role.
-- The staff app still gets both through the admin_* functions.

drop function if exists private.journey_json(uuid);
create or replace function private.journey_json(cid uuid, with_authors boolean default true) returns jsonb
  language sql stable security definer set search_path = '' as $$
  select jsonb_build_object(
    'stages', to_jsonb(enum_range(null::public.journey_stage)),
    'current', coalesce((select stage from public.journey_events where client_id = cid
                         order by created_at desc, id desc limit 1), 'signed_up'),
    'events', coalesce((select jsonb_agg(jsonb_build_object(
                 'id', e.id, 'stage', e.stage, 'note', e.note, 'at', e.created_at,
                 'by', case when with_authors then a.full_name end)
                 order by e.created_at, e.id)
               from public.journey_events e left join public.profiles a on a.id = e.created_by
               where e.client_id = cid), '[]'::jsonb));
$$;

create or replace function public.my_journey() returns jsonb
  language plpgsql stable security definer set search_path = '' as $$
begin
  if not private.session_ok() then raise exception 'not_verified' using errcode = '42501'; end if;
  return private.journey_json(auth.uid(), false);
end $$;

create or replace function public.me() returns jsonb
  language plpgsql stable security definer set search_path = '' as $$
declare p public.profiles; prof jsonb;
begin
  select * into p from public.profiles where id = auth.uid();
  if not found then return null; end if;
  if private.session_ok() then
    prof := private.profile_json(p);
    -- Only staff learn their role (the staff app needs it); clients see none.
    if p.role = 'client' then prof := prof - 'role'; end if;
  end if;
  return jsonb_build_object('verified', private.session_ok(), 'emailVerified', p.email_verified, 'profile', prof);
end $$;

create or replace function public.update_my_profile(patch jsonb) returns jsonb
  language plpgsql security definer set search_path = '' as $$
declare p public.profiles; prof jsonb;
begin
  if not private.session_ok() then raise exception 'not_verified' using errcode = '42501'; end if;
  update public.profiles set
    full_name = case when patch ? 'fullName' then left(trim(patch ->> 'fullName'), 120) else full_name end,
    phone = case when patch ? 'phone' then nullif(trim(patch ->> 'phone'), '') else phone end,
    location = case when patch ? 'location' then left(nullif(trim(patch ->> 'location'), ''), 120) else location end,
    farm_size_ha = case when patch ? 'farmSizeHa' then nullif(patch ->> 'farmSizeHa', '')::numeric else farm_size_ha end,
    lang = case when patch ->> 'lang' in ('en', 'fr') then patch ->> 'lang' else lang end
  where id = auth.uid() returning * into p;
  prof := private.profile_json(p);
  if p.role = 'client' then prof := prof - 'role'; end if;
  return prof;
end $$;

-- Clients read their own rows only through the functions above.
revoke select on public.journey_events from authenticated;
grant select (id, client_id, stage, note, created_at) on public.journey_events to authenticated;
