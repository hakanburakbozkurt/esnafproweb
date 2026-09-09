-- Global cihaz kataloğu (marka / model / kategori / temel özellikler)

create table if not exists public.cihaz_katalogu (
  id uuid primary key default gen_random_uuid(),
  category text not null check (
    category in ('phone', 'tablet', 'watch', 'computer', 'console')
  ),
  brand text not null,
  model_name text not null,
  base_specs jsonb not null default '{}'::jsonb,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  unique (category, brand, model_name)
);

create index if not exists cihaz_katalogu_category_brand_idx
  on public.cihaz_katalogu (category, brand);

create index if not exists cihaz_katalogu_brand_model_idx
  on public.cihaz_katalogu (brand, model_name);

comment on table public.cihaz_katalogu is
  'Platform geneli cihaz marka/model kataloğu; tüm modüller ortak havuzu kullanır.';

-- Mevcut phone_models / tablet_models kayıtlarını taşı
insert into public.cihaz_katalogu (category, brand, model_name, sort_order)
select 'phone', brand, name, coalesce(sort_order, 0)
from public.phone_models
on conflict (category, brand, model_name) do nothing;

insert into public.cihaz_katalogu (category, brand, model_name, sort_order)
select 'tablet', brand, model_name, coalesce(sort_order, 0)
from public.tablet_models
on conflict (category, brand, model_name) do nothing;

alter table public.cihaz_katalogu enable row level security;

drop policy if exists cihaz_katalogu_select_public on public.cihaz_katalogu;
create policy cihaz_katalogu_select_public
  on public.cihaz_katalogu
  for select
  to public
  using (true);

drop policy if exists cihaz_katalogu_insert_super_admin on public.cihaz_katalogu;
drop policy if exists cihaz_katalogu_update_super_admin on public.cihaz_katalogu;
drop policy if exists cihaz_katalogu_delete_super_admin on public.cihaz_katalogu;

create policy cihaz_katalogu_insert_super_admin
  on public.cihaz_katalogu
  for insert
  to authenticated
  with check (public.is_platform_super_admin());

create policy cihaz_katalogu_update_super_admin
  on public.cihaz_katalogu
  for update
  to authenticated
  using (public.is_platform_super_admin())
  with check (public.is_platform_super_admin());

create policy cihaz_katalogu_delete_super_admin
  on public.cihaz_katalogu
  for delete
  to authenticated
  using (public.is_platform_super_admin());

-- phone_models / tablet_models — süper admin yazma (geriye dönük uyumluluk)
drop policy if exists phone_models_insert_super_admin on public.phone_models;
drop policy if exists phone_models_update_super_admin on public.phone_models;
drop policy if exists phone_models_delete_super_admin on public.phone_models;

create policy phone_models_insert_super_admin
  on public.phone_models
  for insert
  to authenticated
  with check (public.is_platform_super_admin());

create policy phone_models_update_super_admin
  on public.phone_models
  for update
  to authenticated
  using (public.is_platform_super_admin())
  with check (public.is_platform_super_admin());

create policy phone_models_delete_super_admin
  on public.phone_models
  for delete
  to authenticated
  using (public.is_platform_super_admin());

drop policy if exists tablet_models_insert_super_admin on public.tablet_models;
drop policy if exists tablet_models_update_super_admin on public.tablet_models;
drop policy if exists tablet_models_delete_super_admin on public.tablet_models;

create policy tablet_models_insert_super_admin
  on public.tablet_models
  for insert
  to authenticated
  with check (public.is_platform_super_admin());

create policy tablet_models_update_super_admin
  on public.tablet_models
  for update
  to authenticated
  using (public.is_platform_super_admin())
  with check (public.is_platform_super_admin());

create policy tablet_models_delete_super_admin
  on public.tablet_models
  for delete
  to authenticated
  using (public.is_platform_super_admin());
