export type DeviceModelTable = "phone_models" | "tablet_models";

export const DEVICE_MODEL_TABLES: DeviceModelTable[] = [
  "phone_models",
  "tablet_models",
];

export type NormalizedDeviceModelRow = {
  brand: string;
  modelName: string;
};

export function normalizeDeviceModelRow(
  row: Record<string, unknown>
): NormalizedDeviceModelRow {
  const brand = String(row.brand ?? row.marka ?? "").trim();
  const modelName = String(
    row.model_name ?? row.model ?? row.name ?? row.modelName ?? ""
  ).trim();

  return { brand, modelName };
}

export function mergeUniqueSorted(values: string[]): string[] {
  return [...new Set(values.filter(Boolean))].sort((a, b) =>
    a.localeCompare(b, "tr")
  );
}

export function brandsMatch(storedBrand: string, selectedBrand: string): boolean {
  return (
    storedBrand.localeCompare(selectedBrand, "tr", { sensitivity: "base" }) ===
    0
  );
}

export function extractBrandsFromKatalogItems(
  items: Array<{ brand?: string | null }>
): string[] {
  return mergeUniqueSorted(
    items.map((item) => item.brand?.trim() ?? "").filter(Boolean)
  );
}

export function extractModelsFromKatalogItems(
  items: Array<{ brand?: string | null; model_name?: string | null }>,
  brand: string
): string[] {
  if (!brand.trim()) return [];

  return mergeUniqueSorted(
    items
      .filter((item) => brandsMatch(item.brand?.trim() ?? "", brand))
      .map((item) => item.model_name?.trim() ?? "")
      .filter(Boolean)
  );
}
