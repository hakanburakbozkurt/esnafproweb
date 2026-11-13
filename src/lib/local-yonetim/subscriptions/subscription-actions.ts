"use server";

import { revalidatePath } from "next/cache";
import {
  DEFAULT_FREE_ACTION_LIMIT,
  PRO_DEFAULT_MONTHS,
  PRO_MAX_MONTHS,
  SHOP_SUBSCRIPTION_TIER_LABELS,
  type SubscriptionAdminState,
} from "@/lib/local-yonetim/subscriptions/types";
import { isSuperAdminUser } from "@/lib/auth/super-admin";
import { createClient } from "@/lib/supabase/server";

async function assertSubscriptionAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !isSuperAdminUser(user)) {
    return { error: "Bu işlem için süper admin yetkisi gerekir." as const, supabase: null };
  }

  return { error: null, supabase };
}

function revalidateSubscriptionPaths() {
  revalidatePath("/local-yonetim/abonelikler");
  revalidatePath("/yonetim");
  revalidatePath("/yonetim/harita-pazari");
}

function addMonths(date: Date, months: number) {
  const next = new Date(date);
  next.setMonth(next.getMonth() + months);
  return next.toISOString();
}

async function ensureSubscriptionRow(supabase: NonNullable<Awaited<ReturnType<typeof assertSubscriptionAdmin>>["supabase"]>, dukkanId: string) {
  const { data } = await supabase
    .from("dukkan_subscriptions")
    .select("dukkan_id")
    .eq("dukkan_id", dukkanId)
    .maybeSingle();

  if (data) return;

  const { error } = await supabase.from("dukkan_subscriptions").insert({
    dukkan_id: dukkanId,
    tier: "free",
    actions_used: 0,
    actions_limit: DEFAULT_FREE_ACTION_LIMIT,
  });

  if (error) {
    throw new Error(error.message);
  }
}

export async function upgradeShopToProForm(
  _prev: SubscriptionAdminState,
  formData: FormData
): Promise<SubscriptionAdminState> {
  const auth = await assertSubscriptionAdmin();
  if (auth.error || !auth.supabase) return { error: auth.error ?? "Yetki hatası." };

  const dukkanId = String(formData.get("dukkan_id") ?? "").trim();
  if (!dukkanId) return { error: "Dükkan kimliği bulunamadı." };

  const rawMonths = formData.get("pro_months");
  const months = rawMonths === null || rawMonths === "" ? PRO_DEFAULT_MONTHS : Number(rawMonths);
  if (!Number.isInteger(months) || months < 1 || months > PRO_MAX_MONTHS) {
    return { error: `Ay sayısı 1 ile ${PRO_MAX_MONTHS} arasında tam sayı olmalıdır.` };
  }
  const safeMonths = months;
  const rawTier = formData.get("tier");
  const tier = rawTier === "ultra" ? "ultra" : rawTier === "buyume" ? "buyume" : "pro";
  const tierLabel = SHOP_SUBSCRIPTION_TIER_LABELS[tier];

  try {
    await ensureSubscriptionRow(auth.supabase, dukkanId);

    // Kalan süre korunur: mevcut bitiş tarihi gelecekteyse yeni süre oradan eklenir.
    const { data: mevcut, error: okumaHatasi } = await auth.supabase
      .from("dukkan_subscriptions")
      .select("expires_at")
      .eq("dukkan_id", dukkanId)
      .maybeSingle();

    if (okumaHatasi) return { error: okumaHatasi.message };

    const simdi = new Date();
    const mevcutBitis = mevcut?.expires_at ? new Date(mevcut.expires_at) : null;
    const baslangic = mevcutBitis && mevcutBitis.getTime() > simdi.getTime() ? mevcutBitis : simdi;

    const { error } = await auth.supabase
      .from("dukkan_subscriptions")
      .update({
        tier,
        expires_at: addMonths(baslangic, safeMonths),
        updated_at: simdi.toISOString(),
      })
      .eq("dukkan_id", dukkanId);

    if (error) return { error: error.message };
  } catch (err) {
    return { error: err instanceof Error ? err.message : `${tierLabel} yükseltme başarısız.` };
  }

  revalidateSubscriptionPaths();
  return { success: `Dükkan ${tierLabel} katmanına yükseltildi (${safeMonths} ay).` };
}

export async function resetShopFreeLimitsForm(
  _prev: SubscriptionAdminState,
  formData: FormData
): Promise<SubscriptionAdminState> {
  const auth = await assertSubscriptionAdmin();
  if (auth.error || !auth.supabase) return { error: auth.error ?? "Yetki hatası." };

  const dukkanId = String(formData.get("dukkan_id") ?? "").trim();
  if (!dukkanId) return { error: "Dükkan kimliği bulunamadı." };

  try {
    await ensureSubscriptionRow(auth.supabase, dukkanId);

    const { error } = await auth.supabase
      .from("dukkan_subscriptions")
      .update({
        tier: "free",
        actions_used: 0,
        actions_limit: DEFAULT_FREE_ACTION_LIMIT,
        expires_at: null,
        updated_at: new Date().toISOString(),
      })
      .eq("dukkan_id", dukkanId);

    if (error) return { error: error.message };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Kota sıfırlama başarısız." };
  }

  revalidateSubscriptionPaths();
  return { success: "Ücretsiz kota sıfırlandı ve Free katmanına alındı." };
}

export async function setShopTierFreeForm(
  _prev: SubscriptionAdminState,
  formData: FormData
): Promise<SubscriptionAdminState> {
  const auth = await assertSubscriptionAdmin();
  if (auth.error || !auth.supabase) return { error: auth.error ?? "Yetki hatası." };

  const dukkanId = String(formData.get("dukkan_id") ?? "").trim();
  if (!dukkanId) return { error: "Dükkan kimliği bulunamadı." };

  try {
    await ensureSubscriptionRow(auth.supabase, dukkanId);

    const { error } = await auth.supabase
      .from("dukkan_subscriptions")
      .update({
        tier: "free",
        expires_at: null,
        updated_at: new Date().toISOString(),
      })
      .eq("dukkan_id", dukkanId);

    if (error) return { error: error.message };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Katman güncelleme başarısız." };
  }

  revalidateSubscriptionPaths();
  return { success: "Dükkan Free katmanına alındı." };
}
