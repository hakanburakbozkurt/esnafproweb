export type PricingSegment = "esnaf" | "toptanci";

export type PricingPlan = {
  id: string;
  segment: PricingSegment;
  plan_key: string;
  name: string;
  description: string | null;
  price_monthly: number;
  /** 3 aylık KDV dahil fiyat; boşsa aylık x 3 */
  price_quarterly: number | null;
  price_yearly: number;
  currency: string;
  features: string[];
  is_popular: boolean;
  is_active: boolean;
  sort_order: number;
  cta_label: string | null;
  cta_href: string | null;
};

export type BillingPeriod = "monthly" | "yearly";

export const PRICING_SEGMENT_LABELS: Record<PricingSegment, string> = {
  esnaf: "Esnaf",
  toptanci: "Toptancı",
};
