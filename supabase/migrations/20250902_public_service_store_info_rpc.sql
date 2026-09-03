-- Public servis sayfaları için mağaza bilgisi (logo_url dahil)

CREATE OR REPLACE FUNCTION public.get_public_service_store_info(p_store_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO public
AS $$
DECLARE
  rec record;
BEGIN
  IF p_store_id IS NULL THEN
    RETURN NULL;
  END IF;

  SELECT
    coalesce(d.dukkan_adi, s.name) AS dukkan_adi,
    coalesce(d.slug, s.slug) AS slug,
    d.telefon,
    d.logo_url
  INTO rec
  FROM public.stores s
  LEFT JOIN public.dukkanlar d ON d.user_id = s.owner_id
  WHERE s.id = p_store_id
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  RETURN jsonb_build_object(
    'dukkan_adi', rec.dukkan_adi,
    'slug', rec.slug,
    'telefon', rec.telefon,
    'logo_url', rec.logo_url
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_public_service_store_info(uuid) TO anon, authenticated;

COMMENT ON FUNCTION public.get_public_service_store_info(uuid) IS
  'Servis takip/onay sayfaları — dukkanlar.logo_url dahil güvenli mağaza kartı.';

-- Onay RPC: store_id ekle (user_id → stores eşlemesi)
CREATE OR REPLACE FUNCTION public.get_technical_service_public(
  p_token text DEFAULT NULL,
  p_service_id text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO public
AS $$
DECLARE
  rec public.technical_service%ROWTYPE;
  token_expired boolean := false;
  token_used boolean := false;
  lookup_value text := nullif(trim(coalesce(p_token, p_service_id, '')), '');
  store_uuid uuid;
BEGIN
  IF lookup_value IS NOT NULL AND length(lookup_value) > 0 THEN
    SELECT * INTO rec
    FROM public.technical_service
    WHERE lower(trim(coalesce(approval_token, ''))) = lower(lookup_value)
       OR service_id = lookup_value
       OR tracking_code = lookup_value
    ORDER BY
      CASE
        WHEN lower(trim(coalesce(approval_token, ''))) = lower(lookup_value) THEN 0
        WHEN service_id = lookup_value THEN 1
        ELSE 2
      END,
      created_at DESC
    LIMIT 1;
  ELSE
    RETURN NULL;
  END IF;

  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  SELECT s.id INTO store_uuid
  FROM public.stores s
  WHERE s.owner_id = rec.user_id
  ORDER BY s.created_at ASC NULLS LAST
  LIMIT 1;

  token_used := rec.approval_token_used_at IS NOT NULL;

  IF rec.approval_status = 'beklemede'
     AND NOT token_used
     AND rec.approval_sent_at IS NOT NULL
     AND rec.approval_sent_at + interval '7 days' < now() THEN
    token_expired := true;
  END IF;

  RETURN jsonb_build_object(
    'id', rec.id,
    'service_id', rec.service_id,
    'store_id', store_uuid,
    'customer_name', rec.customer_name,
    'device_info', rec.device_info,
    'device_imei', rec.device_imei,
    'status', rec.status,
    'approval_status', rec.approval_status,
    'created_at', rec.created_at,
    'completed_at', rec.completed_at,
    'fault_description', rec.fault_description,
    'physical_checks', COALESCE(rec.physical_checks, '{}'::jsonb),
    'accessories', COALESCE(rec.accessories, ARRAY[]::text[]),
    'approval_sent_at', rec.approval_sent_at,
    'terms_accepted_at', rec.terms_accepted_at,
    'has_approval_token', rec.approval_token IS NOT NULL,
    'tracking_code', rec.tracking_code,
    'token_expired', token_expired,
    'token_used', token_used
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_technical_service_public(text, text) TO anon, authenticated;
