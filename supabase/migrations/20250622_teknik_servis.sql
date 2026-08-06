-- Teknik Servis vitrin sayfası alanları
ALTER TABLE dukkanlar
  ADD COLUMN IF NOT EXISTS teknik_servis_aktif boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS teknik_servis_fotograf_1 text,
  ADD COLUMN IF NOT EXISTS teknik_servis_fotograf_2 text,
  ADD COLUMN IF NOT EXISTS teknik_servis_fotograf_3 text,
  ADD COLUMN IF NOT EXISTS teknik_servis_aciklama text,
  ADD COLUMN IF NOT EXISTS teknik_servis_sss jsonb DEFAULT '[]'::jsonb;
