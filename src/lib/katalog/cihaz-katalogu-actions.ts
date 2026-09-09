"use server";

import { revalidatePath } from "next/cache";
import type { DeviceCategory } from "@/lib/cihaz/types";
import {
  CIHAZ_KATALOGU_CATEGORIES,
  CIHAZ_KATALOGU_SPEC_FIELDS,
  type CihazKataloguAdminState,
} from "@/lib/katalog/cihaz-katalogu.types";
import { isSuperAdminUser } from "@/lib/auth/super-admin";
import { createClient } from "@/lib/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";

const REVALIDATE_PATHS = ["/local-yonetim/katalog"] as const;

type LegacyModelTable = "phone_models" | "tablet_models";

function legacyTableForCategory(
  category: DeviceCategory
): LegacyModelTable | null {
  if (category === "phone") return "phone_models";
  if (category === "tablet") return "tablet_models";
  return null;
}

function legacyModelColumn(category: DeviceCategory): "name" | "model_name" {
  return category === "phone" ? "name" : "model_name";
}

async function assertCatalogAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !isSuperAdminUser(user)) {
    return {
      error: "Bu işlem için süper admin yetkisi gerekir." as const,
      supabase: null as SupabaseClient | null,
    };
  }

  return { error: null, supabase };
}

function revalidateCatalogPaths() {
  for (const path of REVALIDATE_PATHS) {
    revalidatePath(path);
  }
}

function parseCategory(value: FormDataEntryValue | null): DeviceCategory | null {
  const category = String(value ?? "").trim();
  return CIHAZ_KATALOGU_CATEGORIES.includes(category as DeviceCategory)
    ? (category as DeviceCategory)
    : null;
}

function parseBaseSpecsFromForm(formData: FormData): Record<string, string> {
  const specs: Record<string, string> = {};

  for (const field of CIHAZ_KATALOGU_SPEC_FIELDS) {
    const value = String(formData.get(`spec_${field.key}`) ?? "").trim();
    if (value) {
      specs[field.key] = value;
    }
  }

  return specs;
}

async function syncLegacyModelUpsert(
  supabase: SupabaseClient,
  category: DeviceCategory,
  brand: string,
  modelName: string
) {
  let error: { message: string } | null = null;

  if (category === "phone") {
    ({ error } = await supabase
      .from("phone_models")
      .insert({ brand, name: modelName }));
  } else if (category === "tablet") {
    ({ error } = await supabase
      .from("tablet_models")
      .insert({ brand, model_name: modelName }));
  } else {
    return;
  }

  if (error && !error.message.toLowerCase().includes("duplicate")) {
    throw new Error(`Eski katalog senkronu başarısız: ${error.message}`);
  }
}

async function syncLegacyModelDelete(
  supabase: SupabaseClient,
  category: DeviceCategory,
  brand: string,
  modelName: string
) {
  const table = legacyTableForCategory(category);
  if (!table) return;

  const modelColumn = legacyModelColumn(category);
  const { error } = await supabase
    .from(table)
    .delete()
    .eq("brand", brand)
    .eq(modelColumn, modelName);

  if (error) {
    throw new Error(`Eski katalog silme senkronu başarısız: ${error.message}`);
  }
}

