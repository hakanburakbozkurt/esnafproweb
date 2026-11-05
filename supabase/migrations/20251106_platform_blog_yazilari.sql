-- Platform blog yazıları (EsnafPRO editoryal blog — organik SEO trafiği)
-- dukkan_blog_yazilari esnafların kendi vitrin yazıları içindir.
-- Bu tablo platformun kendi yazılarını tutar: /blog/[slug]

create table if not exists public.platform_blog_yazilari (
  id uuid primary key default gen_random_uuid(),
  baslik text not null,
  slug text not null unique,
  ozet text,
  icerik text,
  kapak_url text,
  kategori text not null default 'rehber',
  meta_title text,
  meta_description text,
  anahtar_kelime text,
  yazar_adi text not null default 'EsnafPRO',
  yayinda boolean not null default false,
  yayin_tarihi timestamptz,
  olusturan_id uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint platform_blog_yazilari_kategori_check check (
    kategori in (
      'rehber',
      'tamir',
      'ikinci-el',
      'dukkan-yonetimi',
      'pazaryeri',
      'yerel-seo',
      'duyuru'
    )
  )
);

create index if not exists platform_blog_yazilari_yayinda_idx
  on public.platform_blog_yazilari (yayinda, yayin_tarihi desc);

create index if not exists platform_blog_yazilari_kategori_idx
  on public.platform_blog_yazilari (kategori);

comment on table public.platform_blog_yazilari is
  'EsnafPRO platform blog yazıları — organik arama trafiği için editoryal içerik';
comment on column public.platform_blog_yazilari.ozet is
  'Liste kartlarında görünen kısa özet (140-200 karakter önerilir)';
comment on column public.platform_blog_yazilari.anahtar_kelime is
  'Yazının hedeflediği ana arama terimi — SEO takibi için';
comment on column public.platform_blog_yazilari.yayin_tarihi is
  'Yayına alındığı an; sıralama ve article:published_time için kullanılır';

-- ---------------------------------------------------------------------------
-- yayin_tarihi otomatik doldurma
-- ---------------------------------------------------------------------------

create or replace function public.platform_blog_set_yayin_tarihi()
returns trigger
language plpgsql
as $$
begin
  if new.yayinda and new.yayin_tarihi is null then
    new.yayin_tarihi := now();
  end if;

  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists platform_blog_yazilari_yayin_tarihi
  on public.platform_blog_yazilari;

create trigger platform_blog_yazilari_yayin_tarihi
  before insert or update on public.platform_blog_yazilari
  for each row
  execute function public.platform_blog_set_yayin_tarihi();

-- ---------------------------------------------------------------------------
-- RLS: herkes yayındakileri okur, yalnızca super admin yazar
-- (is_platform_super_admin → 20250813_rls_faqs_pricing_blog_service_devices.sql)
-- ---------------------------------------------------------------------------

alter table public.platform_blog_yazilari enable row level security;

drop policy if exists platform_blog_select_public on public.platform_blog_yazilari;
drop policy if exists platform_blog_select_super_admin on public.platform_blog_yazilari;
drop policy if exists platform_blog_insert_super_admin on public.platform_blog_yazilari;
drop policy if exists platform_blog_update_super_admin on public.platform_blog_yazilari;
drop policy if exists platform_blog_delete_super_admin on public.platform_blog_yazilari;

create policy platform_blog_select_public
  on public.platform_blog_yazilari
  for select
  to anon, authenticated
  using (yayinda = true);

create policy platform_blog_select_super_admin
  on public.platform_blog_yazilari
  for select
  to authenticated
  using (public.is_platform_super_admin());

create policy platform_blog_insert_super_admin
  on public.platform_blog_yazilari
  for insert
  to authenticated
  with check (public.is_platform_super_admin());

create policy platform_blog_update_super_admin
  on public.platform_blog_yazilari
  for update
  to authenticated
  using (public.is_platform_super_admin())
  with check (public.is_platform_super_admin());

create policy platform_blog_delete_super_admin
  on public.platform_blog_yazilari
  for delete
  to authenticated
  using (public.is_platform_super_admin());

-- ---------------------------------------------------------------------------
-- Super admin e-postası — SUPER_ADMIN_EMAILS env değeriyle senkron olmalı.
-- Buraya eklenmeyen hesap admin panelinde yazı kaydedemez (RLS reddeder).
-- ---------------------------------------------------------------------------

insert into public.platform_super_admin_emails (email)
values ('esnafpanelpro@gmail.com')
on conflict (email) do nothing;
