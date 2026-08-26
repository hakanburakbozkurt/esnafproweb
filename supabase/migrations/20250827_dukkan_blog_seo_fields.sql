-- Blog yazıları: SEO meta alanları
alter table public.dukkan_blog_yazilari
  add column if not exists meta_title text,
  add column if not exists meta_description text;

comment on column public.dukkan_blog_yazilari.meta_title is
  'Arama motorları ve sosyal paylaşım için özel SEO başlığı';
comment on column public.dukkan_blog_yazilari.meta_description is
  'Google snippet ve Open Graph açıklaması (150-160 karakter önerilir)';
