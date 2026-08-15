"use client";

import { createClient } from "@/lib/supabase/client";
import {
  brandsMatch,
  DEVICE_MODEL_TABLES,
  mergeUniqueSorted,
  normalizeDeviceModelRow,
  type DeviceModelTable,
} from "@/lib/katalog/device-model-normalize";

async function queryDeviceModelRows(
  table: DeviceModelTable,
  brand?: string
): Promise<Record<string, unknown>[]> {
  const supabase = createClient();
  const { data, error } = await supabase.from(table).select("*");

  if (error || !data) return [];

  const rows = data as Record<string, unknown>[];
  if (!brand?.trim()) return rows;

  return rows.filter((row) =>
    brandsMatch(normalizeDeviceModelRow(row).brand, brand)
  );
}

export async function fetchDeviceModelBrands(): Promise<string[]> {
  const brandSet = new Set<string>();

  await Promise.all(
    DEVICE_MODEL_TABLES.map(async (table) => {
      const rows = await queryDeviceModelRows(table);
      for (const row of rows) {
        const { brand } = normalizeDeviceModelRow(row);
        if (brand) brandSet.add(brand);
      }
    })
  );

  return mergeUniqueSorted([...brandSet]);
}

export async function fetchDeviceModelsForBrand(brand: string): Promise<string[]> {
  if (!brand.trim()) return [];

  const modelSet = new Set<string>();

  await Promise.all(
    DEVICE_MODEL_TABLES.map(async (table) => {
      const rows = await queryDeviceModelRows(table, brand);
      for (const row of rows) {
        const { brand: rowBrand, modelName } = normalizeDeviceModelRow(row);
        if (!modelName || !brandsMatch(rowBrand, brand)) continue;
        modelSet.add(modelName);
      }
    })
  );

  return mergeUniqueSorted([...modelSet]);
}
