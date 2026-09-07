/** Cihaz Al / Vitrin — garanti tipi sabitleri */

export const WARRANTY_TYPE_OPTIONS = [
  "İthalatçı Firma Garantili",
  "Mağaza Garantili",
  "Garanti Yok",
] as const;

export type WarrantyType = (typeof WARRANTY_TYPE_OPTIONS)[number];

/** Sıfır cihaz modunda varsayılan garanti */
export const DEFAULT_NEW_DEVICE_WARRANTY: WarrantyType =
  "İthalatçı Firma Garantili";

export function warrantyTypeFromDb(row: {
  warranty_type?: string | null;
  has_warranty?: boolean | null;
}): WarrantyType {
  const wt = row.warranty_type?.trim();
  if (wt && (WARRANTY_TYPE_OPTIONS as readonly string[]).includes(wt)) {
    return wt as WarrantyType;
  }
  if (row.has_warranty === true) return "Mağaza Garantili";
  return "Garanti Yok";
}

export function hasWarrantyFromType(type: string): boolean {
  return type === "İthalatçı Firma Garantili" || type === "Mağaza Garantili";
}

export function formatWarrantyDisplay(type?: string | null): string {
  const t = type?.trim();
  if (t && t !== "Garanti Yok") return t;
  return "Garanti Yok";
}
