-- Toptancı firma profili (slug, unvan, adres)
--
-- Kolon sözleşmesi (dukkanlar / wholesaler_xmls ile aynı):
--   id       = satır birincil anahtarı (uuid, varsayılan gen_random_uuid)
--   user_id  = auth.users(id) — oturum açan toptancı hesabı (birebir eşleşme)
--
-- NOT: id auth kullanıcısı DEĞİLDİR; sahiplik her zaman user_id üzerinden kontrol edilir.

create table if not exists public.toptancilar (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  firma_adi text not null,
  slug text not null,
  unvan text,
  adres text,
  telefon text,
  aktif boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Kısmi / eski tablo oluşturulmuşsa eksik kolonları tamamla
alter table public.toptancilar add column if not exists user_id uuid;
alter table public.toptancilar add column if not exists firma_adi text;
alter table public.toptancilar add column if not exists slug text;
alter table public.toptancilar add column if not exists unvan text;
alter table public.toptancilar add column if not exists adres text;
alter table public.toptancilar add column if not exists telefon text;
alter table public.toptancilar add column if not exists aktif boolean not null default true;
alter table public.toptancilar add column if not exists created_at timestamptz not null default now();
alter table public.toptancilar add column if not exists updated_at timestamptz not null default now();

-- user_id boş satır yoksa NOT NULL zorunluluğunu uygula
do $$
begin
  if not exists (select 1 from public.toptancilar where user_id is null) then
    alter table public.toptancilar alter column user_id set not null;
  end if;
end $$;

alter table public.toptancilar drop constraint if exists toptancilar_user_id_fkey;

alter table public.toptancilar
  add constraint toptancilar_user_id_fkey
  foreign key (user_id) references auth.users (id) on delete cascade;

create unique index if not exists toptancilar_user_id_key on public.toptancilar (user_id);
create unique index if not exists toptancilar_slug_key on public.toptancilar (slug);
create index if not exists toptancilar_user_id_idx on public.toptancilar (user_id);

comment on table public.toptancilar is
  'Toptancı firma profili — XML paneli ve slug tabanlı vitrin için';

comment on column public.toptancilar.id is
  'Satır birincil anahtarı';

comment on column public.toptancilar.user_id is
  'auth.users(id) — toptancı hesabının sahibi';

-- RLS
alter table public.toptancilar enable row level security;

drop policy if exists toptancilar_select_own on public.toptancilar;
drop policy if exists toptancilar_select_public_active on public.toptancilar;
drop policy if exists toptancilar_insert_own on public.toptancilar;
drop policy if exists toptancilar_update_own on public.toptancilar;
drop policy if exists toptancilar_delete_own on public.toptancilar;

create policy toptancilar_select_own
  on public.toptancilar
  for select
  to authenticated
  using (user_id = auth.uid());

create policy toptancilar_select_public_active
  on public.toptancilar
  for select
  to anon, authenticated
  using (aktif = true);

create policy toptancilar_insert_own
  on public.toptancilar
  for insert
  to authenticated
  with check (user_id = auth.uid());

create policy toptancilar_update_own
  on public.toptancilar
  for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy toptancilar_delete_own
  on public.toptancilar
  for delete
  to authenticated
  using (user_id = auth.uid());
