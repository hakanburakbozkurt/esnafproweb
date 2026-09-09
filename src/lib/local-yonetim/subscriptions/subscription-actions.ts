"use server";

import { revalidatePath } from "next/cache";
import {
  DEFAULT_FREE_ACTION_LIMIT,
  PRO_DEFAULT_MONTHS,
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

  const months = Number(formData.get("pro_months") ?? PRO_DEFAULT_MONTHS);
  const safeMonths = Number.isFinite(months) && months > 0 ? months : PRO_DEFAULT_MONTHS;

  try {
    await ensureSubscriptionRow(auth.supabase, dukkanId);

    const { error } = await auth.supabase
      .from("dukkan_subscriptions")
      .update({
        tier: "pro",
        expires_at: addMonths(new Date(), safeMonths),
        updated_at: new Date().toISOString(),
      })
      .eq("dukkan_id", dukkanId);

    if (error) return { error: error.message };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Pro yükseltme başarısız." };
  }

  revalidateSubscriptionPaths();
  return { success: `Dükkan Pro'ya yükseltildi (${safeMonths} ay).` };
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
