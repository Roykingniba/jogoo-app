-- Visit tracking: when JOGOO plans a site visit (or installation, service...)
-- the client follows it in the Service tab: who the technician is (name, photo,
-- phone), where he stays, his whole itinerary step by step, and the details.
-- Staff create and update everything in the staff app; clients only read their own.

create table public.technicians (
  id uuid primary key default gen_random_uuid(),
  full_name text not null check (length(full_name) between 1 and 120),
  role text check (length(role) <= 80),
  phone text check (length(phone) <= 32),
  -- Path in the public "technicians" storage bucket (random file name).
  photo_path text check (length(photo_path) <= 200),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.visits (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.profiles (id) on delete cascade,
  technician_id uuid references public.technicians (id) on delete set null,
  kind text not null default 'site_visit'
    check (kind in ('site_visit', 'installation', 'maintenance', 'repair', 'training', 'other')),
  status text not null default 'planned'
    check (status in ('planned', 'confirmed', 'on_the_way', 'on_site', 'done', 'cancelled')),
  starts_at timestamptz not null,
  ends_at timestamptz,
  site_address text check (length(site_address) <= 200),
  purpose text check (length(purpose) <= 2000),
  -- Where the technician stays.
  hotel_name text check (length(hotel_name) <= 120),
  hotel_address text check (length(hotel_address) <= 200),
  hotel_phone text check (length(hotel_phone) <= 32),
  check_in date,
  check_out date,
  transport text check (length(transport) <= 200),
  -- What the client should have ready.
  to_prepare text check (length(to_prepare) <= 2000),
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at is null or ends_at >= starts_at),
  check (check_out is null or check_in is null or check_out >= check_in)
);
create index visits_client on public.visits (client_id, starts_at desc);
create index visits_upcoming on public.visits (starts_at) where status not in ('done', 'cancelled');

create table public.visit_steps (
  id uuid primary key default gen_random_uuid(),
  visit_id uuid not null references public.visits (id) on delete cascade,
  position int not null,
  title text not null check (length(title) between 1 and 120),
  place text check (length(place) <= 160),
  planned_at timestamptz,
  done_at timestamptz,
  note text check (length(note) <= 500)
);
create index visit_steps_visit on public.visit_steps (visit_id, position);

alter table public.technicians enable row level security;
alter table public.visits enable row level security;
alter table public.visit_steps enable row level security;
revoke all on public.technicians, public.visits, public.visit_steps from anon, authenticated;
-- No policies: everything goes through the functions below.

-- ---------------------------------------------------------------- helpers
create or replace function private.photo_url(path text) returns text
  language sql stable set search_path = '' as $$
  select case when path is null or path = '' then null
    else (select value from private.settings where key = 'storage_public_url') || '/technicians/' || path end;
$$;

create or replace function private.technician_json(t public.technicians, for_staff boolean) returns jsonb
  language sql stable set search_path = '' as $$
  select case when t.id is null then null else jsonb_build_object(
    'id', t.id, 'name', t.full_name, 'role', t.role, 'phone', t.phone,
    'photoUrl', private.photo_url(t.photo_path))
    || case when for_staff then jsonb_build_object('photoPath', t.photo_path, 'active', t.active) else '{}'::jsonb end
  end;
$$;

create or replace function private.visit_json(v public.visits, for_staff boolean) returns jsonb
  language sql stable security definer set search_path = '' as $$
  select jsonb_build_object(
    'id', v.id, 'clientId', v.client_id, 'kind', v.kind, 'status', v.status,
    'startsAt', v.starts_at, 'endsAt', v.ends_at, 'siteAddress', v.site_address, 'purpose', v.purpose,
    'hotel', case when v.hotel_name is null and v.hotel_address is null then null else jsonb_build_object(
      'name', v.hotel_name, 'address', v.hotel_address, 'phone', v.hotel_phone,
      'checkIn', v.check_in, 'checkOut', v.check_out) end,
    'transport', v.transport, 'toPrepare', v.to_prepare, 'updatedAt', v.updated_at,
    'technician', (select private.technician_json(t, for_staff) from public.technicians t where t.id = v.technician_id),
    'steps', coalesce((select jsonb_agg(jsonb_build_object(
        'id', s.id, 'title', s.title, 'place', s.place, 'plannedAt', s.planned_at,
        'doneAt', s.done_at, 'note', s.note) order by s.position, s.id)
      from public.visit_steps s where s.visit_id = v.id), '[]'::jsonb));
