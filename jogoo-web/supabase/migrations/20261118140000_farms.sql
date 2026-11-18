-- Each client describes their own farm (one per account) and the equipment on it.
-- Clients read and write them only through the my_* functions below (verified
-- session required); staff read them through admin_get_client.

create table public.farms (
  owner_id uuid primary key references public.profiles (id) on delete cascade,
  name text not null check (length(name) between 1 and 120),
  location text check (length(location) <= 160),
  area_ha numeric(10, 2) check (area_ha is null or (area_ha > 0 and area_ha < 1000000)),
  crops text[] not null default '{}',
  water_sources text[] not null default '{}',
  irrigation text check (length(irrigation) <= 60),
  -- Free-form extra details: [{"label": "...", "value": "..."}]
  extra jsonb not null default '[]' check (jsonb_typeof(extra) = 'array'),
  notes text check (length(notes) <= 2000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.farm_equipment (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete cascade,
  name text not null check (length(name) between 1 and 120),
  kind text check (length(kind) <= 40),
  serial text check (length(serial) <= 60),
  installed_on date,
  notes text check (length(notes) <= 1000),
  created_at timestamptz not null default now()
);
create index farm_equipment_owner on public.farm_equipment (owner_id, created_at);

alter table public.farms enable row level security;
alter table public.farm_equipment enable row level security;
revoke all on public.farms, public.farm_equipment from anon, authenticated;
-- No policies: no direct table access; everything goes through the functions.

-- ---------------------------------------------------------------- helpers
create or replace function private.clean_list(v jsonb, max_items int, max_len int) returns text[]
  language sql immutable set search_path = '' as $$
  -- Trimmed, non-empty, duplicates (any case) dropped, original order kept.
  select coalesce(array_agg(x order by o), '{}')
    from (select x, o
            from (select distinct on (lower(x)) x, o
                    from (select left(trim(e), max_len) as x, o
                            from jsonb_array_elements_text(case when jsonb_typeof(v) = 'array' then v else '[]'::jsonb end)
                                 with ordinality as t(e, o)) a
                   where x <> ''
                   order by lower(x), o) d
           order by o
           limit max_items) s;
$$;

create or replace function private.farm_json(cid uuid) returns jsonb
  language sql stable security definer set search_path = '' as $$
  select jsonb_build_object(
    'farm', (select jsonb_build_object(
               'name', f.name, 'location', f.location, 'areaHa', f.area_ha,
               'crops', to_jsonb(f.crops), 'waterSources', to_jsonb(f.water_sources),
               'irrigation', f.irrigation, 'extra', f.extra, 'notes', f.notes,
               'createdAt', f.created_at, 'updatedAt', f.updated_at)
               from public.farms f where f.owner_id = cid),
    'equipment', coalesce((select jsonb_agg(jsonb_build_object(
                   'id', e.id, 'name', e.name, 'kind', e.kind, 'serial', e.serial,
                   'installedOn', e.installed_on, 'notes', e.notes, 'createdAt', e.created_at)
                   order by e.created_at, e.id)
                   from public.farm_equipment e where e.owner_id = cid), '[]'::jsonb));
$$;

create or replace function private.require_session() returns void
  language plpgsql stable set search_path = '' as $$
begin
  if not private.session_ok() then raise exception 'not_verified' using errcode = '42501'; end if;
end $$;

-- ---------------------------------------------------------------- client API
create or replace function public.my_farm() returns jsonb
  language plpgsql stable security definer set search_path = '' as $$
begin
  perform private.require_session();
  return private.farm_json(auth.uid());
end $$;

/** Creates or replaces the caller's farm details. */
create or replace function public.save_my_farm(f jsonb) returns jsonb
  language plpgsql security definer set search_path = '' as $$
declare
  nm text := left(trim(coalesce(f ->> 'name', '')), 120);
  loc text := left(nullif(trim(coalesce(f ->> 'location', '')), ''), 160);
  area numeric := nullif(f ->> 'areaHa', '')::numeric;
  extra jsonb;
begin
  perform private.require_session();
  if nm = '' then raise exception 'invalid_name' using errcode = '22023'; end if;
  if area is not null and (area <= 0 or area >= 1000000) then raise exception 'invalid_area' using errcode = '22023'; end if;
  select coalesce(jsonb_agg(jsonb_build_object('label', l, 'value', v)), '[]'::jsonb) into extra
    from (select left(trim(coalesce(e ->> 'label', '')), 60) l, left(trim(coalesce(e ->> 'value', '')), 500) v
            from jsonb_array_elements(case when jsonb_typeof(f -> 'extra') = 'array' then f -> 'extra' else '[]'::jsonb end) e
           limit 30) s
   where l <> '' or v <> '';
  insert into public.farms as t (owner_id, name, location, area_ha, crops, water_sources, irrigation, extra, notes)
  values (auth.uid(), nm, loc, area,
          private.clean_list(f -> 'crops', 30, 40),
          private.clean_list(f -> 'waterSources', 10, 40),
          left(nullif(trim(coalesce(f ->> 'irrigation', '')), ''), 60),
          extra,
          left(nullif(trim(coalesce(f ->> 'notes', '')), ''), 2000))
  on conflict (owner_id) do update set
    name = excluded.name, location = excluded.location, area_ha = excluded.area_ha,
    crops = excluded.crops, water_sources = excluded.water_sources, irrigation = excluded.irrigation,
    extra = excluded.extra, notes = excluded.notes, updated_at = now();
  -- Keep the account's summary (shown in the staff list) in step with the farm.
  update public.profiles set location = coalesce(loc, location), farm_size_ha = area where id = auth.uid();
  return private.farm_json(auth.uid());
end $$;

/** Adds (no id) or updates (with id) one piece of the caller's equipment. */
create or replace function public.save_my_equipment(e jsonb) returns jsonb
  language plpgsql security definer set search_path = '' as $$
declare
  nm text := left(trim(coalesce(e ->> 'name', '')), 120);
  eid uuid := nullif(e ->> 'id', '')::uuid;
  inst date := nullif(e ->> 'installedOn', '')::date;
begin
  perform private.require_session();
  if nm = '' then raise exception 'invalid_name' using errcode = '22023'; end if;
  if inst is not null and (inst > current_date + 366 or inst < date '1950-01-01') then
    raise exception 'invalid_date' using errcode = '22023';
  end if;
  if eid is null then
    if (select count(*) from public.farm_equipment where owner_id = auth.uid()) >= 100 then
      raise exception 'too_many' using errcode = '22023';
    end if;
    insert into public.farm_equipment (owner_id, name, kind, serial, installed_on, notes)
    values (auth.uid(), nm, left(nullif(trim(coalesce(e ->> 'kind', '')), ''), 40),
            left(nullif(trim(coalesce(e ->> 'serial', '')), ''), 60), inst,
            left(nullif(trim(coalesce(e ->> 'notes', '')), ''), 1000));
  else
    update public.farm_equipment set name = nm,
      kind = left(nullif(trim(coalesce(e ->> 'kind', '')), ''), 40),
      serial = left(nullif(trim(coalesce(e ->> 'serial', '')), ''), 60),
      installed_on = inst,
      notes = left(nullif(trim(coalesce(e ->> 'notes', '')), ''), 1000)
    where id = eid and owner_id = auth.uid();
    if not found then raise exception 'not_found' using errcode = 'P0002'; end if;
  end if;
  return private.farm_json(auth.uid());
end $$;

create or replace function public.remove_my_equipment(eid uuid) returns jsonb
  language plpgsql security definer set search_path = '' as $$
begin
  perform private.require_session();
  delete from public.farm_equipment where id = eid and owner_id = auth.uid();
  return private.farm_json(auth.uid());
end $$;

-- ---------------------------------------------------------------- staff API
create or replace function public.admin_get_client(client uuid) returns jsonb
  language plpgsql stable security definer set search_path = '' as $$
declare p public.profiles;
begin
  if not private.is_staff() then raise exception 'forbidden' using errcode = '42501'; end if;
  select * into p from public.profiles where id = client;
  if not found then raise exception 'not_found' using errcode = 'P0002'; end if;
  return jsonb_build_object('profile', private.profile_json(p), 'journey', private.journey_json(client))
         || private.farm_json(client);
end $$;

-- ---------------------------------------------------------------- grants
revoke all on function private.clean_list(jsonb, int, int), private.farm_json(uuid), private.require_session()
  from public, anon, authenticated;
revoke all on function public.my_farm(), public.save_my_farm(jsonb), public.save_my_equipment(jsonb),
  public.remove_my_equipment(uuid) from public, anon;
grant execute on function public.my_farm(), public.save_my_farm(jsonb), public.save_my_equipment(jsonb),
  public.remove_my_equipment(uuid) to authenticated;
