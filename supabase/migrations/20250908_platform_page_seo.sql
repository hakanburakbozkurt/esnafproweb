-- Platform çekirdek sayfaları SEO meta yönetimi (local admin)

create table if not exists public.platform_page_seo (
  page_path text primary key check (page_path ~ '^/[a-z0-9\-\/]*$'),
  label text not null,
  meta_title text not null,
  meta_description text not null,
  meta_keywords text,
  robots_index boolean not null default true,
  robots_follow boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists platform_page_seo_sort_idx
  on public.platform_page_seo (sort_order, page_path);

comment on table public.platform_page_seo is
  'EsnafPRO platform çekirdek sayfaları için title, description, keywords ve robots meta.';

alter table public.platform_page_seo enable row level security;

drop policy if exists platform_page_seo_select_public on public.platform_page_seo;
drop policy if exists platform_page_seo_insert_super_admin on public.platform_page_seo;
drop policy if exists platform_page_seo_update_super_admin on public.platform_page_seo;
drop policy if exists platform_page_seo_delete_super_admin on public.platform_page_seo;

create policy platform_page_seo_select_public
  on public.platform_page_seo
  for select
  to anon, authenticated
  using (true);

create policy platform_page_seo_insert_super_admin
  on public.platform_page_seo
  for insert
  to authenticated
  with check (public.is_platform_super_admin());

create policy platform_page_seo_update_super_admin
  on public.platform_page_seo
  for update
  to authenticated
  using (public.is_platform_super_admin())
  with check (public.is_platform_super_admin());

create policy platform_page_seo_delete_super_admin
  on public.platform_page_seo
  for delete
  to authenticated
  using (public.is_platform_super_admin());
