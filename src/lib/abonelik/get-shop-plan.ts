import type { SupabaseClient } from "@supabase/supabase-js";
import { logDukkanAction } from "@/lib/dukkan/logger";
import {
  normalizeShopSubscriptionTier,
  type ShopSubscriptionTier,
} from "@/lib/local-yonetim/subscriptions/types";
import type { Database } from "@/types/database.types";

export type ShopPlan = {
  tier: ShopSubscriptionTier;
  /** Ücretli katman ve süresi dolmamış */
  ucretliAktif: boolean;
  expiresAt: string | null;
};

export function resolveShopPlan(
  row: { tier: string; expires_at: string | null } | null,
  now: Date = new Date()
): ShopPlan {
  const tier = normalizeShopSubscriptionTier(row?.tier);
  const expiresAt = row?.expires_at ?? null;
  const suresiDoldu = expiresAt !== null && new Date(expiresAt).getTime() <= now.getTime();
  return { tier, expiresAt, ucretliAktif: tier !== "free" && !suresiDoldu };
}

/** Kayıt yoksa veya okunamazsa Free kabul edilir (RLS: sahip yalnızca kendi satırını okur). */
export async function getShopPlan(
  supabase: SupabaseClient<Database>,
  dukkanId: string
): Promise<ShopPlan> {
  const { data, error } = await supabase
    .from("dukkan_subscriptions")
    .select("tier, expires_at")
    .eq("dukkan_id", dukkanId)
    .maybeSingle();

  if (error) {
    logDukkanAction("getShopPlan", "subscription lookup failed", { dukkanId, error: error.message });
  }
  return resolveShopPlan(data);
}
