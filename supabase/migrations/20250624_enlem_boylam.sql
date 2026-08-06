-- Mağaza harita koordinatları (pin konumu)
ALTER TABLE dukkanlar
  ADD COLUMN IF NOT EXISTS enlem double precision,
  ADD COLUMN IF NOT EXISTS boylam double precision;

COMMENT ON COLUMN dukkanlar.enlem IS 'Mağaza enlem (latitude) — harita pini';
COMMENT ON COLUMN dukkanlar.boylam IS 'Mağaza boylam (longitude) — harita pini';
