-- Clients can delete their own account (Profile → Delete my account), after
-- typing their password again. Everything tied to the account goes with it:
-- profile, journey, farm, equipment, visits, sessions and codes.
create or replace function public.delete_my_account(password text) returns void
  language plpgsql security definer set search_path = '' as $$
begin
  perform private.require_session();
  if not public.svc_rate('delete_account', auth.uid()::text, 5, 15) then
    raise exception 'too_many_attempts' using errcode = '54000';
  end if;
  if not exists (select 1 from auth.users u where u.id = auth.uid()
                 and u.encrypted_password = extensions.crypt(coalesce(password, ''), u.encrypted_password)) then
    raise exception 'invalid_credentials' using errcode = '28P01';
  end if;
  -- The super admin is set in SQL; that account is not deleted from the app.
  if exists (select 1 from public.profiles where id = auth.uid() and role = 'super_admin') then
    raise exception 'forbidden' using errcode = '42501';
  end if;
  delete from auth.users where id = auth.uid();
end $$;

revoke all on function public.delete_my_account(text) from public, anon;
grant execute on function public.delete_my_account(text) to authenticated;
