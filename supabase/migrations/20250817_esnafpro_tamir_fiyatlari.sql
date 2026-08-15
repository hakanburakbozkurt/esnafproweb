-- EsnafPRO tamir fiyat rehberi (marka → seri → model → hizmet fiyatı)
create table if not exists public.tamir_markalari (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  image_url text,
  sort_order integer not null default 0,
  aktif boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.tamir_serileri (
  id uuid primary key default gen_random_uuid(),
  marka_id uuid not null references public.tamir_markalari (id) on delete cascade,
  name text not null,
  slug text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  unique (marka_id, slug)
);

create table if not exists public.tamir_modelleri (
  id uuid primary key default gen_random_uuid(),
  seri_id uuid not null references public.tamir_serileri (id) on delete cascade,
  name text not null,
  slug text not null,
  image_url text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  unique (seri_id, slug)
);

create table if not exists public.tamir_fiyatlari (
  id uuid primary key default gen_random_uuid(),
  model_id uuid not null references public.tamir_modelleri (id) on delete cascade,
  category text not null,
  service_name text not null,
  price numeric(12, 2) not null,
  description text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists tamir_serileri_marka_id_idx on public.tamir_serileri (marka_id);
create index if not exists tamir_modelleri_seri_id_idx on public.tamir_modelleri (seri_id);
create index if not exists tamir_fiyatlari_model_id_idx on public.tamir_fiyatlari (model_id);
create index if not exists tamir_fiyatlari_model_category_idx
  on public.tamir_fiyatlari (model_id, category, sort_order);

alter table public.tamir_markalari enable row level security;
alter table public.tamir_serileri enable row level security;
alter table public.tamir_modelleri enable row level security;
alter table public.tamir_fiyatlari enable row level security;

drop policy if exists tamir_markalari_select_public on public.tamir_markalari;
create policy tamir_markalari_select_public
  on public.tamir_markalari
  for select
  to public
  using (aktif = true);

drop policy if exists tamir_serileri_select_public on public.tamir_serileri;
create policy tamir_serileri_select_public
  on public.tamir_serileri
  for select
  to public
  using (true);

drop policy if exists tamir_modelleri_select_public on public.tamir_modelleri;
create policy tamir_modelleri_select_public
  on public.tamir_modelleri
  for select
  to public
  using (true);

drop policy if exists tamir_fiyatlari_select_public on public.tamir_fiyatlari;
create policy tamir_fiyatlari_select_public
  on public.tamir_fiyatlari
  for select
  to public
  using (true);

comment on table public.tamir_markalari is 'Tamir fiyat sihirbazı — markalar (Apple, Samsung, …)';
comment on table public.tamir_serileri is 'Tamir fiyat sihirbazı — seriler (iPhone 17 Serisi, …)';
comment on table public.tamir_modelleri is 'Tamir fiyat sihirbazı — cihaz modelleri';
comment on table public.tamir_fiyatlari is 'Tamir fiyat sihirbazı — model bazlı hizmet fiyatları';
