"use client";

import { useEffect, useMemo, useState } from "react";
import {
  fetchDeviceModelBrands,
  fetchDeviceModelsForBrand,
} from "@/lib/katalog/device-model-queries";
import {
  extractBrandsFromKatalogItems,
  extractModelsFromKatalogItems,
  mergeUniqueSorted,
} from "@/lib/katalog/device-model-normalize";
import type { KatalogWebItem } from "@/types/database.types";

export function useKatalogDeviceFilters(items: KatalogWebItem[]) {
  const [brand, setBrandState] = useState("");
  const [model, setModel] = useState("");
  const [brands, setBrands] = useState<string[]>([]);
  const [models, setModels] = useState<string[]>([]);
  const [brandsLoading, setBrandsLoading] = useState(true);
  const [modelsLoading, setModelsLoading] = useState(false);

  const catalogBrands = useMemo(
    () => extractBrandsFromKatalogItems(items),
    [items]
  );

  useEffect(() => {
    let cancelled = false;

    async function loadBrands() {
      setBrandsLoading(true);

      try {
        const remoteBrands = await fetchDeviceModelBrands();
        if (cancelled) return;

        setBrands(mergeUniqueSorted([...remoteBrands, ...catalogBrands]));
      } catch {
        if (!cancelled) {
          setBrands(catalogBrands);
        }
      } finally {
        if (!cancelled) {
          setBrandsLoading(false);
        }
      }
    }

    void loadBrands();

    return () => {
      cancelled = true;
    };
  }, [catalogBrands]);

  useEffect(() => {
    if (!brand) {
      setModels([]);
      setModelsLoading(false);
      return;
    }

    let cancelled = false;

    async function loadModels() {
      setModelsLoading(true);

      try {
        const remoteModels = await fetchDeviceModelsForBrand(brand);
        if (cancelled) return;

        const fallbackModels = extractModelsFromKatalogItems(items, brand);
        setModels(mergeUniqueSorted([...remoteModels, ...fallbackModels]));
      } catch {
        if (!cancelled) {
          setModels(extractModelsFromKatalogItems(items, brand));
        }
      } finally {
        if (!cancelled) {
          setModelsLoading(false);
        }
      }
    }

    void loadModels();

    return () => {
      cancelled = true;
    };
  }, [brand, items]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const itemBrand = item.brand?.trim() ?? "";
      const itemModel = item.model_name?.trim() ?? "";

      if (brand && itemBrand.localeCompare(brand, "tr", { sensitivity: "base" }) !== 0) {
        return false;
      }

      if (model && itemModel.localeCompare(model, "tr", { sensitivity: "base" }) !== 0) {
        return false;
      }

      return true;
    });
  }, [items, brand, model]);

  function setBrand(nextBrand: string) {
    setBrandState(nextBrand);
    setModel("");
  }

  function resetFilters() {
    setBrandState("");
    setModel("");
  }

  return {
    brand,
    model,
    brands,
    models,
    brandsLoading,
    modelsLoading,
    filteredItems,
    setBrand,
    setModel,
    resetFilters,
  };
}