$$;

-- ---------------------------------------------------------------- client API
/** The caller's visits: upcoming first (soonest first), then past ones. */
create or replace function public.my_visits() returns jsonb
  language plpgsql stable security definer set search_path = '' as $$
begin
  perform private.require_session();
  return coalesce((select jsonb_agg(private.visit_json(v, false)
      order by (v.status in ('done', 'cancelled')),
               case when v.status in ('done', 'cancelled') then null else v.starts_at end asc,
               v.starts_at desc)
    from public.visits v where v.client_id = auth.uid()), '[]'::jsonb);
end $$;

-- ---------------------------------------------------------------- staff API
create or replace function private.require_staff() returns void
  language plpgsql stable set search_path = '' as $$
begin
  if not private.is_staff() then raise exception 'forbidden' using errcode = '42501'; end if;
end $$;

create or replace function public.admin_list_technicians() returns jsonb
  language plpgsql stable security definer set search_path = '' as $$
begin
  perform private.require_staff();
  return coalesce((select jsonb_agg(private.technician_json(t, true) order by not t.active, t.full_name)
    from public.technicians t), '[]'::jsonb);
end $$;

/** Adds (no id) or updates (with id) a technician; returns the whole list. */
create or replace function public.admin_save_technician(t jsonb) returns jsonb
  language plpgsql security definer set search_path = '' as $$
declare
  tid uuid := nullif(t ->> 'id', '')::uuid;
  nm text := left(trim(coalesce(t ->> 'name', '')), 120);
  ph text := left(nullif(trim(coalesce(t ->> 'photoPath', '')), ''), 200);
begin
  perform private.require_staff();
  if nm = '' then raise exception 'invalid_name' using errcode = '22023'; end if;
  if ph is not null and ph !~ '^[a-z0-9-]{8,64}\.(jpg|jpeg|png|webp)$' then raise exception 'invalid_photo' using errcode = '22023'; end if;
  if tid is null then
    insert into public.technicians (full_name, role, phone, photo_path, active)
    values (nm, left(nullif(trim(coalesce(t ->> 'role', '')), ''), 80), left(nullif(trim(coalesce(t ->> 'phone', '')), ''), 32),
            ph, coalesce((t ->> 'active')::boolean, true));
  else
    update public.technicians set full_name = nm,
      role = left(nullif(trim(coalesce(t ->> 'role', '')), ''), 80),
      phone = left(nullif(trim(coalesce(t ->> 'phone', '')), ''), 32),
      photo_path = ph,
      active = coalesce((t ->> 'active')::boolean, active)
    where id = tid;
    if not found then raise exception 'not_found' using errcode = 'P0002'; end if;
  end if;
  return public.admin_list_technicians();
end $$;

/** One client's visits (client given), or every upcoming visit (client null). */
create or replace function public.admin_list_visits(client uuid default null) returns jsonb
  language plpgsql stable security definer set search_path = '' as $$
begin
  perform private.require_staff();
  if client is not null then
    return coalesce((select jsonb_agg(private.visit_json(v, true) order by v.starts_at desc)
      from public.visits v where v.client_id = client), '[]'::jsonb);
  end if;
  return coalesce((select jsonb_agg(private.visit_json(v, true)
        || jsonb_build_object('clientName', p.full_name, 'clientPhone', p.phone) order by v.starts_at)
      from public.visits v join public.profiles p on p.id = v.client_id
     where v.status not in ('done', 'cancelled') or v.starts_at > now() - interval '2 days'), '[]'::jsonb);
end $$;

/**
 * Creates (no id) or updates (with id) a visit with its whole itinerary.
 * Steps: [{id?, title, place, plannedAt, doneAt, note}] in order; steps not
 * listed are removed.
 */
create or replace function public.admin_save_visit(v jsonb) returns jsonb
  language plpgsql security definer set search_path = '' as $$
declare
  vid uuid := nullif(v ->> 'id', '')::uuid;
  cid uuid := nullif(v ->> 'clientId', '')::uuid;
  row public.visits;
  st jsonb;
  pos int := 0;
  keep uuid[] := '{}';
  sid uuid;
  txt text := '';
