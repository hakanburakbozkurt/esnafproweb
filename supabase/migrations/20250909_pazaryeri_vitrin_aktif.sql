-- Mağaza düzeyinde pazaryeri vitrin aç/kapat (cihaz web_published ayrı kalır)
ALTER TABLE public.dukkanlar
  ADD COLUMN IF NOT EXISTS pazaryeri_vitrin_aktif boolean NOT NULL DEFAULT true;

COMMENT ON COLUMN public.dukkanlar.pazaryeri_vitrin_aktif IS
  'false iken mağazanın pazaryeri sayfası ve ilanları public vitrinde gizlenir.';
