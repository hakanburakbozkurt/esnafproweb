"use server";

import { revalidatePath } from "next/cache";
import { isWholesalerAccount, wholesalerStoreAccessError } from "@/lib/auth/wholesaler";
import { buildDevicePayload } from "@/lib/cihaz/build-device-payload";
import { logCihazAction } from "@/lib/cihaz/logger";
import type {
  ConsoleCategoryForm,
  ComputerCategoryForm,
  PhoneCategoryForm,
  SharedCihazForm,
  TabletCategoryForm,
  WatchCategoryForm,
} from "@/lib/cihaz/use-cihaz-al-category-forms";
import type { IkinciElCihaz, WebPublishingPatch } from "@/lib/cihaz/types";
import { mapDeviceRowFromDb } from "@/lib/cihaz/types";
import type { Database } from "@/types/database.types";
import { createClient } from "@/lib/supabase/server";
import { revalidateSitemap } from "@/lib/seo/sitemap-cache";
import { slugify } from "@/lib/utils/slug";

export type CihazActionResult =
  | { ok: true; deviceId?: string }
  | { ok: false; error: string };

export type CihazListResult =
  | { ok: true; devices: IkinciElCihaz[] }
  | { ok: false; error: string };

type SaveDeviceInput = {
  deviceId?: string | null;
  shared: SharedCihazForm;
  phone: PhoneCategoryForm;
  tablet: TabletCategoryForm;
  computer: ComputerCategoryForm;
  watch: WatchCategoryForm;
  console: ConsoleCategoryForm;
  imageUrls: string[];
};

async function requireStoreOwner() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false as const, error: "Giriş yapmalısınız." };
  }

  if (await isWholesalerAccount(supabase, user)) {
    return { ok: false as const, error: wholesalerStoreAccessError() };
  }

  const { data: dukkan } = await supabase
    .from("dukkanlar")
    .select("slug")
    .eq("user_id", user.id)
    .maybeSingle();

  return { ok: true as const, supabase, user, shopSlug: dukkan?.slug ?? null };
}

function revalidateCihazPaths(shopSlug: string | null) {
  revalidatePath("/pazaryeri");
  revalidatePath("/yonetim/cihazlar");
  if (shopSlug) {
    revalidatePath(`/${shopSlug}/pazaryeri`);
  }
  revalidateSitemap();
}

async function ensureUniqueWebSlug(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  brand: string,
  model: string,
  deviceId?: string
): Promise<string> {
  const base = slugify(`${brand}-${model}`) || "cihaz";
  let candidate = base;
  let suffix = 1;

  while (suffix < 100) {
    let query = supabase
      .from("second_hand_devices")
      .select("id")
      .eq("user_id", userId)
      .eq("web_slug", candidate);

    if (deviceId) {
      query = query.neq("id", deviceId);
    }

    const { data } = await query.maybeSingle();
    if (!data) return candidate;
    suffix += 1;
    candidate = `${base}-${suffix}`;
  }

  return `${base}-${Date.now()}`;
}

export async function listOwnerSecondHandDevices(): Promise<CihazListResult> {
  try {
    const auth = await requireStoreOwner();
    if (!auth.ok) return auth;

    const { data, error } = await auth.supabase
      .from("second_hand_devices")
      .select("*")
      .eq("user_id", auth.user.id)
      .order("created_at", { ascending: false });

    if (error) {
      logCihazAction("listOwnerSecondHandDevices", error.message);
      return { ok: false, error: "Cihaz listesi yüklenemedi." };
    }

    const devices = ((data ?? []) as IkinciElCihaz[]).map(mapDeviceRowFromDb);
    return { ok: true, devices };
  } catch (err) {
    logCihazAction("listOwnerSecondHandDevices", "unexpected error", { err });
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Beklenmeyen hata.",
    };
  }
}

