-- Dükkan abonelik / kota + tamir fiyat admin yazma yetkisi

create table if not exists public.dukkan_subscriptions (
  dukkan_id uuid primary key references public.dukkanlar (id) on delete cascade,
  tier text not null default 'free' check (tier in ('free', 'pro')),
  actions_used integer not null default 0 check (actions_used >= 0),
  actions_limit integer not null default 10 check (actions_limit > 0),
  expires_at timestamptz,
  notes text,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists dukkan_subscriptions_tier_idx
  on public.dukkan_subscriptions (tier, expires_at);

comment on table public.dukkan_subscriptions is
  'Dükkan abonelik katmanı (free/pro), kota sayacı ve bitiş tarihi.';

alter table public.dukkan_subscriptions enable row level security;

drop policy if exists dukkan_subscriptions_select_super_admin on public.dukkan_subscriptions;
drop policy if exists dukkan_subscriptions_insert_super_admin on public.dukkan_subscriptions;
drop policy if exists dukkan_subscriptions_update_super_admin on public.dukkan_subscriptions;
drop policy if exists dukkan_subscriptions_delete_super_admin on public.dukkan_subscriptions;

create policy dukkan_subscriptions_select_super_admin
  on public.dukkan_subscriptions
  for select
  to authenticated
  using (public.is_platform_super_admin());

create policy dukkan_subscriptions_insert_super_admin
  on public.dukkan_subscriptions
  for insert
  to authenticated
  with check (public.is_platform_super_admin());

create policy dukkan_subscriptions_update_super_admin
  on public.dukkan_subscriptions
  for update
  to authenticated
  using (public.is_platform_super_admin())
  with check (public.is_platform_super_admin());

create policy dukkan_subscriptions_delete_super_admin
  on public.dukkan_subscriptions
  for delete
  to authenticated
  using (public.is_platform_super_admin());

-- Tamir fiyat tabloları — super admin toplu güncelleme
drop policy if exists tamir_fiyatlari_update_super_admin on public.tamir_fiyatlari;
drop policy if exists tamir_fiyatlari_select_super_admin on public.tamir_fiyatlari;
drop policy if exists tamir_serileri_select_super_admin on public.tamir_serileri;
drop policy if exists tamir_modelleri_select_super_admin on public.tamir_modelleri;
drop policy if exists tamir_markalari_select_super_admin on public.tamir_markalari;

create policy tamir_fiyatlari_select_super_admin
  on public.tamir_fiyatlari
  for select
  to authenticated
  using (public.is_platform_super_admin());

create policy tamir_fiyatlari_update_super_admin
  on public.tamir_fiyatlari
  for update
  to authenticated
  using (public.is_platform_super_admin())
  with check (public.is_platform_super_admin());

create policy tamir_serileri_select_super_admin
  on public.tamir_serileri
  for select
  to authenticated
  using (public.is_platform_super_admin());

create policy tamir_modelleri_select_super_admin
  on public.tamir_modelleri
  for select
  to authenticated
  using (public.is_platform_super_admin());

create policy tamir_markalari_select_super_admin
  on public.tamir_markalari
  for select
  to authenticated
  using (public.is_platform_super_admin());
