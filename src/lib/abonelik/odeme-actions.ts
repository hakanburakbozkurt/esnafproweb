"use server";

import { randomUUID } from "node:crypto";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getShopPlan } from "@/lib/abonelik/get-shop-plan";
import {
  adSoyadAyir,
  getOdemeAkisiModu,
  hesaplaAbonelikTutari,
  isAbonelikSuresi,
  isSatinAlinabilirPaket,
  odemeKullanilabilir,
  parseFaturaBilgileri,
  satinAlmaEngeli,
} from "@/lib/abonelik/odeme-kurallari";
import { getSaticiBilgileri } from "@/lib/abonelik/satici-bilgileri";
import { getPublicSiteUrl } from "@/lib/auth/site-url";
import { isSuperAdminUser } from "@/lib/auth/super-admin";
import { isWholesalerAccount, wholesalerStoreAccessError } from "@/lib/auth/wholesaler";
import { logDukkanAction } from "@/lib/dukkan/logger";
import { getIyzicoConfig, iyzicoCheckoutBaslat } from "@/lib/odeme/iyzico";
import { sanitizeIyzicoText } from "@/lib/odeme/iyzico-utils";
import { createAdminClient, isAdminClientConfigured } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export type AbonelikOdemeState = { error?: string };

/** Kurumsal alıcıda İyzico 11 haneli kimlik ister; VKN fatura kaydında ayrıca saklanır. */
const KURUMSAL_IYZICO_KIMLIK = "11111111111";

function getCallbackUrl(): string {
  const base = process.env.IYZICO_CALLBACK_BASE_URL?.trim().replace(/\/+$/, "") || getPublicSiteUrl();
  return `${base}/api/odeme/iyzico/callback`;
}

async function getIstemciIp(): Promise<string> {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || h.get("x-real-ip")?.trim() || "127.0.0.1";
}

