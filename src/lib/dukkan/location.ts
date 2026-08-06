export const DEFAULT_MAP_CENTER = {
  enlem: 41.0082,
  boylam: 28.9784,
} as const;

export function parseCoordinateInput(value: FormDataEntryValue | null): number | null {
  const trimmed = String(value ?? "").trim();
  if (!trimmed) return null;

  const num = Number(trimmed);
  if (!Number.isFinite(num)) return null;

  return num;
}

export function validateCoordinates(
  enlem: number | null,
  boylam: number | null
): string | null {
  if (enlem === null && boylam === null) return null;

  if (enlem === null || boylam === null) {
    return "Harita konumu için enlem ve boylam birlikte seçilmelidir.";
  }

  if (enlem < -90 || enlem > 90) {
    return "Geçerli bir enlem değeri seçin (-90 ile 90 arası).";
  }

  if (boylam < -180 || boylam > 180) {
    return "Geçerli bir boylam değeri seçin (-180 ile 180 arası).";
  }

  return null;
}

export function formatCoordinate(value: number): string {
  return value.toFixed(6);
}
