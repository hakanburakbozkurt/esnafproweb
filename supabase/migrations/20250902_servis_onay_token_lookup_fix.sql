-- Onay token araması: büyük/küçük harf duyarsız eşleşme + URL boşlukları

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
  normalized_token text := nullif(trim(p_token), '');
BEGIN
  IF normalized_token IS NOT NULL AND length(normalized_token) > 0 THEN
    SELECT * INTO rec
    FROM public.technical_service
    WHERE lower(trim(approval_token)) = lower(normalized_token)
    LIMIT 1;
  ELSIF p_service_id IS NOT NULL AND length(trim(p_service_id)) > 0 THEN
    SELECT * INTO rec
    FROM public.technical_service
    WHERE service_id = trim(p_service_id)
       OR tracking_code = trim(p_service_id)
    LIMIT 1;
  ELSE
    RETURN NULL;
  END IF;

  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

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
  store_uuid uuid;
  new_tracking_code text;
  mapped_status text;
  normalized_token text := nullif(trim(p_token), '');
BEGIN
  IF normalized_token IS NULL OR length(normalized_token) < 8 THEN
    RAISE EXCEPTION 'Geçersiz onay bağlantısı.';
  END IF;

  IF decision NOT IN ('onaylandi', 'reddedildi') THEN
    RAISE EXCEPTION 'Geçersiz karar.';
  END IF;

  SELECT * INTO rec
  FROM public.technical_service
  WHERE lower(trim(approval_token)) = lower(normalized_token)
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Kayıt bulunamadı.';
  END IF;

  IF rec.approval_status = 'beklemede'
     AND rec.approval_token_used_at IS NULL
     AND rec.approval_sent_at IS NOT NULL
     AND rec.approval_sent_at + interval '7 days' < now() THEN
    RAISE EXCEPTION 'Onay bağlantısının süresi dolmuş.';
  END IF;

  IF rec.approval_status = 'onaylandi' OR rec.approval_token_used_at IS NOT NULL THEN
    RETURN jsonb_build_object(
      'approval_status', 'onaylandi',
      'terms_accepted_at', rec.terms_accepted_at,
      'tracking_code', rec.tracking_code,
      'customer_phone', rec.customer_phone,
      'already', true
    );
  END IF;

  IF rec.approval_status = 'reddedildi' AND decision = 'reddedildi' THEN
    RETURN jsonb_build_object(
      'approval_status', 'reddedildi',
      'already', true
    );
  END IF;

  IF decision = 'onaylandi' THEN
    new_tracking_code := coalesce(rec.tracking_code, public.generate_service_tracking_code());
    mapped_status := public.map_technical_service_status(rec.status);

    SELECT s.id INTO store_uuid
    FROM public.stores s
    WHERE s.owner_id = rec.user_id
    ORDER BY s.created_at ASC NULLS LAST
    LIMIT 1;

    IF store_uuid IS NULL THEN
      RAISE EXCEPTION 'Mağaza kaydı bulunamadı.';
    END IF;

    UPDATE public.technical_service
    SET
      approval_status = decision,
      terms_accepted_at = now(),
      tracking_code = new_tracking_code,
      approval_token_used_at = now()
    WHERE id = rec.id;

    IF EXISTS (
      SELECT 1
      FROM public.service_devices sd
      WHERE sd.technical_service_id = rec.id
    ) THEN
      UPDATE public.service_devices sd
      SET
        device_code = new_tracking_code,
        customer_name = rec.customer_name,
        device_model = rec.device_info,
        issue_description = rec.fault_description,
        status = mapped_status
      WHERE sd.technical_service_id = rec.id;
    ELSE
      INSERT INTO public.service_devices (
        store_id,
        device_code,
        customer_name,
        device_model,
        issue_description,
        status,
        technical_service_id
      )
      VALUES (
        store_uuid,
        new_tracking_code,
        rec.customer_name,
        rec.device_info,
        rec.fault_description,
        mapped_status,
        rec.id
      );
    END IF;
  ELSE
    UPDATE public.technical_service
    SET
      approval_status = decision,
      approval_token_used_at = now()
    WHERE id = rec.id;

    new_tracking_code := NULL;
  END IF;

  RETURN jsonb_build_object(
    'approval_status', decision,
    'service_id', rec.service_id,
    'terms_accepted_at', CASE
      WHEN decision = 'onaylandi' THEN now()
      ELSE NULL
    END,
    'tracking_code', new_tracking_code,
    'customer_phone', rec.customer_phone,
    'already', false
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_technical_service_public(text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.respond_technical_service_approval(text, text) TO anon, authenticated;
