-- Pazaryeri entegrasyonu (önce Trendyol; Hepsiburada aynı yapıyı kullanacak)
--
-- 1) dukkan_urunleri.barkod: ürün pazaryerinde barkodla tanınır. Ürünler her
--    kayıtta silinip yeniden eklendiği için (safeSyncDukkanUrunleri) ürün id'si
--    kalıcı değildir; pazaryeri eşleşmesi barkod üzerinden yapılır.
-- 2) pazaryeri_baglantilari: mağazanın kendi satıcı bilgileri. API key/secret
--    Supabase Vault'ta şifreli tutulur; tabloda yalnızca Vault kayıt id'leri var.
--    Okuma/yazma yalnızca aşağıdaki SECURITY DEFINER fonksiyonlarıyla ve sadece
--    mağaza sahibi için yapılır.
-- 3) pazaryeri_urunleri: ürünün pazaryerine özel bilgileri ve gönderim durumu.

-- 1) Barkod -------------------------------------------------------------------
ALTER TABLE public.dukkan_urunleri
  ADD COLUMN IF NOT EXISTS barkod text;

ALTER TABLE public.dukkan_urunleri
  DROP CONSTRAINT IF EXISTS dukkan_urunleri_barkod_format;
ALTER TABLE public.dukkan_urunleri
  ADD CONSTRAINT dukkan_urunleri_barkod_format
  CHECK (barkod IS NULL OR barkod ~ '^[A-Za-z0-9._-]{1,40}$');

COMMENT ON COLUMN public.dukkan_urunleri.barkod IS
  'Pazaryeri barkodu (EAN/GTIN veya mağaza barkodu). En fazla 40 karakter; harf, rakam, nokta, tire, alt çizgi.';

-- 2) Bağlantılar ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.pazaryeri_baglantilari (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dukkan_id uuid NOT NULL REFERENCES public.dukkanlar(id) ON DELETE CASCADE,
  platform text NOT NULL CHECK (platform IN ('trendyol', 'hepsiburada')),
  satici_id text NOT NULL CHECK (char_length(satici_id) BETWEEN 1 AND 40),
  api_key_secret_id uuid NOT NULL,
  api_secret_secret_id uuid NOT NULL,
  son_test_basarili boolean,
  son_test_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (dukkan_id, platform)
);

ALTER TABLE public.pazaryeri_baglantilari ENABLE ROW LEVEL SECURITY;

-- Sahip yalnızca okuyabilir (satıcı id ve test durumu). Yazma fonksiyonlarla.
DROP POLICY IF EXISTS pazaryeri_baglantilari_owner_select ON public.pazaryeri_baglantilari;
CREATE POLICY pazaryeri_baglantilari_owner_select ON public.pazaryeri_baglantilari
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.dukkanlar d
      WHERE d.id = pazaryeri_baglantilari.dukkan_id
        AND d.user_id = (SELECT auth.uid())
    )
  );

CREATE OR REPLACE FUNCTION public.pazaryeri_dukkan_sahibi_mi(p_dukkan_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.dukkanlar d
    WHERE d.id = p_dukkan_id AND d.user_id = (SELECT auth.uid())
  );
$$;

