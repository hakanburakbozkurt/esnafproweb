-- Vitrin: İletişim/SSS panel görünürlüğü
ALTER TABLE dukkanlar
  ADD COLUMN IF NOT EXISTS iletisim_sss_goster boolean NOT NULL DEFAULT true;

-- Ürün/hizmet açıklama metni
ALTER TABLE dukkan_urunleri
  ADD COLUMN IF NOT EXISTS urun_aciklama text;
