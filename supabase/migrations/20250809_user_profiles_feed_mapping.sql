-- Toptancı XML/feed alan eşlemesi (web + mobil ortak user_profiles kaydı)
alter table public.user_profiles add column if not exists feed_mapping jsonb default null;

comment on column public.user_profiles.feed_mapping is
  'XML feed etiket → toptanci_products kolon eşlemesi (XmlMapping JSON). Web panelinden kaydedilir.';
