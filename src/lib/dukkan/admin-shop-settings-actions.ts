"use server";

import { revalidatePath } from "next/cache";
import {
  parseCoordinateInput,
  validateCoordinates,
} from "@/lib/dukkan/location";
import { logDukkanAction } from "@/lib/dukkan/logger";
import { createClient } from "@/lib/supabase/server";

export type AdminShopSettingsState = {
  error?: string;
  success?: string;
};

export async function updateAdminShopLocation(
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

  const enlem = parseCoordinateInput(formData.get("enlem"));
  const boylam = parseCoordinateInput(formData.get("boylam"));

  const coordinateError = validateCoordinates(enlem, boylam);
  if (coordinateError) {
    return { error: coordinateError };
  }

  const { data: current, error: fetchError } = await supabase
    .from("dukkanlar")
    .select("id, slug")
    .eq("user_id", user.id)
    .maybeSingle();

  if (fetchError) {
    logDukkanAction("updateAdminShopLocation", "fetch failed", {
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
      enlem,
      boylam,
      updated_at: new Date().toISOString(),
    })
    .eq("id", current.id)
    .eq("user_id", user.id);

  if (updateError) {
    logDukkanAction("updateAdminShopLocation", "update failed", {
      dukkanId: current.id,
      err: updateError.message,
    });
    return { error: `Kayıt güncellenemedi: ${updateError.message}` };
  }

  revalidatePath("/yonetim/admin");
  revalidatePath(`/${current.slug}`);
  revalidatePath(`/${current.slug}/iletisim`);

  return { success: "Dükkan konumu kaydedildi." };
}
