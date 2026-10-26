-- Ürün kategorisi, 8 görsel slotu ve stok adedi
ALTER TABLE public.dukkan_urunleri
  ADD COLUMN IF NOT EXISTS urun_kategorisi text,
  ADD COLUMN IF NOT EXISTS fotograf_url_4 text,
  ADD COLUMN IF NOT EXISTS fotograf_url_5 text,
  ADD COLUMN IF NOT EXISTS fotograf_url_6 text,
  ADD COLUMN IF NOT EXISTS fotograf_url_7 text,
  ADD COLUMN IF NOT EXISTS fotograf_url_8 text,
  ADD COLUMN IF NOT EXISTS stok_adedi integer;

ALTER TABLE public.dukkan_urunleri
  DROP CONSTRAINT IF EXISTS dukkan_urunleri_stok_adedi_check;

ALTER TABLE public.dukkan_urunleri
  ADD CONSTRAINT dukkan_urunleri_stok_adedi_check
  CHECK (stok_adedi IS NULL OR stok_adedi >= 0);

COMMENT ON COLUMN public.dukkan_urunleri.urun_kategorisi IS
  'Vitrinde gruplama başlığı (ör. Tablet Kılıfları). NULL ise kategorisiz.';

COMMENT ON COLUMN public.dukkan_urunleri.stok_adedi IS
  'NULL: stok takibi yok (rozet gösterilmez). 0: Tükendi, 1: Son 1 adet, >1: Stokta.';
