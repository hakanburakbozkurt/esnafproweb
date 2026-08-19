-- Google Review Engine: Place ID, vitrin widget ayarları ve sunucu tarafı önbellek

alter table public.dukkanlar
  add column if not exists google_place_id text,
  add column if not exists google_reviews_enabled boolean not null default false,
  add column if not exists google_reviews_cache jsonb,
  add column if not exists google_reviews_fetched_at timestamptz;

comment on column public.dukkanlar.google_place_id is
  'Google Places API place ID — İşletme Profili yorumları için.';

comment on column public.dukkanlar.google_reviews_enabled is
  'Vitrinde Google İşletme Profili yorum widget''ı gösterilsin mi?';

comment on column public.dukkanlar.google_reviews_cache is
  'Sunucu tarafı Google yorum önbelleği (syndication + JSON-LD ile uyumlu).';

create index if not exists dukkanlar_google_reviews_enabled_idx
  on public.dukkanlar (google_reviews_enabled)
  where google_reviews_enabled = true;
