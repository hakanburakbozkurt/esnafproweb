"use client";

import { useMemo, useState } from "react";
import type { KatalogWebItem } from "@/types/database.types";

export function useKatalogFilters(items: KatalogWebItem[]) {
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const itemBrand = item.brand?.trim() ?? "";
      const itemModel = item.model_name?.trim() ?? "";

      if (brand && itemBrand !== brand) return false;
      if (model && itemModel !== model) return false;
      return true;
    });
  }, [items, brand, model]);

  function selectBrand(nextBrand: string) {
    setBrand(nextBrand);
    setModel("");
  }

  return {
    brand,
    model,
    setBrand: selectBrand,
    setModel,
    filteredItems,
    resetFilters() {
      setBrand("");
      setModel("");
    },
  };
}
