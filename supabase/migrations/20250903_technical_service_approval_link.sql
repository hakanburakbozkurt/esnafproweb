-- technical_service: DB tarafında approval_token / service_id garantisi + link lookup RPC

CREATE OR REPLACE FUNCTION public.generate_technical_service_approval_token()
RETURNS text
LANGUAGE plpgsql
VOLATILE
SET search_path TO public
AS $$
DECLARE
  candidate text;
  attempts integer := 0;
BEGIN
  LOOP
    attempts := attempts + 1;
    candidate :=
      'apr-' ||
      floor(extract(epoch FROM clock_timestamp()) * 1000)::bigint::text ||
      '-' ||
      lower(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10));

    EXIT WHEN NOT EXISTS (
      SELECT 1
      FROM public.technical_service ts
      WHERE lower(trim(coalesce(ts.approval_token, ''))) = lower(candidate)
    );

    IF attempts >= 12 THEN
      candidate := gen_random_uuid()::text;
      EXIT;
    END IF;
  END LOOP;

  RETURN candidate;
END;
$$;

CREATE OR REPLACE FUNCTION public.generate_technical_service_id()
RETURNS text
LANGUAGE plpgsql
VOLATILE
SET search_path TO public
AS $$
DECLARE
  year_part text := to_char(now(), 'YYYY');
  next_seq integer;
  candidate text;
BEGIN
  SELECT coalesce(
    max(
      CASE
        WHEN service_id ~ ('^SRV-' || year_part || '-[0-9]+$')
          THEN split_part(service_id, '-', 3)::integer
        ELSE NULL
      END
    ),
    0
  ) + 1
  INTO next_seq
  FROM public.technical_service;

  candidate := 'SRV-' || year_part || '-' || lpad(next_seq::text, 3, '0');

  WHILE EXISTS (
    SELECT 1
    FROM public.technical_service ts
    WHERE ts.service_id = candidate
  ) LOOP
    next_seq := next_seq + 1;
    candidate := 'SRV-' || year_part || '-' || lpad(next_seq::text, 3, '0');
  END LOOP;

  RETURN candidate;
END;
$$;

CREATE OR REPLACE FUNCTION public.ensure_technical_service_approval_fields()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO public
AS $$
BEGIN
  IF NEW.approval_token IS NULL OR length(trim(NEW.approval_token)) = 0 THEN
    NEW.approval_token := public.generate_technical_service_approval_token();
  ELSE
    NEW.approval_token := trim(NEW.approval_token);
  END IF;

  IF NEW.service_id IS NULL OR length(trim(NEW.service_id)) = 0 THEN
    NEW.service_id := public.generate_technical_service_id();
  ELSE
    NEW.service_id := trim(NEW.service_id);
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_ensure_technical_service_approval_fields ON public.technical_service;

CREATE TRIGGER trg_ensure_technical_service_approval_fields
  BEFORE INSERT ON public.technical_service
  FOR EACH ROW
  EXECUTE FUNCTION public.ensure_technical_service_approval_fields();

-- Kayıt sahibi / panel: DB'deki gerçek token ile onay linki lookup değeri döner
CREATE OR REPLACE FUNCTION public.get_technical_service_approval_lookup(
  p_technical_service_id uuid,
  p_mark_sent boolean DEFAULT false
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public
AS $$
DECLARE
  rec public.technical_service%ROWTYPE;
  lookup_token text;
BEGIN
  IF p_technical_service_id IS NULL THEN
    RAISE EXCEPTION 'Servis kaydı bulunamadı.';
  END IF;

  SELECT * INTO rec
  FROM public.technical_service
  WHERE id = p_technical_service_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Servis kaydı bulunamadı.';
  END IF;

  IF auth.uid() IS NOT NULL AND rec.user_id IS DISTINCT FROM auth.uid() THEN
    RAISE EXCEPTION 'Bu servis kaydına erişim yetkiniz yok.';
  END IF;

  IF rec.approval_token IS NULL OR length(trim(rec.approval_token)) = 0 THEN
    rec.approval_token := public.generate_technical_service_approval_token();
  END IF;

  IF rec.service_id IS NULL OR length(trim(rec.service_id)) = 0 THEN
    rec.service_id := public.generate_technical_service_id();
  END IF;

  lookup_token := trim(rec.approval_token);
  IF lookup_token IS NULL OR lookup_token = '' THEN
    lookup_token := trim(rec.service_id);
  END IF;

  IF lookup_token IS NULL OR lookup_token = '' THEN
    lookup_token := rec.id::text;
  END IF;

  UPDATE public.technical_service
  SET
    approval_token = rec.approval_token,
    service_id = rec.service_id,
    approval_sent_at = CASE
      WHEN p_mark_sent THEN now()
      ELSE approval_sent_at
    END
  WHERE id = rec.id;

  RETURN jsonb_build_object(
    'id', rec.id,
    'service_id', rec.service_id,
    'approval_token', rec.approval_token,
    'lookup_token', lookup_token,
    'customer_name', rec.customer_name,
    'customer_phone', rec.customer_phone,
    'device_info', rec.device_info,
    'approval_sent_at', CASE
      WHEN p_mark_sent THEN now()
      ELSE rec.approval_sent_at
    END
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.generate_technical_service_approval_token() TO authenticated;
GRANT EXECUTE ON FUNCTION public.generate_technical_service_id() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_technical_service_approval_lookup(uuid, boolean) TO authenticated;

COMMENT ON FUNCTION public.get_technical_service_approval_lookup(uuid, boolean) IS
  'Onay linki üretimi — yalnızca DB''deki approval_token / service_id değerlerini döner.';