begin
  perform private.require_staff();
  if nullif(v ->> 'startsAt', '') is null then raise exception 'invalid_date' using errcode = '22023'; end if;
  if vid is null then
    if cid is null or not exists (select 1 from public.profiles where id = cid) then
      raise exception 'not_found' using errcode = 'P0002';
    end if;
    insert into public.visits (client_id, starts_at, created_by) values (cid, (v ->> 'startsAt')::timestamptz, auth.uid())
      returning * into row;
    vid := row.id;
  elsif not exists (select 1 from public.visits where id = vid) then
    raise exception 'not_found' using errcode = 'P0002';
  end if;

  update public.visits set
    technician_id = nullif(v ->> 'technicianId', '')::uuid,
    kind = coalesce(nullif(v ->> 'kind', ''), 'site_visit'),
    status = coalesce(nullif(v ->> 'status', ''), 'planned'),
    starts_at = (v ->> 'startsAt')::timestamptz,
    ends_at = nullif(v ->> 'endsAt', '')::timestamptz,
    site_address = left(nullif(trim(coalesce(v ->> 'siteAddress', '')), ''), 200),
    purpose = left(nullif(trim(coalesce(v ->> 'purpose', '')), ''), 2000),
    hotel_name = left(nullif(trim(coalesce(v #>> '{hotel,name}', '')), ''), 120),
    hotel_address = left(nullif(trim(coalesce(v #>> '{hotel,address}', '')), ''), 200),
    hotel_phone = left(nullif(trim(coalesce(v #>> '{hotel,phone}', '')), ''), 32),
    check_in = nullif(v #>> '{hotel,checkIn}', '')::date,
    check_out = nullif(v #>> '{hotel,checkOut}', '')::date,
    transport = left(nullif(trim(coalesce(v ->> 'transport', '')), ''), 200),
    to_prepare = left(nullif(trim(coalesce(v ->> 'toPrepare', '')), ''), 2000),
    updated_at = now()
  where id = vid returning * into row;

  for st in select * from jsonb_array_elements(case when jsonb_typeof(v -> 'steps') = 'array' then v -> 'steps' else '[]'::jsonb end) limit 40 loop
    txt := left(trim(coalesce(st ->> 'title', '')), 120);
    continue when txt = '';
    pos := pos + 1;
    sid := nullif(st ->> 'id', '')::uuid;
    if sid is not null and exists (select 1 from public.visit_steps where id = sid and visit_id = vid) then
      update public.visit_steps set position = pos, title = txt,
        place = left(nullif(trim(coalesce(st ->> 'place', '')), ''), 160),
        planned_at = nullif(st ->> 'plannedAt', '')::timestamptz,
        done_at = nullif(st ->> 'doneAt', '')::timestamptz,
        note = left(nullif(trim(coalesce(st ->> 'note', '')), ''), 500)
      where id = sid;
    else
      insert into public.visit_steps (visit_id, position, title, place, planned_at, done_at, note)
      values (vid, pos, txt, left(nullif(trim(coalesce(st ->> 'place', '')), ''), 160),
              nullif(st ->> 'plannedAt', '')::timestamptz, nullif(st ->> 'doneAt', '')::timestamptz,
              left(nullif(trim(coalesce(st ->> 'note', '')), ''), 500))
      returning id into sid;
    end if;
    keep := keep || sid;
  end loop;
  delete from public.visit_steps where visit_id = vid and not (id = any (keep));

  return private.visit_json(row, true);
end $$;

/** Ticks (or unticks) one itinerary step; "now" when the technician reports it. */
create or replace function public.admin_set_step_done(step uuid, done boolean) returns jsonb
  language plpgsql security definer set search_path = '' as $$
declare row public.visits;
begin
  perform private.require_staff();
  update public.visit_steps set done_at = case when done then coalesce(done_at, now()) else null end where id = step;
  if not found then raise exception 'not_found' using errcode = 'P0002'; end if;
  update public.visits set updated_at = now() where id = (select visit_id from public.visit_steps where id = step)
    returning * into row;
  return private.visit_json(row, true);
end $$;

-- ---------------------------------------------------------------- grants
revoke all on function private.photo_url(text), private.technician_json(public.technicians, boolean),
  private.visit_json(public.visits, boolean), private.require_staff() from public, anon, authenticated;
revoke all on function public.my_visits(), public.admin_list_technicians(), public.admin_save_technician(jsonb),
  public.admin_list_visits(uuid), public.admin_save_visit(jsonb), public.admin_set_step_done(uuid, boolean)
  from public, anon;
grant execute on function public.my_visits(), public.admin_list_technicians(), public.admin_save_technician(jsonb),
  public.admin_list_visits(uuid), public.admin_save_visit(jsonb), public.admin_set_step_done(uuid, boolean)
  to authenticated;
