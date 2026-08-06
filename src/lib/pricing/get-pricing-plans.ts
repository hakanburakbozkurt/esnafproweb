import { createClient } from "@/lib/supabase/server";
import { DEFAULT_PRICING_PLANS } from "@/lib/pricing/defaults";
import type { PricingPlan, PricingSegment } from "@/lib/pricing/types";
import type { Database } from "@/types/database.types";

type PricingPlanRow = Database["public"]["Tables"]["pricing_plans"]["Row"];

function parseFeatures(raw: PricingPlanRow["features"]): string[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter((item): item is string => typeof item === "string");
}

function rowToPlan(row: PricingPlanRow): PricingPlan {
  return {
    id: row.id,
    segment: row.segment as PricingSegment,
    plan_key: row.plan_key,
    name: row.name,
    description: row.description,
    price_monthly: Number(row.price_monthly),
    price_yearly: Number(row.price_yearly),
    currency: row.currency,
    features: parseFeatures(row.features),
    is_popular: row.is_popular,
    is_active: row.is_active,
    sort_order: row.sort_order,
    cta_label: row.cta_label,
    cta_href: row.cta_href,
  };
}

export async function getActivePricingPlans(): Promise<PricingPlan[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("pricing_plans")
      .select("*")
      .eq("is_active", true)
      .order("segment", { ascending: true })
      .order("sort_order", { ascending: true });

    if (error || !data?.length) {
      return DEFAULT_PRICING_PLANS.filter((plan) => plan.is_active);
    }

    return data.map(rowToPlan);
  } catch {
    return DEFAULT_PRICING_PLANS.filter((plan) => plan.is_active);
  }
}

export async function getAllPricingPlansAdmin(): Promise<PricingPlan[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("pricing_plans")
      .select("*")
      .order("segment", { ascending: true })
      .order("sort_order", { ascending: true });

    if (error || !data?.length) {
      return DEFAULT_PRICING_PLANS;
    }

    return data.map(rowToPlan);
  } catch {
    return DEFAULT_PRICING_PLANS;
  }
}

export function groupPlansBySegment(plans: PricingPlan[]) {
  return {
    esnaf: plans.filter((p) => p.segment === "esnaf" && p.is_active),
    toptanci: plans.filter((p) => p.segment === "toptanci" && p.is_active),
  };
}
