"use server";

import { revalidatePath } from "next/cache";
import { isWholesalerAccount, wholesalerStoreAccessError } from "@/lib/auth/wholesaler";
import { safeSyncDukkanUrunleri } from "@/lib/dukkan/db-payload";
import { parseUrunlerFromFormData } from "@/lib/dukkan/form-data";
import { logDukkanAction } from "@/lib/dukkan/logger";
import { createClient } from "@/lib/supabase/server";

export type DukkanUrunleriFormState = {
  error?: string;
  success?: boolean;
  warning?: string;
  savedCount?: number;
};

/** Yalnızca vitrin ürünlerini kaydeder; mağaza bilgilerine dokunmaz. */
export async function updateDukkanUrunleri(
  _prevState: DukkanUrunleriFormState,
  formData: FormData
): Promise<DukkanUrunleriFormState> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { error: "Ürünleri kaydetmek için giriş yapmalısınız." };
    }

    if (await isWholesalerAccount(supabase, user)) {
      return { error: wholesalerStoreAccessError() };
    }

    const dukkanId = String(formData.get("dukkan_id") ?? "").trim();
    if (!dukkanId) {
      return { error: "Geçersiz mağaza kaydı." };
    }

    const { data: dukkan, error: dukkanError } = await supabase
      .from("dukkanlar")
      .select("id, slug")
      .eq("id", dukkanId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (dukkanError) {
      logDukkanAction("updateDukkanUrunleri", "shop lookup failed", {
        dukkanId,
        error: dukkanError.message,
      });
      return { error: "Mağaza bilgisi okunamadı. Lütfen tekrar deneyin." };
    }

    if (!dukkan) {
      return { error: "Mağaza kaydı bulunamadı veya yetkiniz yok." };
    }

    const urunler = parseUrunlerFromFormData(formData);
    const syncResult = await safeSyncDukkanUrunleri(supabase, dukkan.id, urunler);

    if ("error" in syncResult) {
      logDukkanAction("updateDukkanUrunleri", "sync failed", {
        dukkanId: dukkan.id,
        error: syncResult.error,
        skippedColumns: syncResult.skippedColumns,
      });
      return { error: `Ürünler kaydedilemedi: ${syncResult.error}` };
    }

    revalidatePath(`/${dukkan.slug}`);
    revalidatePath("/dukkan-ayarlari");
    revalidatePath("/dukkan-ayarlari/urunler");

    return {
      success: true,
      savedCount: urunler.length,
      warning: syncResult.warning,
    };
  } catch (err) {
    logDukkanAction("updateDukkanUrunleri", "unexpected error", { err });
    return {
      error:
        err instanceof Error
          ? err.message
          : "Ürünler kaydedilirken beklenmeyen bir hata oluştu.",
    };
  }
}
