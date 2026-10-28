-- Farm tenancy: every client-owned row hangs off a farm, and row-level
-- security limits each user to the farms they are a member of.

create schema if not exists private;

create table public.farms (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(trim(name)) > 0),
  created_by uuid not null default auth.uid()
    references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- PowerSync requires a single `id` primary key on every synced table.
create table public.farm_members (
  id uuid primary key default gen_random_uuid(),
  farm_id uuid not null references public.farms (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null default 'owner' check (role in ('owner', 'worker')),
  created_at timestamptz not null default now(),
  unique (farm_id, user_id)
);

create index farm_members_user_id_idx on public.farm_members (user_id);

-- Security-definer helpers avoid recursive RLS checks on farm_members.
create function private.is_farm_member(target_farm_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.farm_members
    where farm_id = target_farm_id and user_id = (select auth.uid())
  );
$$;

create function private.is_farm_owner(target_farm_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.farm_members
    where farm_id = target_farm_id
      and user_id = (select auth.uid())
      and role = 'owner'
  );
$$;

grant usage on schema private to authenticated;
grant execute on function private.is_farm_member(uuid) to authenticated;
grant execute on function private.is_farm_owner(uuid) to authenticated;

-- The creator of a farm becomes its owner.
create function private.add_farm_owner()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.farm_members (farm_id, user_id, role)
  values (new.id, new.created_by, 'owner');
  return new;
end;
$$;

create trigger farms_add_owner
after insert on public.farms
for each row execute function private.add_farm_owner();

create function private.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger farms_touch_updated_at
before update on public.farms
for each row execute function private.touch_updated_at();

alter table public.farms enable row level security;
alter table public.farm_members enable row level security;

revoke all on public.farms, public.farm_members from anon;

-- The creator check covers upserts, where the row is read back before the
-- owner-membership trigger has run.
create policy "Members can read their farms"
on public.farms for select to authenticated
using (
  created_by = (select auth.uid())
  or (select private.is_farm_member(id))
);

create policy "Users can create farms they own"
on public.farms for insert to authenticated
with check (created_by = (select auth.uid()));

create policy "Owners can update their farms"
on public.farms for update to authenticated
using ((select private.is_farm_owner(id)))
with check ((select private.is_farm_owner(id)));

create policy "Owners can delete their farms"
on public.farms for delete to authenticated
using ((select private.is_farm_owner(id)));

-- Membership changes (inviting workers) will go through a server function,
-- so clients only get read access here.
create policy "Members can read farm membership"
on public.farm_members for select to authenticated
using ((select private.is_farm_member(farm_id)));

-- PowerSync replicates from this publication.
create publication powersync for table public.farms, public.farm_members;
