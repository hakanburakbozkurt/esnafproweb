-- Public servis onay sayfası (/servis-onay?token=...) için RPC güncellemeleri
-- Kaynak tablo: technical_service (service_records alias değil)

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
BEGIN
  IF p_token IS NOT NULL AND length(trim(p_token)) > 0 THEN
    SELECT * INTO rec
    FROM public.technical_service
    WHERE approval_token = trim(p_token)
    LIMIT 1;
  ELSIF p_service_id IS NOT NULL AND length(trim(p_service_id)) > 0 THEN
    SELECT * INTO rec
    FROM public.technical_service
    WHERE service_id = trim(p_service_id)
    LIMIT 1;
  ELSE
    RETURN NULL;
  END IF;

  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  RETURN jsonb_build_object(
    'id', rec.id,
    'service_id', rec.service_id,
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
    'has_approval_token', rec.approval_token IS NOT NULL
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.respond_technical_service_approval(
  p_token text,
  p_decision text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public
AS $$
DECLARE
  rec public.technical_service%ROWTYPE;
  decision text := lower(trim(p_decision));
BEGIN
  IF p_token IS NULL OR length(trim(p_token)) < 8 THEN
    RAISE EXCEPTION 'Geçersiz onay bağlantısı.';
  END IF;

  IF decision NOT IN ('onaylandi', 'reddedildi') THEN
    RAISE EXCEPTION 'Geçersiz karar.';
  END IF;

  SELECT * INTO rec
  FROM public.technical_service
  WHERE approval_token = trim(p_token)
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Kayıt bulunamadı.';
  END IF;

  IF rec.approval_status = 'onaylandi' THEN
    RETURN jsonb_build_object(
      'approval_status', 'onaylandi',
      'terms_accepted_at', rec.terms_accepted_at,
      'already', true
    );
  END IF;

  IF rec.approval_status = 'reddedildi' AND decision = 'reddedildi' THEN
    RETURN jsonb_build_object(
      'approval_status', 'reddedildi',
      'already', true
    );
  END IF;

  UPDATE public.technical_service
  SET
    approval_status = decision,
    terms_accepted_at = CASE
      WHEN decision = 'onaylandi' THEN now()
      ELSE terms_accepted_at
    END
  WHERE id = rec.id;

  RETURN jsonb_build_object(
    'approval_status', decision,
    'service_id', rec.service_id,
    'terms_accepted_at', CASE
      WHEN decision = 'onaylandi' THEN now()
      ELSE NULL
    END,
    'already', false
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_technical_service_public(text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.respond_technical_service_approval(text, text) TO anon, authenticated;
