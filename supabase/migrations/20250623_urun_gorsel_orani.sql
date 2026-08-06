-- Ürün/hizmet görsel formatı: yatay (varsayılan) veya dikey
ALTER TABLE dukkan_urunleri
  ADD COLUMN IF NOT EXISTS gorsel_orani text NOT NULL DEFAULT 'yatay';
