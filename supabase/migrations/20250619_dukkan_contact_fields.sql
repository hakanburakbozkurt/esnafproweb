-- EsnafPRO: vitrin iletişim alanları
ALTER TABLE dukkanlar
  ADD COLUMN IF NOT EXISTS whatsapp text,
  ADD COLUMN IF NOT EXISTS calisma_saatleri text,
  ADD COLUMN IF NOT EXISTS instagram_url text,
  ADD COLUMN IF NOT EXISTS tiktok_url text,
  ADD COLUMN IF NOT EXISTS facebook_url text;

COMMENT ON COLUMN dukkanlar.whatsapp IS 'WhatsApp numarası — 905XXXXXXXXX formatında';
COMMENT ON COLUMN dukkanlar.calisma_saatleri IS 'Serbest metin çalışma saatleri';
COMMENT ON COLUMN dukkanlar.instagram_url IS 'Instagram profil veya sayfa URL';
COMMENT ON COLUMN dukkanlar.tiktok_url IS 'TikTok profil URL';
COMMENT ON COLUMN dukkanlar.facebook_url IS 'Facebook profil veya sayfa URL';
