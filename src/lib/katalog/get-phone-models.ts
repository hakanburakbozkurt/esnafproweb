import { createClient } from "@/lib/supabase/server";
import {
  DEVICE_MODEL_TABLES,
  mergeUniqueSorted,
  normalizeDeviceModelRow,
} from "@/lib/katalog/device-model-normalize";
import type { PhoneModel } from "@/types/database.types";

export async function getPhoneModels(): Promise<PhoneModel[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("phone_models")
      .select("*")
      .order("brand", { ascending: true })
      .order("model_name", { ascending: true });

    if (error || !data) return [];
    return data;
  } catch {
    return [];
  }
}

export async function getAllDeviceModels(): Promise<
  Array<Record<string, unknown>>
> {
  const supabase = await createClient();
  const rows: Array<Record<string, unknown>> = [];

  for (const table of DEVICE_MODEL_TABLES) {
    const { data, error } = await supabase.from(table).select("*");
    if (error || !data) continue;
    rows.push(...(data as Record<string, unknown>[]));
  }

  return rows;
}

export async function getDeviceModelBrands(): Promise<string[]> {
  const rows = await getAllDeviceModels();
  return mergeUniqueSorted(
    rows.map((row) => normalizeDeviceModelRow(row).brand).filter(Boolean)
  );
}
