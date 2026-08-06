-- Ürün başına 3 yatay fotoğraf slotu
ALTER TABLE dukkan_urunleri
  ADD COLUMN IF NOT EXISTS fotograf_url_2 text,
  ADD COLUMN IF NOT EXISTS fotograf_url_3 text;

ALTER TABLE dukkan_urunleri
  ALTER COLUMN fotograf_url DROP NOT NULL;
