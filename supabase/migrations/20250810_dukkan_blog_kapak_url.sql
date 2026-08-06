-- Blog yazıları kapak görseli
alter table public.dukkan_blog_yazilari
  add column if not exists kapak_url text;

comment on column public.dukkan_blog_yazilari.kapak_url is
  'Yatay (landscape) blog kapak görseli URL';
