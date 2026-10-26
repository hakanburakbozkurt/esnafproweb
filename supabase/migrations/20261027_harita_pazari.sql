-- Harita Pazarı (yerel SEO raporu): ULTRA katmanı, sahibin kendi aboneliğini okuması,
-- tarama geçmişi ve haftalık rapor ayarları.

-- 1) Abonelik katmanına 'ultra'
alter table public.dukkan_subscriptions
  drop constraint if exists dukkan_subscriptions_tier_check;
alter table public.dukkan_subscriptions
  add constraint dukkan_subscriptions_tier_check check (tier in ('free', 'pro', 'ultra'));

comment on table public.dukkan_subscriptions is
  'Dükkan abonelik katmanı (free/pro/ultra), kota sayacı ve bitiş tarihi.';

-- 2) Dükkan sahibi yalnızca kendi abonelik satırını okuyabilir
drop policy if exists dukkan_subscriptions_select_owner on public.dukkan_subscriptions;
create policy dukkan_subscriptions_select_owner
  on public.dukkan_subscriptions
  for select
  to authenticated
  using (
    exists (
      select 1 from public.dukkanlar d
      where d.id = dukkan_subscriptions.dukkan_id
        and d.user_id = (select auth.uid())
    )
  );

-- 3) Tarama geçmişi. Google Maps Platform koşulları gereği yalnızca place_id ve sıra saklanır;
--    isim, puan, yorum sayısı gibi içerikler her görüntülemede Google'dan canlı alınır.
create table if not exists public.harita_pazari_taramalari (
  id uuid primary key default gen_random_uuid(),
  dukkan_id uuid not null references public.dukkanlar (id) on delete cascade,
  kendi_place_id text,
  kendi_sira integer check (kendi_sira between 1 and 20),
  siralama text[] not null default '{}' check (cardinality(siralama) <= 20),
  created_at timestamptz not null default now()
);

create index if not exists harita_pazari_taramalari_dukkan_tarih_idx
  on public.harita_pazari_taramalari (dukkan_id, created_at desc);

comment on table public.harita_pazari_taramalari is
  'Harita Pazarı günlük sıralama anlık görüntüsü: siralama = 5 km içindeki ilk 20 place_id (Google sırası).';

alter table public.harita_pazari_taramalari enable row level security;

drop policy if exists harita_pazari_taramalari_select_owner on public.harita_pazari_taramalari;
drop policy if exists harita_pazari_taramalari_insert_owner on public.harita_pazari_taramalari;

create policy harita_pazari_taramalari_select_owner
  on public.harita_pazari_taramalari
  for select
  to authenticated
  using (
    exists (
      select 1 from public.dukkanlar d
      where d.id = harita_pazari_taramalari.dukkan_id
        and d.user_id = (select auth.uid())
    )
  );

create policy harita_pazari_taramalari_insert_owner
  on public.harita_pazari_taramalari
  for insert
  to authenticated
  with check (
    exists (
      select 1 from public.dukkanlar d
      where d.id = harita_pazari_taramalari.dukkan_id
        and d.user_id = (select auth.uid())
    )
  );

-- 4) Haftalık rapor ayarları (gönderim ayrı aşamada)
create table if not exists public.harita_pazari_rapor_ayarlari (
  dukkan_id uuid primary key references public.dukkanlar (id) on delete cascade,
  eposta_aktif boolean not null default true,
  ayrintili boolean not null default false,
  gonderim_gunu smallint not null default 1 check (gonderim_gunu between 1 and 7),
  gonderim_saati smallint not null default 9 check (gonderim_saati between 0 and 23),
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

comment on column public.harita_pazari_rapor_ayarlari.gonderim_gunu is 'ISO hafta günü: 1 = Pazartesi … 7 = Pazar';

alter table public.harita_pazari_rapor_ayarlari enable row level security;

drop policy if exists harita_pazari_rapor_ayarlari_select_owner on public.harita_pazari_rapor_ayarlari;
drop policy if exists harita_pazari_rapor_ayarlari_insert_owner on public.harita_pazari_rapor_ayarlari;
drop policy if exists harita_pazari_rapor_ayarlari_update_owner on public.harita_pazari_rapor_ayarlari;

create policy harita_pazari_rapor_ayarlari_select_owner
  on public.harita_pazari_rapor_ayarlari
  for select
  to authenticated
  using (
    exists (
      select 1 from public.dukkanlar d
      where d.id = harita_pazari_rapor_ayarlari.dukkan_id
        and d.user_id = (select auth.uid())
    )
  );

create policy harita_pazari_rapor_ayarlari_insert_owner
  on public.harita_pazari_rapor_ayarlari
  for insert
  to authenticated
  with check (
    exists (
      select 1 from public.dukkanlar d
      where d.id = harita_pazari_rapor_ayarlari.dukkan_id
        and d.user_id = (select auth.uid())
    )
  );

create policy harita_pazari_rapor_ayarlari_update_owner
  on public.harita_pazari_rapor_ayarlari
  for update
  to authenticated
  using (
    exists (
      select 1 from public.dukkanlar d
      where d.id = harita_pazari_rapor_ayarlari.dukkan_id
        and d.user_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1 from public.dukkanlar d
      where d.id = harita_pazari_rapor_ayarlari.dukkan_id
        and d.user_id = (select auth.uid())
    )
  );
