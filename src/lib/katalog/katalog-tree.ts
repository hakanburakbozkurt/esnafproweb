import { brandsMatch } from "@/lib/katalog/device-model-normalize";
import type { KatalogWebItem } from "@/types/database.types";

export type KatalogTreeModel = {
  modelName: string;
  totalCount: number;
  availableCount: number;
};

export type KatalogTreeBrand = {
  brand: string;
  totalCount: number;
  availableCount: number;
  models: KatalogTreeModel[];
};

export type KatalogSelection = {
  brand: string;
  modelName: string;
};

export function buildKatalogTree(items: KatalogWebItem[]): KatalogTreeBrand[] {
  const brandMap = new Map<
    string,
    {
      totalCount: number;
      availableCount: number;
      models: Map<string, { totalCount: number; availableCount: number }>;
    }
  >();

  for (const item of items) {
    const brand = item.brand?.trim();
    const modelName = item.model_name?.trim();
    if (!brand || !modelName) continue;

    if (!brandMap.has(brand)) {
      brandMap.set(brand, {
        totalCount: 0,
        availableCount: 0,
        models: new Map(),
      });
    }

    const brandEntry = brandMap.get(brand)!;
    brandEntry.totalCount += 1;
    if (!item.is_sold) brandEntry.availableCount += 1;

    if (!brandEntry.models.has(modelName)) {
      brandEntry.models.set(modelName, { totalCount: 0, availableCount: 0 });
    }

    const modelEntry = brandEntry.models.get(modelName)!;
    modelEntry.totalCount += 1;
    if (!item.is_sold) modelEntry.availableCount += 1;
  }

  return [...brandMap.entries()]
    .map(([brand, entry]) => ({
      brand,
      totalCount: entry.totalCount,
      availableCount: entry.availableCount,
      models: [...entry.models.entries()]
        .map(([modelName, modelEntry]) => ({
          modelName,
          totalCount: modelEntry.totalCount,
          availableCount: modelEntry.availableCount,
        }))
        .sort((a, b) => a.modelName.localeCompare(b.modelName, "tr")),
    }))
    .sort((a, b) => a.brand.localeCompare(b.brand, "tr"));
}

export function filterKatalogItemsBySelection(
  items: KatalogWebItem[],
  selection: KatalogSelection | null
): KatalogWebItem[] {
  if (!selection) return [];

  return items
    .filter((item) => {
      const brand = item.brand?.trim() ?? "";
      const modelName = item.model_name?.trim() ?? "";
      return (
        brandsMatch(brand, selection.brand) &&
        brandsMatch(modelName, selection.modelName)
      );
    })
    .sort((a, b) => {
      const sortDiff = (a.sort_order ?? 0) - (b.sort_order ?? 0);
      if (sortDiff !== 0) return sortDiff;
      return (
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    });
}
