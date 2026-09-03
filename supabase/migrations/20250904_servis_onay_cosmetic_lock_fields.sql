-- Public onay RPC: cosmetic_notes + kilit alanları

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
       OR (
         lookup_value ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
         AND id = lookup_value::uuid
       )
    ORDER BY
      CASE
        WHEN lower(trim(coalesce(approval_token, ''))) = lower(lookup_value) THEN 0
        WHEN service_id = lookup_value THEN 1
        WHEN tracking_code = lookup_value THEN 2
        ELSE 3
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
    'cosmetic_notes', rec.cosmetic_notes,
    'lock_type', rec.lock_type,
    'device_password', rec.device_password,
    'pattern_lock_data', rec.pattern_lock_data,
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

COMMENT ON FUNCTION public.get_technical_service_public(text, text) IS
  'Public servis onay sayfası — cosmetic_notes ve kilit alanları dahil.';
