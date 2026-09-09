import type { DeviceCategory } from "@/lib/cihaz/types";
import type { Json } from "@/types/database.types";

export type CihazKataloguRow = {
  id: string;
  category: DeviceCategory;
  brand: string;
  model_name: string;
  base_specs: Record<string, string>;
  sort_order: number;
  created_at: string;
};

export type CihazKataloguAdminState = {
  error?: string;
  success?: boolean;
};

export const CIHAZ_KATALOGU_CATEGORIES: DeviceCategory[] = [
  "phone",
  "tablet",
  "watch",
  "computer",
  "console",
];

export const CIHAZ_KATALOGU_CATEGORY_LABELS: Record<DeviceCategory, string> = {
  phone: "Telefon",
  tablet: "Tablet",
  watch: "Akıllı Saat",
  computer: "Bilgisayar",
  console: "Konsol",
};

export const CIHAZ_KATALOGU_SPEC_FIELDS = [
  { key: "depolama", label: "Depolama", placeholder: "128 GB" },
  { key: "ram", label: "RAM", placeholder: "8 GB" },
  { key: "ekran", label: "Ekran", placeholder: '6.1"' },
  { key: "islemci", label: "İşlemci", placeholder: "Snapdragon 8 Gen 3" },
  { key: "cikis_yili", label: "Çıkış yılı", placeholder: "2024" },
] as const;

export function parseBaseSpecs(raw: Json | null | undefined): Record<string, string> {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return {};
  }

  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(raw)) {
    if (typeof value === "string" && value.trim()) {
      result[key] = value.trim();
    }
  }
  return result;
}

export function normalizeCihazKataloguRow(
  row: Record<string, unknown>
): CihazKataloguRow {
  const category = String(row.category ?? "phone") as DeviceCategory;

  return {
    id: String(row.id ?? ""),
    category: CIHAZ_KATALOGU_CATEGORIES.includes(category) ? category : "phone",
    brand: String(row.brand ?? "").trim(),
    model_name: String(row.model_name ?? "").trim(),
    base_specs: parseBaseSpecs(row.base_specs as Json),
    sort_order: Number(row.sort_order ?? 0),
    created_at: String(row.created_at ?? ""),
  };
}
