-- Public takip RPC: technical_service_id (Realtime aboneliği için)

DROP FUNCTION IF EXISTS public.get_service_device_public(text);

CREATE OR REPLACE FUNCTION public.get_service_device_public(p_device_code text)
RETURNS TABLE (
  id uuid,
  store_id uuid,
  device_code text,
  device_model text,
  issue_description text,
  status text,
  created_at timestamptz,
  technical_service_id uuid
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    sd.id,
    sd.store_id,
    sd.device_code,
    sd.device_model,
    sd.issue_description,
    sd.status,
    sd.created_at,
    sd.technical_service_id
  FROM public.service_devices sd
  WHERE sd.device_code = p_device_code
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.get_service_device_public(text) FROM public;
GRANT EXECUTE ON FUNCTION public.get_service_device_public(text) TO anon, authenticated;

COMMENT ON FUNCTION public.get_service_device_public(text) IS
  'Müşteri servis takip sayfası — customer_name hariç; technical_service_id Realtime için.';
