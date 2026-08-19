"use server";

import { revalidatePath } from "next/cache";
import { logDukkanAction } from "@/lib/dukkan/logger";
import {
  invalidateGoogleReviewsCache,
  refreshGoogleReviewsCache,
} from "@/lib/google-reviews/get-google-reviews";
import { parseGoogleMapsInput } from "@/lib/google-reviews/place-id";
import { createClient } from "@/lib/supabase/server";

export type AdminShopSettingsState = {
  error?: string;
  success?: string;
};

export async function updateAdminShopGoogleReviews(
  _prev: AdminShopSettingsState,
  formData: FormData
): Promise<AdminShopSettingsState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Bu işlem için giriş yapmalısınız." };
  }

  const googleReviewsEnabled =
    String(formData.get("google_reviews_enabled") ?? "false") === "true";
  const googleMapsReference = String(
    formData.get("google_maps_reference") ?? ""
  ).trim();
  const googlePlaceId = parseGoogleMapsInput(googleMapsReference);

  if (googleReviewsEnabled && !googlePlaceId) {
    return {
      error:
        "Google yorumları açıkken geçerli bir Google Maps linki veya Place ID (ChIJ...) girmelisiniz.",
    };
  }

  const { data: current, error: fetchError } = await supabase
    .from("dukkanlar")
    .select("id, slug, google_place_id, google_reviews_enabled")
    .eq("user_id", user.id)
    .maybeSingle();

  if (fetchError) {
    logDukkanAction("updateAdminShopGoogleReviews", "fetch failed", {
      err: fetchError.message,
    });
    return { error: "Dükkan bilgisi alınamadı." };
  }

  if (!current) {
    return {
      error: "Henüz bir dükkanınız yok. Önce /dukkan-ac üzerinden dükkan oluşturun.",
    };
  }

  const { error: updateError } = await supabase
    .from("dukkanlar")
    .update({
      google_place_id: googlePlaceId,
      google_reviews_enabled: googleReviewsEnabled,
      updated_at: new Date().toISOString(),
    })
    .eq("id", current.id)
    .eq("user_id", user.id);

  if (updateError) {
    logDukkanAction("updateAdminShopGoogleReviews", "update failed", {
      dukkanId: current.id,
      err: updateError.message,
    });
    return { error: `Kayıt güncellenemedi: ${updateError.message}` };
  }

  const googleConfigChanged =
    current.google_place_id !== googlePlaceId ||
    current.google_reviews_enabled !== googleReviewsEnabled;

  try {
    if (googleReviewsEnabled && googlePlaceId) {
      if (googleConfigChanged) {
        await refreshGoogleReviewsCache(supabase, current.id, googlePlaceId);
      }
    } else if (
      googleConfigChanged ||
      current.google_reviews_enabled ||
      current.google_place_id
    ) {
      await invalidateGoogleReviewsCache(supabase, current.id);
    }
  } catch (err) {
    logDukkanAction("updateAdminShopGoogleReviews", "google cache refresh failed", {
      dukkanId: current.id,
      err,
    });
    revalidatePath("/yonetim/admin");
    revalidatePath(`/${current.slug}`);
    return {
      success: "Google ayarları kaydedildi.",
      error:
        "Yorum önbelleği yenilenemedi; vitrin bir süre sonra güncellenecektir.",
    };
  }

  revalidatePath("/yonetim/admin");
  revalidatePath(`/${current.slug}`);

  return { success: "Google yorum ayarları kaydedildi." };
}
