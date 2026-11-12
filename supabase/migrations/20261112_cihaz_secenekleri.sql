-- Cihaz ekleme formundaki seçenekler (renk, kapasite, model) süper admin tarafından yönetilir.
-- Tabloda kayıt yoksa uygulama sabit listelere (src/lib/cihaz/types.ts) düşer.

create table if not exists public.cihaz_secenekleri (
  id uuid primary key default gen_random_uuid(),
  kategori text not null check (kategori in ('telefon', 'tablet', 'bilgisayar')),
  tur text not null check (tur in ('renk', 'kapasite', 'model')),
  deger text not null check (char_length(trim(deger)) between 1 and 80),
  sira integer not null default 0,
  created_at timestamptz not null default now(),
  constraint cihaz_secenekleri_benzersiz unique (kategori, tur, deger)
);

create index if not exists cihaz_secenekleri_kategori_tur_idx
  on public.cihaz_secenekleri (kategori, tur, sira);

comment on table public.cihaz_secenekleri is
  'Cihaz formu seçenekleri — süper admin Cihaz Kataloğu ekranından yönetir';

alter table public.cihaz_secenekleri enable row level security;

drop policy if exists cihaz_secenekleri_select_all on public.cihaz_secenekleri;
drop policy if exists cihaz_secenekleri_insert_super_admin on public.cihaz_secenekleri;
drop policy if exists cihaz_secenekleri_update_super_admin on public.cihaz_secenekleri;
drop policy if exists cihaz_secenekleri_delete_super_admin on public.cihaz_secenekleri;

-- Seçenekler herkese açık listelerdir (form ve vitrin okur)
create policy cihaz_secenekleri_select_all
  on public.cihaz_secenekleri
  for select
  to anon, authenticated
  using (true);

create policy cihaz_secenekleri_insert_super_admin
  on public.cihaz_secenekleri
  for insert
  to authenticated
  with check (public.is_platform_super_admin());

create policy cihaz_secenekleri_update_super_admin
  on public.cihaz_secenekleri
  for update
  to authenticated
  using (public.is_platform_super_admin())
  with check (public.is_platform_super_admin());

create policy cihaz_secenekleri_delete_super_admin
  on public.cihaz_secenekleri
  for delete
  to authenticated
  using (public.is_platform_super_admin());
