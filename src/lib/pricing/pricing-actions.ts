"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isSuperAdminUser } from "@/lib/auth/super-admin";

export type PricingAdminState = {
  error?: string;
  success?: string;
};

async function assertSuperAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !isSuperAdminUser(user)) {
    return { error: "Bu işlem için yetkiniz yok." as const, supabase: null, user: null };
  }

  return { error: null, supabase, user };
}

function parseFeaturesInput(raw: string): string[] {
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export async function upsertPricingPlan(
  _prev: PricingAdminState,
  formData: FormData
): Promise<PricingAdminState> {
  const auth = await assertSuperAdmin();
  if (auth.error || !auth.supabase) return { error: auth.error ?? "Yetki hatası." };

  const id = String(formData.get("id") ?? "").trim();
  const segment = String(formData.get("segment") ?? "").trim();
  const planKey = String(formData.get("plan_key") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();

  if (!segment || !planKey || !name) {
    return { error: "Segment, plan anahtarı ve ad zorunludur." };
  }

  const payload = {
    segment,
    plan_key: planKey,
    name,
    description: String(formData.get("description") ?? "").trim() || null,
    price_monthly: Number(formData.get("price_monthly") ?? 0),
    price_yearly: Number(formData.get("price_yearly") ?? 0),
    currency: String(formData.get("currency") ?? "TRY").trim() || "TRY",
    features: parseFeaturesInput(String(formData.get("features") ?? "")),
    is_popular: formData.get("is_popular") === "true",
    is_active: formData.get("is_active") === "true",
    sort_order: Number(formData.get("sort_order") ?? 0),
    cta_label: String(formData.get("cta_label") ?? "").trim() || null,
    cta_href: String(formData.get("cta_href") ?? "").trim() || null,
    updated_at: new Date().toISOString(),
  };

  const { error } = id
    ? await auth.supabase.from("pricing_plans").update(payload).eq("id", id)
    : await auth.supabase.from("pricing_plans").insert(payload);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/");
  revalidatePath("/yonetim/admin/fiyatlar");
  return { success: "Plan kaydedildi." };
}

export async function deletePricingPlan(planId: string): Promise<PricingAdminState> {
  const auth = await assertSuperAdmin();
  if (auth.error || !auth.supabase) return { error: auth.error ?? "Yetki hatası." };

  const { error } = await auth.supabase.from("pricing_plans").delete().eq("id", planId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/");
  revalidatePath("/yonetim/admin/fiyatlar");
  return { success: "Plan silindi." };
}

export async function deletePricingPlanForm(
  _prev: PricingAdminState,
  formData: FormData
): Promise<PricingAdminState> {
  const planId = String(formData.get("plan_id") ?? "").trim();
  if (!planId) return { error: "Plan kimliği bulunamadı." };
  return deletePricingPlan(planId);
}

export async function seedDefaultPricingPlansForm(
  _prev: PricingAdminState
): Promise<PricingAdminState> {
  return seedDefaultPricingPlans();
}

export async function seedDefaultPricingPlans(): Promise<PricingAdminState> {
  const auth = await assertSuperAdmin();
  if (auth.error || !auth.supabase) return { error: auth.error ?? "Yetki hatası." };

  const { DEFAULT_PRICING_PLANS } = await import("@/lib/pricing/defaults");

  const rows = DEFAULT_PRICING_PLANS.map((plan) => ({
    segment: plan.segment,
    plan_key: plan.plan_key,
    name: plan.name,
    description: plan.description,
    price_monthly: plan.price_monthly,
    price_yearly: plan.price_yearly,
    currency: plan.currency,
    features: plan.features,
    is_popular: plan.is_popular,
    is_active: plan.is_active,
    sort_order: plan.sort_order,
    cta_label: plan.cta_label,
    cta_href: plan.cta_href,
  }));

  const { error } = await auth.supabase
    .from("pricing_plans")
    .upsert(rows, { onConflict: "segment,plan_key" });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/");
  revalidatePath("/yonetim/admin/fiyatlar");
  return { success: "Varsayılan planlar veritabanına aktarıldı." };
}
