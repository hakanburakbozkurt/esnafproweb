"use client";

import { createClient } from "@/lib/supabase/client";
import {
  brandsMatch,
  DEVICE_MODEL_TABLES,
  mergeUniqueSorted,
  normalizeDeviceModelRow,
  type DeviceModelTable,
} from "@/lib/katalog/device-model-normalize";
import { normalizeCihazKataloguRow } from "@/lib/katalog/cihaz-katalogu.types";

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

async function queryCihazKataloguRows(
  brand?: string
): Promise<Array<{ brand: string; modelName: string }>> {
  const supabase = createClient();
  const { data, error } = await supabase.from("cihaz_katalogu").select("*");

  if (error || !data) return [];

  const rows = data.map((row) => normalizeCihazKataloguRow(row));
  if (!brand?.trim()) {
    return rows.map((row) => ({ brand: row.brand, modelName: row.model_name }));
  }

  return rows
    .filter((row) => brandsMatch(row.brand, brand))
    .map((row) => ({ brand: row.brand, modelName: row.model_name }));
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

  for (const row of await queryCihazKataloguRows()) {
    if (row.brand) brandSet.add(row.brand);
  }

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

  for (const row of await queryCihazKataloguRows(brand)) {
    if (row.modelName) modelSet.add(row.modelName);
  }

  return mergeUniqueSorted([...modelSet]);
}
