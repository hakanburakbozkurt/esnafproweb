"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { logDukkanAction } from "@/lib/dukkan/logger";
import { isWholesalerAccount, wholesalerStoreAccessError } from "@/lib/auth/wholesaler";
import { revalidateSitemap } from "@/lib/seo/sitemap-cache";
import {
  mergeWarnings,
  safeInsertDukkan,
  safeSyncDukkanUrunleri,
  safeUpdateDukkan,
  toDukkanDbPayload,
} from "@/lib/dukkan/db-payload";
import { assertSlugAvailable, SLUG_TAKEN_ERROR } from "@/lib/dukkan/slug-availability";
import { parseDukkanFormData } from "@/lib/dukkan/form-data";

export type DukkanFormState = {
  error?: string;
  success?: boolean;
  slug?: string;
  warning?: string;
};

function revalidateDukkanPaths(slug: string, previousSlug?: string) {
  revalidatePath(`/${slug}`);
  revalidatePath(`/${slug}/iletisim`);
  revalidatePath(`/${slug}/teknik-servis`);
  revalidatePath(`/${slug}/hakkimizda`);
  revalidatePath(`/${slug}/blog`);
  revalidatePath(`/${slug}/pazaryeri`);
  revalidatePath(`/${slug}/katalog`);
  revalidatePath("/dukkan-ayarlari");
  revalidateSitemap();

  if (previousSlug && previousSlug !== slug) {
    revalidatePath(`/${previousSlug}`);
    revalidatePath(`/${previousSlug}/iletisim`);
    revalidatePath(`/${previousSlug}/teknik-servis`);
    revalidatePath(`/${previousSlug}/hakkimizda`);
    revalidatePath(`/${previousSlug}/blog`);
    revalidatePath(`/${previousSlug}/pazaryeri`);
    revalidatePath(`/${previousSlug}/katalog`);
  }
}

export async function createDukkan(
  _prevState: DukkanFormState,
  formData: FormData
): Promise<DukkanFormState> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { error: "Mağaza açmak için giriş yapmalısınız." };
    }

    if (await isWholesalerAccount(supabase, user)) {
      return { error: wholesalerStoreAccessError() };
    }

    const parsed = parseDukkanFormData(formData);
    if ("error" in parsed) {
      return { error: parsed.error };
    }

    const { urunler, ...dukkanData } = parsed.data;
    const payload = toDukkanDbPayload(dukkanData);

    const slugCheck = await assertSlugAvailable(supabase, payload.slug);
    if ("error" in slugCheck) {
      return { error: slugCheck.error };
    }

    const { data: existing } = await supabase
      .from("dukkanlar")
      .select("slug")
      .eq("user_id", user.id)
      .maybeSingle();

    if (existing?.slug) {
      redirect(`/${existing.slug}`);
    }

    const insertResult = await safeInsertDukkan(supabase, {
      userId: user.id,
      payload,
    });

    if ("error" in insertResult) {
      logDukkanAction("createDukkan", "insert failed", {
        error: insertResult.error,
        payload,
        skippedColumns: insertResult.skippedColumns,
      });
      if (insertResult.code === "23505") {
        return { error: SLUG_TAKEN_ERROR };
      }
      return { error: insertResult.error };
    }

    const { data: created, warning: dukkanWarning } = insertResult;

    const syncResult = await safeSyncDukkanUrunleri(supabase, created.id, urunler);
    if ("error" in syncResult) {
      logDukkanAction("syncUrunler", "insert failed", {
        dukkanId: created.id,
        error: syncResult.error,
        skippedColumns: syncResult.skippedColumns,
      });
      revalidateDukkanPaths(created.slug);
      return {
        success: true,
        slug: created.slug,
        warning: mergeWarnings(
          dukkanWarning,
          `Mağaza açıldı fakat ürünler kaydedilemedi: ${syncResult.error}`
        ),
      };
    }

    revalidateDukkanPaths(created.slug);
    return {
      success: true,
      slug: created.slug,
      warning: mergeWarnings(dukkanWarning, syncResult.warning),
    };
  } catch (err) {
    logDukkanAction("createDukkan", "unexpected error", { err });
    return {
      error: err instanceof Error ? err.message : "Mağaza oluşturulurken beklenmeyen bir hata oluştu.",
    };
  }
}

export async function updateDukkan(
  _prevState: DukkanFormState,
  formData: FormData
): Promise<DukkanFormState> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { error: "Mağaza güncellemek için giriş yapmalısınız." };
    }

    if (await isWholesalerAccount(supabase, user)) {
      return { error: wholesalerStoreAccessError() };
    }

    const dukkanId = String(formData.get("dukkan_id") ?? "");
    if (!dukkanId) {
      return { error: "Geçersiz mağaza kaydı." };
    }

    const parsed = parseDukkanFormData(formData);
    if ("error" in parsed) {
      return { error: parsed.error };
    }

    const { urunler, ...dukkanData } = parsed.data;
    const payload = toDukkanDbPayload(dukkanData);

    const slugCheck = await assertSlugAvailable(supabase, payload.slug, dukkanId);
    if ("error" in slugCheck) {
      return { error: slugCheck.error };
    }

    const { data: current } = await supabase
      .from("dukkanlar")
      .select("slug")
      .eq("id", dukkanId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (!current) {
      return { error: "Mağaza kaydı bulunamadı veya yetkiniz yok." };
    }

    const updateResult = await safeUpdateDukkan(supabase, {
      dukkanId,
      userId: user.id,
      payload,
    });

    if ("error" in updateResult) {
      logDukkanAction("updateDukkan", "update failed", {
        dukkanId,
        error: updateResult.error,
        payload,
        skippedColumns: updateResult.skippedColumns,
      });
      if (updateResult.code === "23505") {
        return { error: SLUG_TAKEN_ERROR };
      }
      return { error: `Kayıt güncellenemedi: ${updateResult.error}` };
    }

    const { data, warning: dukkanWarning } = updateResult;

    const syncResult = await safeSyncDukkanUrunleri(supabase, data.id, urunler);
    if ("error" in syncResult) {
      logDukkanAction("syncUrunler", "sync failed", {
        dukkanId: data.id,
        error: syncResult.error,
        skippedColumns: syncResult.skippedColumns,
      });
      revalidateDukkanPaths(data.slug, current.slug);
      return {
        success: true,
        slug: data.slug,
        warning: mergeWarnings(
          dukkanWarning,
          `İletişim ve mağaza bilgileri kaydedildi fakat ürünler güncellenemedi: ${syncResult.error}`
        ),
      };
    }

    revalidateDukkanPaths(data.slug, current.slug);
    return {
      success: true,
      slug: data.slug,
      warning: mergeWarnings(dukkanWarning, syncResult.warning),
    };
  } catch (err) {
    logDukkanAction("updateDukkan", "unexpected error", { err });
    return {
      error: err instanceof Error ? err.message : "Güncelleme sırasında beklenmeyen bir hata oluştu.",
    };
  }
}
