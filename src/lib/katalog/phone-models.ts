import type { PhoneModel } from "@/types/database.types";

export type PhoneModelFilters = {
  brands: string[];
  modelsByBrand: Record<string, string[]>;
};

export function buildPhoneModelFilters(models: PhoneModel[]): PhoneModelFilters {
  const modelsByBrand: Record<string, Set<string>> = {};

  for (const model of models) {
    const brand = model.brand?.trim();
    const modelName = model.model_name?.trim();
    if (!brand || !modelName) continue;

    if (!modelsByBrand[brand]) {
      modelsByBrand[brand] = new Set();
    }
    modelsByBrand[brand].add(modelName);
  }

  const brands = Object.keys(modelsByBrand).sort((a, b) =>
    a.localeCompare(b, "tr")
  );

  const normalized: Record<string, string[]> = {};
  for (const brand of brands) {
    normalized[brand] = [...modelsByBrand[brand]].sort((a, b) =>
      a.localeCompare(b, "tr")
    );
  }

  return { brands, modelsByBrand: normalized };
}