export async function saveSecondHandDevice(
  input: SaveDeviceInput
): Promise<CihazActionResult> {
  try {
    const auth = await requireStoreOwner();
    if (!auth.ok) return auth;

    const built = buildDevicePayload({
      userId: auth.user.id,
      shared: input.shared,
      phone: input.phone,
      tablet: input.tablet,
      computer: input.computer,
      watch: input.watch,
      console: input.console,
      imageUrls: input.imageUrls,
    });

    if (!built.ok) return built;

    const payload = built.payload;

    if (payload.imei) {
      let imeiQuery = auth.supabase
        .from("second_hand_devices")
        .select("id")
        .eq("user_id", auth.user.id)
        .eq("imei", payload.imei)
        .eq("status", "available");

      if (input.deviceId) {
        imeiQuery = imeiQuery.neq("id", input.deviceId);
      }

      const { data: duplicate } = await imeiQuery.maybeSingle();
      if (duplicate) {
        return {
          ok: false,
          error: "Bu IMEI numarasına ait cihaz zaten vitrinde (satılık).",
        };
      }
    }

    if (input.deviceId) {
      const { user_id: _uid, status: _st, ...updateRow } = payload;
      const { error } = await auth.supabase
        .from("second_hand_devices")
        .update(updateRow)
        .eq("id", input.deviceId)
        .eq("user_id", auth.user.id);

      if (error) {
        logCihazAction("saveSecondHandDevice", error.message, {
          deviceId: input.deviceId,
        });
        return { ok: false, error: error.message };
      }

      revalidateCihazPaths(auth.shopSlug);
      return { ok: true, deviceId: input.deviceId };
    }

    const { data, error } = await auth.supabase
      .from("second_hand_devices")
      .insert([payload])
      .select("id")
      .single();

    if (error) {
      logCihazAction("saveSecondHandDevice", error.message);
      return { ok: false, error: error.message };
    }

    revalidateCihazPaths(auth.shopSlug);
    return { ok: true, deviceId: data.id };
  } catch (err) {
    logCihazAction("saveSecondHandDevice", "unexpected error", { err });
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Kayıt sırasında hata oluştu.",
    };
  }
}

export async function updateSecondHandDeviceWebPublishing(
  deviceId: string,
  patch: WebPublishingPatch
): Promise<CihazActionResult> {
  try {
    const auth = await requireStoreOwner();
    if (!auth.ok) return auth;

    const id = deviceId.trim();
    if (!id) return { ok: false, error: "Cihaz bulunamadı." };

    const { data: existing, error: fetchError } = await auth.supabase
      .from("second_hand_devices")
      .select("id, brand, model, web_slug, web_title, web_published_at")
      .eq("id", id)
      .eq("user_id", auth.user.id)
      .maybeSingle();

    if (fetchError || !existing) {
      return { ok: false, error: "Cihaz bulunamadı." };
    }

    const updatePayload: Database["public"]["Tables"]["second_hand_devices"]["Update"] =
      {
        web_published: patch.web_published,
      };

    if ("web_title" in patch) {
      updatePayload.web_title = patch.web_title ?? null;
    }
    if ("web_description" in patch) {
      updatePayload.web_description = patch.web_description ?? null;
    }

    if (patch.web_published) {
      if (!existing.web_published_at) {
        updatePayload.web_published_at = new Date().toISOString();
      }
      if (!existing.web_slug?.trim()) {
        updatePayload.web_slug = await ensureUniqueWebSlug(
          auth.supabase,
          auth.user.id,
          existing.brand ?? "cihaz",
          existing.model ?? "",
          id
        );
      }
      if (!existing.web_title?.trim() && !("web_title" in patch)) {
        updatePayload.web_title = `${existing.brand ?? ""} ${existing.model ?? ""}`.trim();
      }
    }

    const { error } = await auth.supabase
      .from("second_hand_devices")
      .update(updatePayload)
      .eq("id", id)
      .eq("user_id", auth.user.id);

    if (error) {
      logCihazAction("updateSecondHandDeviceWebPublishing", error.message, {
        deviceId: id,
      });
      return { ok: false, error: error.message };
    }

    revalidateCihazPaths(auth.shopSlug);
    return { ok: true, deviceId: id };
  } catch (err) {
    logCihazAction("updateSecondHandDeviceWebPublishing", "unexpected error", {
      err,
    });
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Yayın durumu güncellenemedi.",
    };
  }
}

export async function markSecondHandDeviceSold(
  deviceId: string
): Promise<CihazActionResult> {
  try {
    const auth = await requireStoreOwner();
    if (!auth.ok) return auth;

    const { error } = await auth.supabase
      .from("second_hand_devices")
      .update({ status: "sold", web_published: false })
      .eq("id", deviceId)
      .eq("user_id", auth.user.id)
      .eq("status", "available");

    if (error) {
      logCihazAction("markSecondHandDeviceSold", error.message, { deviceId });
      return { ok: false, error: error.message };
    }

    revalidateCihazPaths(auth.shopSlug);
    return { ok: true, deviceId };
  } catch (err) {
    logCihazAction("markSecondHandDeviceSold", "unexpected error", { err });
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Satıldı işaretlenemedi.",
    };
  }
}

export async function deleteSecondHandDevice(
  deviceId: string
): Promise<CihazActionResult> {
  try {
    const auth = await requireStoreOwner();
    if (!auth.ok) return auth;

    const { error } = await auth.supabase
      .from("second_hand_devices")
      .delete()
      .eq("id", deviceId)
      .eq("user_id", auth.user.id);

    if (error) {
      logCihazAction("deleteSecondHandDevice", error.message, { deviceId });
      return { ok: false, error: error.message };
    }

    revalidateCihazPaths(auth.shopSlug);
    return { ok: true, deviceId };
  } catch (err) {
    logCihazAction("deleteSecondHandDevice", "unexpected error", { err });
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Cihaz silinemedi.",
    };
  }
}
