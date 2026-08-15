import {
  mergeUniqueSorted,
  normalizeDeviceModelRow,
} from "@/lib/katalog/device-model-normalize";
import type { PhoneModel } from "@/types/database.types";

export type PhoneModelFilters = {
  brands: string[];
  modelsByBrand: Record<string, string[]>;
};

export function buildPhoneModelFilters(
  models: Array<PhoneModel | Record<string, unknown>>
): PhoneModelFilters {
  const modelsByBrand: Record<string, Set<string>> = {};

  for (const model of models) {
    const row =
      typeof model === "object" && model !== null
        ? normalizeDeviceModelRow(model as Record<string, unknown>)
        : { brand: "", modelName: "" };
    const { brand, modelName } = row;
    if (!brand) continue;

    if (!modelsByBrand[brand]) {
      modelsByBrand[brand] = new Set();
    }

    if (modelName) {
      modelsByBrand[brand].add(modelName);
    }
  }

  const brands = mergeUniqueSorted(Object.keys(modelsByBrand));
  const normalized: Record<string, string[]> = {};

  for (const brand of brands) {
    normalized[brand] = mergeUniqueSorted([...modelsByBrand[brand]]);
  }

  return { brands, modelsByBrand: normalized };
}
