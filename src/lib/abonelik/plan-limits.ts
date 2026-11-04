import type { ShopPlan } from "@/lib/abonelik/get-shop-plan";
import type { ShopSubscriptionTier } from "@/lib/local-yonetim/subscriptions/types";

/** null = sınırsız */
export type PlanLimits = {
  /** Dükkanın toplam blog yazısı sınırı */
  blogToplam: number | null;
  /** Takvim ayı başına yeni blog yazısı sınırı */
  blogAylik: number | null;
  /** Takvim ayı başına Trendyol'a ilk kez gönderilen ürün sınırı */
  trendyolAylikUrun: number | null;
  /** Trendyol'a toplu fiyat-stok senkronizasyonu */
  trendyolTopluSenkron: boolean;
  /** Vitrin meta başlık/açıklamasını elle düzenleme */
  seoDuzenleme: boolean;
  /** Harita Pazarı (Google sıralama) */
  haritaPazari: boolean;
};

/** Fiyat sayfasındaki paket vaatleriyle aynı tutulmalıdır (pricing_plans). */
export const PLAN_LIMITS: Record<ShopSubscriptionTier, PlanLimits> = {
  free: {
    blogToplam: 1,
    blogAylik: null,
    trendyolAylikUrun: 5,
    trendyolTopluSenkron: false,
    seoDuzenleme: false,
    haritaPazari: false,
  },
  buyume: {
    blogToplam: null,
    blogAylik: 4,
    trendyolAylikUrun: null,
    trendyolTopluSenkron: false,
    seoDuzenleme: true,
    haritaPazari: false,
  },
  pro: {
    blogToplam: null,
    blogAylik: null,
    trendyolAylikUrun: null,
    trendyolTopluSenkron: true,
    seoDuzenleme: true,
    haritaPazari: true,
  },
  ultra: {
    blogToplam: null,
    blogAylik: null,
    trendyolAylikUrun: null,
    trendyolTopluSenkron: true,
    seoDuzenleme: true,
    haritaPazari: true,
  },
};

/** Süresi dolmuş ücretli abonelik ücretsiz sayılır. */
export function getEffectiveTier(
  plan: Pick<ShopPlan, "tier" | "ucretliAktif">
): ShopSubscriptionTier {
  return plan.ucretliAktif ? plan.tier : "free";
}

export function getPlanLimits(plan: Pick<ShopPlan, "tier" | "ucretliAktif">): PlanLimits {
  return PLAN_LIMITS[getEffectiveTier(plan)];
}

/**
 * Kullanım sınırları (blog, Trendyol vb.) yalnızca PLAN_ENFORCEMENT=on iken uygulanır.
 * Abonelik ödeme akışı hazır olmadan mevcut dükkanların kısıtlanmaması için varsayılan kapalıdır.
 */
export function isPlanEnforcementEnabled(
  env: Record<string, string | undefined> = process.env
): boolean {
  return env.PLAN_ENFORCEMENT === "on";
}

/** limit null ise sınırsızdır; used < limit ise yeni kayıt eklenebilir. */
export function isWithinLimit(limit: number | null, used: number): boolean {
  return limit === null || used < limit;
}

/** Türkiye UTC+3 sabit olduğundan ay başlangıcı İstanbul saatiyle hesaplanır (ISO). */
export function getIstanbulMonthStartIso(now: Date = new Date()): string {
  const ym = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Istanbul",
    year: "numeric",
    month: "2-digit",
  }).format(now);
  return `${ym}-01T00:00:00+03:00`;
}

/** Örn. planLimitMessage("blog yazısı ekleyebilirsiniz", 1, "toplam") */
export function planLimitMessage(
  action: string,
  limit: number,
  period: "toplam" | "aylik"
): string {
  const scope = period === "aylik" ? "Bu ay" : "Mevcut paketinizde";
  return `${scope} en fazla ${limit} ${action}. Daha fazlası için paketinizi yükseltin.`;
}
