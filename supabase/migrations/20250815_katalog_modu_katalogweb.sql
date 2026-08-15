-- Katalog modu (vitrin hamburger menüsü) + katalogweb çok kiracılı sahiplik
alter table public.dukkanlar
  add column if not exists katalog_modu_aktif boolean not null default false;

comment on column public.dukkanlar.katalog_modu_aktif is
  'Aktifken vitrin menüsünde Katalog linki görünür.';

alter table public.katalogweb
  add column if not exists user_id uuid references auth.users (id) on delete cascade;

create index if not exists katalogweb_user_id_idx on public.katalogweb (user_id);
create index if not exists katalogweb_is_sold_idx on public.katalogweb (is_sold);
create index if not exists katalogweb_brand_model_idx on public.katalogweb (brand, model_name);

alter table public.katalogweb enable row level security;

drop policy if exists katalogweb_select_public_unsold on public.katalogweb;
create policy katalogweb_select_public_unsold
  on public.katalogweb
  for select
  to public
  using (is_sold = false);

drop policy if exists katalogweb_update_owner on public.katalogweb;
create policy katalogweb_update_owner
  on public.katalogweb
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- phone_models: marka/model filtre kaynağı (yoksa oluştur)
create table if not exists public.phone_models (
  id uuid primary key default gen_random_uuid(),
  brand text not null,
  model_name text not null,
  created_at timestamptz not null default now(),
  unique (brand, model_name)
);

alter table public.phone_models enable row level security;

drop policy if exists phone_models_select_public on public.phone_models;
create policy phone_models_select_public
  on public.phone_models
  for select
  to public
  using (true);
