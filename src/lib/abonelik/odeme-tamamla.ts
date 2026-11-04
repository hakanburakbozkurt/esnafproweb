import "server-only";

import { dogrulaIyzicoSonucu } from "@/lib/abonelik/odeme-kurallari";
import { logDukkanAction } from "@/lib/dukkan/logger";
import { iyzicoCheckoutSonucu } from "@/lib/odeme/iyzico";
import { createAdminClient } from "@/lib/supabase/admin";

export type CallbackSonucu = "basarili" | "basarisiz" | "inceleme";

/**
 * İyzico callback'i: token ile kaydı bulur, sonucu İyzico'dan sunucu tarafında çeker ve doğrular.
 * Callback gövdesine güvenilmez; paket yalnızca doğrulanmış ödemede atanır.
 */
export async function iyzicoCallbackIsle(token: string): Promise<CallbackSonucu> {
  const action = "iyzicoCallbackIsle";
  const admin = createAdminClient();
  const simdi = () => new Date().toISOString();

  const { data: kayit, error: kayitError } = await admin
    .from("abonelik_odemeleri")
    .select("id, conversation_id, tutar, para_birimi, durum")
    .eq("iyzico_token", token)
    .maybeSingle();

  if (kayitError || !kayit) {
    logDukkanAction(action, "payment row not found for token", { error: kayitError?.message });
    return "basarisiz";
  }
  if (kayit.durum === "odendi") return "basarili";
  if (kayit.durum === "basarisiz") return "basarisiz";

  const sonuc = await iyzicoCheckoutSonucu(token, kayit.conversation_id);
  if (!sonuc.ok) {
    // Ödemenin durumu bilinmiyor: kayıt beklemede kalır, admin İyzico panelinden kontrol eder
    logDukkanAction(action, "retrieve failed", { odemeId: kayit.id, error: sonuc.error });
    await admin
      .from("abonelik_odemeleri")
      .update({ hata_mesaji: `Sonuç alınamadı: ${sonuc.error}`, updated_at: simdi() })
      .eq("id", kayit.id);
    return "inceleme";
  }

  const karar = dogrulaIyzicoSonucu(
    {
      id: kayit.id,
      conversation_id: kayit.conversation_id,
      tutar: Number(kayit.tutar),
      para_birimi: kayit.para_birimi,
    },
    sonuc.sonuc
  );

  if (karar.karar === "basarisiz") {
    await admin
      .from("abonelik_odemeleri")
      .update({ durum: "basarisiz", hata_mesaji: karar.neden, updated_at: simdi() })
      .eq("id", kayit.id)
      .eq("durum", "beklemede");
    return "basarisiz";
  }

  if (karar.karar === "inceleme") {
    logDukkanAction(action, "payment needs review", { odemeId: kayit.id, neden: karar.neden });
    await admin
      .from("abonelik_odemeleri")
      .update({
        hata_mesaji: `İnceleme: ${karar.neden}`,
        iyzico_payment_id: sonuc.sonuc.paymentId,
        updated_at: simdi(),
      })
      .eq("id", kayit.id);
    return "inceleme";
  }

  const { error: tamamlaError } = await admin.rpc("abonelik_odeme_tamamla", {
    p_odeme_id: kayit.id,
    p_iyzico_payment_id: karar.paymentId,
  });

  if (tamamlaError) {
    // Para çekildi ama paket atanamadı: admin elle atar veya iade eder
    logDukkanAction(action, "activation failed after successful payment", {
      odemeId: kayit.id,
      error: tamamlaError.message,
    });
    await admin
      .from("abonelik_odemeleri")
      .update({
        hata_mesaji: `Ödeme alındı, paket atanamadı: ${tamamlaError.message}`,
        iyzico_payment_id: karar.paymentId,
        updated_at: simdi(),
      })
      .eq("id", kayit.id);
    return "inceleme";
  }

  return "basarili";
}
