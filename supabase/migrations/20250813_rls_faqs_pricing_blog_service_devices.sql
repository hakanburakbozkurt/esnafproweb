-- RLS: faqs, pricing_plans, dukkan_blog_yazilari, service_devices
-- Canlı şema (MCP) doğrulaması:
--   service_devices → store_id (FK stores.id), user_id/dukkan_id YOK
--   faqs → context ('anasayfa' | 'fiyatlandirma')
--   dukkan_blog_yazilari → dukkan_id, kapak_url, yayinda

-- ---------------------------------------------------------------------------
-- Super admin yardımcıları (DB katmanı — uygulama SUPER_ADMIN_EMAILS ile eşleşmeli)
-- ---------------------------------------------------------------------------

create table if not exists public.platform_super_admin_emails (
  email text primary key check (email = lower(email))
);

comment on table public.platform_super_admin_emails is
  'Platform super admin e-postaları — RLS yazma yetkisi için. Uygulamadaki SUPER_ADMIN_EMAILS ile senkron tutun.';

alter table public.platform_super_admin_emails enable row level security;

drop policy if exists platform_super_admin_emails_no_public on public.platform_super_admin_emails;

create policy platform_super_admin_emails_no_public
  on public.platform_super_admin_emails
  for all
  to authenticated
  using (false)
  with check (false);

-- İlk super admin e-postasını ekleyin (gerekirse güncelleyin):
-- insert into public.platform_super_admin_emails (email)
-- values ('esnafpanelpro@gmail.com')
-- on conflict (email) do nothing;

create or replace function public.is_platform_super_admin()
returns boolean
language sql
stable
security definer
set search_path = public, auth
as $$
  select exists (
    select 1
    from auth.users u
    inner join public.platform_super_admin_emails a
      on lower(u.email) = a.email
    where u.id = auth.uid()
  );
$$;

comment on function public.is_platform_super_admin() is
  'JWT oturumundaki kullanıcı platform_super_admin_emails listesinde mi?';

create or replace function public.user_owns_store(p_store_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, auth
as $$
  select exists (
    select 1
    from public.stores s
    where s.id = p_store_id
      and s.owner_id = auth.uid()
  );
$$;

comment on function public.user_owns_store(uuid) is
  'stores tablosu RLS/policy bağımsız mağaza sahipliği kontrolü (service_devices için).';

-- ---------------------------------------------------------------------------
-- faqs
-- ---------------------------------------------------------------------------

alter table public.faqs enable row level security;

drop policy if exists faqs_select_public_active on public.faqs;
drop policy if exists faqs_select_super_admin on public.faqs;
drop policy if exists faqs_insert_super_admin on public.faqs;
drop policy if exists faqs_update_super_admin on public.faqs;
drop policy if exists faqs_delete_super_admin on public.faqs;

create policy faqs_select_public_active
  on public.faqs
  for select
  to anon, authenticated
  using (is_active = true);

create policy faqs_select_super_admin
  on public.faqs
  for select
  to authenticated
  using (public.is_platform_super_admin());

create policy faqs_insert_super_admin
  on public.faqs
  for insert
  to authenticated
  with check (public.is_platform_super_admin());

create policy faqs_update_super_admin
  on public.faqs
  for update
  to authenticated
  using (public.is_platform_super_admin())
  with check (public.is_platform_super_admin());

create policy faqs_delete_super_admin
  on public.faqs
  for delete
  to authenticated
  using (public.is_platform_super_admin());

-- ---------------------------------------------------------------------------
-- pricing_plans
-- ---------------------------------------------------------------------------

alter table public.pricing_plans enable row level security;

drop policy if exists pricing_plans_select_public_active on public.pricing_plans;
drop policy if exists pricing_plans_select_super_admin on public.pricing_plans;
drop policy if exists pricing_plans_insert_super_admin on public.pricing_plans;
drop policy if exists pricing_plans_update_super_admin on public.pricing_plans;
drop policy if exists pricing_plans_delete_super_admin on public.pricing_plans;

create policy pricing_plans_select_public_active
  on public.pricing_plans
  for select
  to anon, authenticated
  using (is_active = true);

create policy pricing_plans_select_super_admin
  on public.pricing_plans
  for select
  to authenticated
  using (public.is_platform_super_admin());

create policy pricing_plans_insert_super_admin
  on public.pricing_plans
  for insert
  to authenticated
  with check (public.is_platform_super_admin());

create policy pricing_plans_update_super_admin
  on public.pricing_plans
  for update
  to authenticated
  using (public.is_platform_super_admin())
  with check (public.is_platform_super_admin());

create policy pricing_plans_delete_super_admin
  on public.pricing_plans
  for delete
  to authenticated
  using (public.is_platform_super_admin());

-- ---------------------------------------------------------------------------
-- dukkan_blog_yazilari
-- ---------------------------------------------------------------------------

alter table public.dukkan_blog_yazilari enable row level security;

drop policy if exists dukkan_blog_select_public_published on public.dukkan_blog_yazilari;
drop policy if exists dukkan_blog_select_owner on public.dukkan_blog_yazilari;
drop policy if exists dukkan_blog_insert_owner on public.dukkan_blog_yazilari;
drop policy if exists dukkan_blog_update_owner on public.dukkan_blog_yazilari;
drop policy if exists dukkan_blog_delete_owner on public.dukkan_blog_yazilari;

create policy dukkan_blog_select_public_published
  on public.dukkan_blog_yazilari
  for select
  to anon, authenticated
  using (yayinda = true);

create policy dukkan_blog_select_owner
  on public.dukkan_blog_yazilari
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.dukkanlar d
      where d.id = dukkan_blog_yazilari.dukkan_id
        and d.user_id = auth.uid()
    )
  );

