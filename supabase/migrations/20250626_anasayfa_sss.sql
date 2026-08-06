-- Ana vitrin sayfasına özel SSS
ALTER TABLE dukkanlar
  ADD COLUMN IF NOT EXISTS anasayfa_sss jsonb DEFAULT '[]'::jsonb;

COMMENT ON COLUMN dukkanlar.anasayfa_sss IS 'Ana vitrin (/{slug}) sayfası SSS (soru-cevap dizisi)';
