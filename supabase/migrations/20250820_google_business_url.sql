-- Google İşletme / Haritalar paylaşım linki (Places API gerekmez)
alter table public.dukkanlar
  add column if not exists google_business_url text;

comment on column public.dukkanlar.google_business_url is
  'Google Haritalar veya Google İşletme Profili paylaşım linki — vitrin header CTA';
