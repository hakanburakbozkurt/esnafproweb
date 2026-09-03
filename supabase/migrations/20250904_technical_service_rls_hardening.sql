-- technical_service: permissive public ALL politikasını kaldır; anon yalnızca SELECT (Realtime/takip)

DROP POLICY IF EXISTS servis_politikasi ON public.technical_service;

CREATE POLICY technical_service_anon_select_tracked
  ON public.technical_service
  FOR SELECT
  TO anon
  USING (tracking_code IS NOT NULL);

COMMENT ON POLICY technical_service_anon_select_tracked ON public.technical_service IS
  'Müşteri takip Realtime ve public RPC için; yazma yok.';
