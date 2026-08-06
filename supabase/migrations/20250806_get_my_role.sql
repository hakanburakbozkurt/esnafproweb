-- Oturum açan kullanıcının rolünü RLS sorunlarına karşı güvenli okur
create or replace function public.get_my_role()
returns text
language sql
security definer
set search_path = public
stable
as $$
  select role
  from public.kullanici_profilleri
  where id = auth.uid()
  limit 1;
$$;

revoke all on function public.get_my_role() from public;
grant execute on function public.get_my_role() to authenticated;

comment on function public.get_my_role() is
  'Oturum sahibinin kullanici_profilleri.role değerini döner';
