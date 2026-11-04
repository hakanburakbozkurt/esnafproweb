"use server";

import { revalidatePath } from "next/cache";
import { isSuperAdminUser } from "@/lib/auth/super-admin";
import { logDukkanAction } from "@/lib/dukkan/logger";
import { createClient } from "@/lib/supabase/server";

export type FaturaGuncelleState = { error?: string; success?: string };

/** Süper admin: ödemenin faturasını "kesildi" olarak işaretler (RLS: yalnızca süper admin günceller). */
export async function faturaDurumuGuncelle(
  _prev: FaturaGuncelleState,
  formData: FormData
): Promise<FaturaGuncelleState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !isSuperAdminUser(user)) return { error: "Bu işlem için yetkiniz yok." };

  const odemeId = String(formData.get("odeme_id") ?? "").trim();
  const faturaNo = String(formData.get("fatura_no") ?? "").trim().slice(0, 64);
  const kesildi = formData.get("kesildi") === "true";
  if (!odemeId) return { error: "Ödeme bulunamadı." };
  if (kesildi && !faturaNo) return { error: "Fatura numarasını yazın." };

  const { data, error } = await supabase
    .from("abonelik_odemeleri")
    .update({
      fatura_durumu: kesildi ? "kesildi" : "bekliyor",
      fatura_no: kesildi ? faturaNo : null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", odemeId)
    .eq("durum", "odendi")
    .select("id");

  if (error) {
    logDukkanAction("faturaDurumuGuncelle", "update failed", { odemeId, error: error.message });
    return { error: "Fatura durumu kaydedilemedi." };
  }
  if (!data?.length) return { error: "Yalnızca ödenmiş kayıtların faturası işaretlenebilir." };

  revalidatePath("/yonetim/admin/odemeler");
  return { success: kesildi ? "Fatura kesildi olarak işaretlendi." : "Fatura bekliyor olarak işaretlendi." };
}
