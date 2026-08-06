-- Sayfa bazlı izole SSS kolonları (idempotent — eksik olanları ekler)
-- sss              → /[slug]/iletisim
-- hakkimizda_sss   → /[slug]/hakkimizda
-- anasayfa_sss     → /[slug] ana vitrin
-- teknik_servis_sss → /[slug]/teknik-servis

ALTER TABLE dukkanlar
  ADD COLUMN IF NOT EXISTS sss jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS hakkimizda_sss jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS anasayfa_sss jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS teknik_servis_sss jsonb DEFAULT '[]'::jsonb;

ALTER TABLE dukkanlar
  ADD COLUMN IF NOT EXISTS iletisim_sss_goster boolean NOT NULL DEFAULT true;

COMMENT ON COLUMN dukkanlar.sss IS 'İletişim vitrin sayfası SSS (soru-cevap dizisi)';
COMMENT ON COLUMN dukkanlar.hakkimizda_sss IS 'Hakkımızda vitrin sayfası SSS (soru-cevap dizisi)';
COMMENT ON COLUMN dukkanlar.anasayfa_sss IS 'Ana vitrin (/{slug}) sayfası SSS (soru-cevap dizisi)';
COMMENT ON COLUMN dukkanlar.teknik_servis_sss IS 'Teknik servis vitrin sayfası SSS (soru-cevap dizisi)';
COMMENT ON COLUMN dukkanlar.iletisim_sss_goster IS 'İletişim sayfası ve menü linkinin vitrinde görünürlüğü';
