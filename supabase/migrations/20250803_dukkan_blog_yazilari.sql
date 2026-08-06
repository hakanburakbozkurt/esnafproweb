-- Dükkan blog yazıları (yerel SEO / GEO içerik)
create table if not exists public.dukkan_blog_yazilari (
  id uuid primary key default gen_random_uuid(),
  dukkan_id uuid not null references public.dukkanlar (id) on delete cascade,
  baslik text not null,
  slug text not null,
  icerik text,
  yayinda boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint dukkan_blog_yazilari_dukkan_slug_key unique (dukkan_id, slug)
);

create index if not exists dukkan_blog_yazilari_dukkan_id_idx
  on public.dukkan_blog_yazilari (dukkan_id);

comment on table public.dukkan_blog_yazilari is
  'Esnaf vitrin blog yazıları — yerel SEO ve GEO görünürlüğü için';