export async function upsertCihazKataloguForm(
  _prev: CihazKataloguAdminState,
  formData: FormData
): Promise<CihazKataloguAdminState> {
  const auth = await assertCatalogAdmin();
  if (auth.error || !auth.supabase) return { error: auth.error ?? undefined };

  const { supabase } = auth;
  const id = String(formData.get("id") ?? "").trim();
  const category = parseCategory(formData.get("category"));
  const brand = String(formData.get("brand") ?? "").trim();
  const modelName = String(formData.get("model_name") ?? "").trim();
  const sortOrderRaw = String(formData.get("sort_order") ?? "0").trim();
  const sortOrder = Number.parseInt(sortOrderRaw, 10);
  const baseSpecs = parseBaseSpecsFromForm(formData);

  if (!category) {
    return { error: "Geçerli bir kategori seçin." };
  }

  if (!brand) {
    return { error: "Marka zorunludur." };
  }

  if (!modelName) {
    return { error: "Model adı zorunludur." };
  }

  let previousRow: {
    category: DeviceCategory;
    brand: string;
    model_name: string;
  } | null = null;

  if (id) {
    const { data, error } = await supabase
      .from("cihaz_katalogu")
      .select("category, brand, model_name")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      return { error: error.message };
    }

    if (!data) {
      return { error: "Kayıt bulunamadı." };
    }

    previousRow = {
      category: data.category as DeviceCategory,
      brand: data.brand,
      model_name: data.model_name,
    };
  }

  const payload = {
    category,
    brand,
    model_name: modelName,
    base_specs: baseSpecs,
    sort_order: Number.isFinite(sortOrder) ? sortOrder : 0,
  };

  try {
    if (id) {
      const { error } = await supabase
        .from("cihaz_katalogu")
        .update(payload)
        .eq("id", id);

      if (error) {
        return { error: error.message };
      }

      if (previousRow) {
        const legacyChanged =
          previousRow.category !== category ||
          previousRow.brand !== brand ||
          previousRow.model_name !== modelName;

        if (legacyChanged) {
          await syncLegacyModelDelete(
            supabase,
            previousRow.category,
            previousRow.brand,
            previousRow.model_name
          );
        }
      }
    } else {
      const { error } = await supabase.from("cihaz_katalogu").insert(payload);

      if (error) {
        return { error: error.message };
      }
    }

    await syncLegacyModelUpsert(supabase, category, brand, modelName);
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "Kayıt güncellenemedi.",
    };
  }

  revalidateCatalogPaths();
  return { success: true };
}

export async function deleteCihazKataloguForm(
  _prev: CihazKataloguAdminState,
  formData: FormData
): Promise<CihazKataloguAdminState> {
  const auth = await assertCatalogAdmin();
  if (auth.error || !auth.supabase) return { error: auth.error ?? undefined };

  const { supabase } = auth;
  const id = String(formData.get("id") ?? "").trim();

  if (!id) {
    return { error: "Geçersiz kayıt." };
  }

  const { data, error: fetchError } = await supabase
    .from("cihaz_katalogu")
    .select("category, brand, model_name")
    .eq("id", id)
    .maybeSingle();

  if (fetchError) {
    return { error: fetchError.message };
  }

  if (!data) {
    return { error: "Kayıt bulunamadı." };
  }

  const { error } = await supabase.from("cihaz_katalogu").delete().eq("id", id);

  if (error) {
    return { error: error.message };
  }

  try {
    await syncLegacyModelDelete(
      supabase,
      data.category as DeviceCategory,
      data.brand,
      data.model_name
    );
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "Eski katalog senkronu başarısız.",
    };
  }

  revalidateCatalogPaths();
  return { success: true };
}

export async function deleteCihazKataloguBrandForm(
  _prev: CihazKataloguAdminState,
  formData: FormData
): Promise<CihazKataloguAdminState> {
  const auth = await assertCatalogAdmin();
  if (auth.error || !auth.supabase) return { error: auth.error ?? undefined };

  const { supabase } = auth;
  const category = parseCategory(formData.get("category"));
  const brand = String(formData.get("brand") ?? "").trim();

  if (!category || !brand) {
    return { error: "Marka silmek için kategori ve marka gerekir." };
  }

  const { data: rows, error: fetchError } = await supabase
    .from("cihaz_katalogu")
    .select("category, brand, model_name")
    .eq("category", category)
    .eq("brand", brand);

  if (fetchError) {
    return { error: fetchError.message };
  }

  const { error } = await supabase
    .from("cihaz_katalogu")
    .delete()
    .eq("category", category)
    .eq("brand", brand);

  if (error) {
    return { error: error.message };
  }

  try {
    for (const row of rows ?? []) {
      await syncLegacyModelDelete(
        supabase,
        row.category as DeviceCategory,
        row.brand,
        row.model_name
      );
    }
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "Eski katalog senkronu başarısız.",
    };
  }

  revalidateCatalogPaths();
  return { success: true };
}
