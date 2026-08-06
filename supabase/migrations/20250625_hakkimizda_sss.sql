-- Hakkımızda sayfasına özel SSS
ALTER TABLE dukkanlar
  ADD COLUMN IF NOT EXISTS hakkimizda_sss jsonb DEFAULT '[]'::jsonb;

COMMENT ON COLUMN dukkanlar.hakkimizda_sss IS 'Hakkımızda vitrin sayfası SSS (soru-cevap dizisi)';
