import { describe, expect, it } from "vitest";
import {
  getEffectiveTier,
  getIstanbulMonthStartIso,
  getPlanLimits,
  isPlanEnforcementEnabled,
  isWithinLimit,
  planLimitMessage,
} from "@/lib/abonelik/plan-limits";
import { normalizeShopSubscriptionTier } from "@/lib/local-yonetim/subscriptions/types";

describe("plan-limits", () => {
  it("ücretsiz pakette blog toplam 1, Trendyol aylık 5, Harita Pazarı kapalı", () => {
    const limits = getPlanLimits({ tier: "free", ucretliAktif: false });
    expect(limits.blogToplam).toBe(1);
    expect(limits.trendyolAylikUrun).toBe(5);
    expect(limits.trendyolTopluSenkron).toBe(false);
    expect(limits.haritaPazari).toBe(false);
    expect(limits.seoDuzenleme).toBe(false);
  });

  it("büyüme pakette blog ayda 4, SEO düzenleme açık, Harita Pazarı kapalı", () => {
    const limits = getPlanLimits({ tier: "buyume", ucretliAktif: true });
    expect(limits.blogAylik).toBe(4);
    expect(limits.blogToplam).toBeNull();
    expect(limits.trendyolAylikUrun).toBeNull();
    expect(limits.trendyolTopluSenkron).toBe(false);
    expect(limits.seoDuzenleme).toBe(true);
    expect(limits.haritaPazari).toBe(false);
  });

  it("pro ve ultra pakette her şey açık ve sınırsız", () => {
    for (const tier of ["pro", "ultra"] as const) {
      const limits = getPlanLimits({ tier, ucretliAktif: true });
      expect(limits.blogToplam).toBeNull();
      expect(limits.blogAylik).toBeNull();
      expect(limits.trendyolAylikUrun).toBeNull();
      expect(limits.trendyolTopluSenkron).toBe(true);
      expect(limits.haritaPazari).toBe(true);
    }
  });

  it("süresi dolmuş ücretli abonelik ücretsiz sayılır", () => {
    expect(getEffectiveTier({ tier: "pro", ucretliAktif: false })).toBe("free");
    expect(getPlanLimits({ tier: "pro", ucretliAktif: false }).haritaPazari).toBe(false);
  });

  it("PLAN_ENFORCEMENT yalnızca 'on' iken açıktır", () => {
    expect(isPlanEnforcementEnabled({})).toBe(false);
    expect(isPlanEnforcementEnabled({ PLAN_ENFORCEMENT: "off" })).toBe(false);
    expect(isPlanEnforcementEnabled({ PLAN_ENFORCEMENT: "on" })).toBe(true);
  });

  it("isWithinLimit: null sınırsız, sınıra ulaşınca false", () => {
    expect(isWithinLimit(null, 999)).toBe(true);
    expect(isWithinLimit(1, 0)).toBe(true);
    expect(isWithinLimit(1, 1)).toBe(false);
    expect(isWithinLimit(5, 4)).toBe(true);
  });

  it("İstanbul ay başlangıcı: UTC ay sonu gecesi bir sonraki ayın İstanbul gününe denk gelir", () => {
    // 31 Ekim 2026 22:30 UTC = 1 Kasım 2026 01:30 İstanbul
    expect(getIstanbulMonthStartIso(new Date("2026-10-31T22:30:00Z"))).toBe(
      "2026-11-01T00:00:00+03:00"
    );
    expect(getIstanbulMonthStartIso(new Date("2026-11-15T10:00:00Z"))).toBe(
      "2026-11-01T00:00:00+03:00"
    );
  });

  it("limit mesajı", () => {
    expect(planLimitMessage("blog yazısı ekleyebilirsiniz", 1, "toplam")).toContain(
      "Mevcut paketinizde en fazla 1 blog yazısı ekleyebilirsiniz"
    );
    expect(planLimitMessage("ürünü Trendyol'a gönderebilirsiniz", 5, "aylik")).toContain(
      "Bu ay en fazla 5"
    );
  });

  it("büyüme katmanı normalize edilir", () => {
    expect(normalizeShopSubscriptionTier("buyume")).toBe("buyume");
    expect(normalizeShopSubscriptionTier("bilinmeyen")).toBe("free");
  });
});
