export type UrunGorselOrani = "yatay" | "dikey";

export function normalizeUrunGorselOrani(
  value: string | null | undefined
): UrunGorselOrani {
  return value === "dikey" ? "dikey" : "yatay";
}

export function getUrunAspectClass(
  _orani: string | null | undefined
): "aspect-square" {
  return "aspect-square";
}

export function getUrunGorselOraniLabel(orani: UrunGorselOrani): string {
  return orani === "dikey" ? "Dikey" : "Yatay";
}

export function toggleUrunGorselOrani(
  orani: UrunGorselOrani
): UrunGorselOrani {
  return orani === "yatay" ? "dikey" : "yatay";
}