export async function abonelikOdemeBaslat(
  _prev: AbonelikOdemeState,
  formData: FormData
): Promise<AbonelikOdemeState> {
  const action = "abonelikOdemeBaslat";
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Ödeme için giriş yapmalısınız." };
  if (await isWholesalerAccount(supabase, user)) return { error: wholesalerStoreAccessError() };

  const mod = getOdemeAkisiModu();
  if (!odemeKullanilabilir(mod, isSuperAdminUser(user))) {
    return { error: "Online ödeme henüz açılmadı." };
  }
  if (mod === "acik" && getSaticiBilgileri().eksikAlanlar.length > 0) {
    logDukkanAction(action, "seller info missing", { eksik: getSaticiBilgileri().eksikAlanlar });
    return { error: "Ödeme şu an kullanılamıyor. Lütfen daha sonra tekrar deneyin." };
  }
  if (!isAdminClientConfigured() || !getIyzicoConfig()) {
    logDukkanAction(action, "payment env not configured");
    return { error: "Ödeme altyapısı yapılandırılmamış. Lütfen daha sonra tekrar deneyin." };
  }

  const paket = String(formData.get("plan_key") ?? "");
  const sure = Number(formData.get("sure_ay"));
  if (!isSatinAlinabilirPaket(paket)) return { error: "Bir paket seçin." };
  if (!isAbonelikSuresi(sure)) return { error: "Bir süre seçin." };
  if (formData.get("sozlesme_onay") !== "on") {
    return { error: "Devam etmek için ön bilgilendirme formunu ve mesafeli satış sözleşmesini onaylayın." };
  }

  const faturaSonuc = parseFaturaBilgileri(formData);
  if (!faturaSonuc.ok) return { error: faturaSonuc.error };
  const fatura = faturaSonuc.fatura;

  const { data: dukkan, error: dukkanError } = await supabase
    .from("dukkanlar")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (dukkanError) {
    logDukkanAction(action, "shop lookup failed", { error: dukkanError.message });
    return { error: "Mağaza bilgileri yüklenemedi. Lütfen tekrar deneyin." };
  }
  if (!dukkan) return { error: "Önce mağaza açmalısınız." };

  const engel = satinAlmaEngeli(await getShopPlan(supabase, dukkan.id), paket);
  if (engel) return { error: engel };

  const { data: fiyatPlani, error: planError } = await supabase
    .from("pricing_plans")
    .select("name, price_monthly, price_quarterly, price_yearly")
    .eq("segment", "esnaf")
    .eq("plan_key", paket)
    .eq("is_active", true)
    .maybeSingle();
  if (planError || !fiyatPlani) {
    if (planError) logDukkanAction(action, "plan lookup failed", { error: planError.message });
    return { error: "Bu paket şu an satışta değil." };
  }

  const tutar = hesaplaAbonelikTutari(
    {
      price_monthly: Number(fiyatPlani.price_monthly),
      price_quarterly: fiyatPlani.price_quarterly === null ? null : Number(fiyatPlani.price_quarterly),
      price_yearly: Number(fiyatPlani.price_yearly),
    },
    sure
  );
  if (!(tutar > 0)) return { error: "Paket fiyatı tanımlı değil." };

  const admin = createAdminClient();
  const conversationId = randomUUID();
  const { data: kayit, error: insertError } = await admin
    .from("abonelik_odemeleri")
    .insert({
      dukkan_id: dukkan.id,
      user_id: user.id,
      plan_key: paket,
      sure_ay: sure,
      tutar,
      conversation_id: conversationId,
      fatura_tipi: fatura.tip,
      fatura_ad_unvan: fatura.adUnvan,
      fatura_kimlik_no: fatura.kimlikNo,
      fatura_vergi_dairesi: fatura.vergiDairesi,
      fatura_adres: fatura.adres,
      fatura_il: fatura.il,
      fatura_ilce: fatura.ilce,
      fatura_eposta: fatura.eposta,
      fatura_telefon: fatura.telefon,
      sozlesme_onay_at: new Date().toISOString(),
    })
    .select("id")
    .single();
  if (insertError || !kayit) {
    logDukkanAction(action, "payment row insert failed", { error: insertError?.message });
    return { error: "Ödeme başlatılamadı. Lütfen tekrar deneyin." };
  }

  const { ad, soyad } = adSoyadAyir(fatura.adUnvan);
  const sonuc = await iyzicoCheckoutBaslat({
    conversationId,
    basketId: kayit.id,
    tutar,
    urunId: `esnafpro-${paket}-${sure}ay`,
    urunAdi: sanitizeIyzicoText(`EsnafPRO ${fiyatPlani.name} ${sure} Ay`, 100),
    callbackUrl: getCallbackUrl(),
    alici: {
      id: user.id,
      ad: sanitizeIyzicoText(ad, 50),
      soyad: sanitizeIyzicoText(soyad, 50),
      kimlikNo: fatura.tip === "bireysel" ? fatura.kimlikNo : KURUMSAL_IYZICO_KIMLIK,
      eposta: fatura.eposta,
      telefon: fatura.telefon,
      adres: sanitizeIyzicoText(`${fatura.adres} ${fatura.ilce}`, 300),
      il: sanitizeIyzicoText(fatura.il, 50),
      ip: await getIstemciIp(),
    },
  });

  const simdi = new Date().toISOString();
  if (!sonuc.ok) {
    logDukkanAction(action, "iyzico initialize failed", { odemeId: kayit.id, error: sonuc.error });
    await admin
      .from("abonelik_odemeleri")
      .update({ durum: "basarisiz", hata_mesaji: sonuc.error, updated_at: simdi })
      .eq("id", kayit.id);
    return { error: `Ödeme sayfası açılamadı: ${sonuc.error}` };
  }

  // Callback kaydı token ile bulur; token kaydedilemezse ödemeye yönlendirmeyiz
  const { error: tokenError } = await admin
    .from("abonelik_odemeleri")
    .update({ iyzico_token: sonuc.token, updated_at: simdi })
    .eq("id", kayit.id);
  if (tokenError) {
    logDukkanAction(action, "token save failed", { odemeId: kayit.id, error: tokenError.message });
    return { error: "Ödeme başlatılamadı. Lütfen tekrar deneyin." };
  }

  redirect(sonuc.paymentPageUrl);
}