create policy dukkan_blog_insert_owner
  on public.dukkan_blog_yazilari
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.dukkanlar d
      where d.id = dukkan_blog_yazilari.dukkan_id
        and d.user_id = auth.uid()
    )
  );

create policy dukkan_blog_update_owner
  on public.dukkan_blog_yazilari
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.dukkanlar d
      where d.id = dukkan_blog_yazilari.dukkan_id
        and d.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.dukkanlar d
      where d.id = dukkan_blog_yazilari.dukkan_id
        and d.user_id = auth.uid()
    )
  );

create policy dukkan_blog_delete_owner
  on public.dukkan_blog_yazilari
  for delete
  to authenticated
  using (
    exists (
      select 1
      from public.dukkanlar d
      where d.id = dukkan_blog_yazilari.dukkan_id
        and d.user_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- service_devices (canlı kolonlar: store_id, device_code, customer_name,
--   device_model, issue_description, status, created_at)
-- Sahiplik: stores.owner_id = auth.uid()
-- ---------------------------------------------------------------------------

alter table public.service_devices enable row level security;

drop policy if exists service_devices_select_owner on public.service_devices;
drop policy if exists service_devices_insert_owner on public.service_devices;
drop policy if exists service_devices_update_owner on public.service_devices;
drop policy if exists service_devices_delete_owner on public.service_devices;

create policy service_devices_select_owner
  on public.service_devices
  for select
  to authenticated
  using (public.user_owns_store(store_id));

create policy service_devices_insert_owner
  on public.service_devices
  for insert
  to authenticated
  with check (public.user_owns_store(store_id));

create policy service_devices_update_owner
  on public.service_devices
  for update
  to authenticated
  using (public.user_owns_store(store_id))
  with check (public.user_owns_store(store_id));

create policy service_devices_delete_owner
  on public.service_devices
  for delete
  to authenticated
  using (public.user_owns_store(store_id));

-- Anon takip sayfası: doğrudan tablo SELECT yerine güvenli RPC (PII sızdırmaz)
drop function if exists public.get_service_device_public(text);

create or replace function public.get_service_device_public(p_device_code text)
returns table (
  id uuid,
  store_id uuid,
  device_code text,
  device_model text,
  issue_description text,
  status text,
  created_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select
    sd.id,
    sd.store_id,
    sd.device_code,
    sd.device_model,
    sd.issue_description,
    sd.status,
    sd.created_at
  from public.service_devices sd
  where sd.device_code = p_device_code
  limit 1;
$$;

revoke all on function public.get_service_device_public(text) from public;
grant execute on function public.get_service_device_public(text) to anon, authenticated;

comment on function public.get_service_device_public(text) is
  'Müşteri servis takip sayfası — customer_name hariç güvenli alanlar.';