-- Kaydet / güncelle
CREATE OR REPLACE FUNCTION public.pazaryeri_baglanti_kaydet(
  p_dukkan_id uuid,
  p_platform text,
  p_satici_id text,
  p_api_key text,
  p_api_secret text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_row public.pazaryeri_baglantilari%ROWTYPE;
  v_key_id uuid;
  v_secret_id uuid;
BEGIN
  IF NOT public.pazaryeri_dukkan_sahibi_mi(p_dukkan_id) THEN
    RAISE EXCEPTION 'pazaryeri: yetkisiz' USING ERRCODE = '42501';
  END IF;
  IF p_platform NOT IN ('trendyol', 'hepsiburada') THEN
    RAISE EXCEPTION 'pazaryeri: gecersiz platform' USING ERRCODE = '22023';
  END IF;
  IF coalesce(btrim(p_satici_id), '') = ''
     OR coalesce(btrim(p_api_key), '') = ''
     OR coalesce(btrim(p_api_secret), '') = '' THEN
    RAISE EXCEPTION 'pazaryeri: eksik bilgi' USING ERRCODE = '22023';
  END IF;

  SELECT * INTO v_row FROM public.pazaryeri_baglantilari
  WHERE dukkan_id = p_dukkan_id AND platform = p_platform
  FOR UPDATE;

  IF FOUND THEN
    PERFORM vault.update_secret(v_row.api_key_secret_id, btrim(p_api_key));
    PERFORM vault.update_secret(v_row.api_secret_secret_id, btrim(p_api_secret));
    UPDATE public.pazaryeri_baglantilari
      SET satici_id = btrim(p_satici_id),
          son_test_basarili = true,
          son_test_at = now(),
          updated_at = now()
      WHERE id = v_row.id;
  ELSE
    v_key_id := vault.create_secret(
      btrim(p_api_key),
      'pazaryeri_' || p_platform || '_' || p_dukkan_id::text || '_key',
      'EsnafPRO pazaryeri API key'
    );
    v_secret_id := vault.create_secret(
      btrim(p_api_secret),
      'pazaryeri_' || p_platform || '_' || p_dukkan_id::text || '_secret',
      'EsnafPRO pazaryeri API secret'
    );
    INSERT INTO public.pazaryeri_baglantilari (
      dukkan_id, platform, satici_id, api_key_secret_id, api_secret_secret_id,
      son_test_basarili, son_test_at
    ) VALUES (
      p_dukkan_id, p_platform, btrim(p_satici_id), v_key_id, v_secret_id, true, now()
    );
  END IF;
END;
$$;

-- Sunucu tarafında API çağrısı için kimlik bilgisini okur (yalnızca sahip)
CREATE OR REPLACE FUNCTION public.pazaryeri_baglanti_kimlik(
  p_dukkan_id uuid,
  p_platform text
)
RETURNS TABLE (satici_id text, api_key text, api_secret text)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NOT public.pazaryeri_dukkan_sahibi_mi(p_dukkan_id) THEN
    RAISE EXCEPTION 'pazaryeri: yetkisiz' USING ERRCODE = '42501';
  END IF;

  RETURN QUERY
  SELECT b.satici_id, k.decrypted_secret, s.decrypted_secret
  FROM public.pazaryeri_baglantilari b
  JOIN vault.decrypted_secrets k ON k.id = b.api_key_secret_id
  JOIN vault.decrypted_secrets s ON s.id = b.api_secret_secret_id
  WHERE b.dukkan_id = p_dukkan_id AND b.platform = p_platform;
END;
$$;

-- Bağlantıyı kaldır (Vault kayıtlarıyla birlikte)
CREATE OR REPLACE FUNCTION public.pazaryeri_baglanti_sil(
  p_dukkan_id uuid,
  p_platform text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_row public.pazaryeri_baglantilari%ROWTYPE;
BEGIN
  IF NOT public.pazaryeri_dukkan_sahibi_mi(p_dukkan_id) THEN
    RAISE EXCEPTION 'pazaryeri: yetkisiz' USING ERRCODE = '42501';
  END IF;

  DELETE FROM public.pazaryeri_baglantilari
  WHERE dukkan_id = p_dukkan_id AND platform = p_platform
  RETURNING * INTO v_row;

  IF FOUND THEN
    DELETE FROM vault.secrets
    WHERE id IN (v_row.api_key_secret_id, v_row.api_secret_secret_id);
  END IF;
END;
$$;

-- Bağlantı testi sonucunu kaydet
CREATE OR REPLACE FUNCTION public.pazaryeri_baglanti_test_sonucu(
  p_dukkan_id uuid,
  p_platform text,
  p_basarili boolean
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NOT public.pazaryeri_dukkan_sahibi_mi(p_dukkan_id) THEN
    RAISE EXCEPTION 'pazaryeri: yetkisiz' USING ERRCODE = '42501';
  END IF;

  UPDATE public.pazaryeri_baglantilari
    SET son_test_basarili = p_basarili, son_test_at = now(), updated_at = now()
  WHERE dukkan_id = p_dukkan_id AND platform = p_platform;
END;
$$;

REVOKE ALL ON FUNCTION public.pazaryeri_dukkan_sahibi_mi(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.pazaryeri_baglanti_kaydet(uuid, text, text, text, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.pazaryeri_baglanti_kimlik(uuid, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.pazaryeri_baglanti_sil(uuid, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.pazaryeri_baglanti_test_sonucu(uuid, text, boolean) FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.pazaryeri_dukkan_sahibi_mi(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.pazaryeri_baglanti_kaydet(uuid, text, text, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.pazaryeri_baglanti_kimlik(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.pazaryeri_baglanti_sil(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.pazaryeri_baglanti_test_sonucu(uuid, text, boolean) TO authenticated;

-- 3) Pazaryeri ürünleri -------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.pazaryeri_urunleri (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dukkan_id uuid NOT NULL REFERENCES public.dukkanlar(id) ON DELETE CASCADE,
  platform text NOT NULL CHECK (platform IN ('trendyol', 'hepsiburada')),
  barkod text NOT NULL CHECK (barkod ~ '^[A-Za-z0-9._-]{1,40}$'),
  marka_id bigint,
  marka_adi text,
  kategori_id bigint,
  kategori_adi text,
  ozellikler jsonb NOT NULL DEFAULT '[]'::jsonb,
  kdv_orani integer CHECK (kdv_orani IN (0, 1, 10, 20)),
  durum text NOT NULL DEFAULT 'taslak'
    CHECK (durum IN ('taslak', 'gonderildi', 'onay_bekliyor', 'yayinda', 'hata')),
  batch_request_id text,
  son_hata text,
  son_gonderim_at timestamptz,
  stok_fiyat_batch_id text,
  son_senkron_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (dukkan_id, platform, barkod)
);

CREATE INDEX IF NOT EXISTS idx_pazaryeri_urunleri_dukkan
  ON public.pazaryeri_urunleri (dukkan_id, platform);

ALTER TABLE public.pazaryeri_urunleri ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS pazaryeri_urunleri_owner_all ON public.pazaryeri_urunleri;
CREATE POLICY pazaryeri_urunleri_owner_all ON public.pazaryeri_urunleri
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.dukkanlar d
      WHERE d.id = pazaryeri_urunleri.dukkan_id
        AND d.user_id = (SELECT auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.dukkanlar d
      WHERE d.id = pazaryeri_urunleri.dukkan_id
        AND d.user_id = (SELECT auth.uid())
    )
  );
