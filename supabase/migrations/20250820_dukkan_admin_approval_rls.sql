-- Super admin: dükkan onay statüsü güncelleme (approval_status)

drop policy if exists dukkanlar_update_super_admin on public.dukkanlar;

create policy dukkanlar_update_super_admin
  on public.dukkanlar
  for update
  to authenticated
  using (public.is_platform_super_admin())
  with check (public.is_platform_super_admin());

comment on policy dukkanlar_update_super_admin on public.dukkanlar is
  'Platform super admin dükkan onay statüsünü (approval_status) güncelleyebilir.';
