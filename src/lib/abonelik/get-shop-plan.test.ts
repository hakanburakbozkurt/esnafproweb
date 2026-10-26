import { describe, expect, it } from "vitest";
import { resolveShopPlan } from "@/lib/abonelik/get-shop-plan";

const NOW = new Date("2026-10-27T12:00:00Z");

describe("resolveShopPlan", () => {
  it("abonelik kaydı yoksa Free", () => {
    expect(resolveShopPlan(null, NOW)).toEqual({ tier: "free", ucretliAktif: false, expiresAt: null });
  });

  it("PRO ve ULTRA, süresi dolmamışsa aktif", () => {
    expect(resolveShopPlan({ tier: "pro", expires_at: "2027-01-01T00:00:00Z" }, NOW).ucretliAktif).toBe(true);
    expect(resolveShopPlan({ tier: "ultra", expires_at: null }, NOW).ucretliAktif).toBe(true);
  });

  it("süresi dolan ücretli plan aktif değildir ama katmanı korunur", () => {
    expect(resolveShopPlan({ tier: "pro", expires_at: "2026-10-01T00:00:00Z" }, NOW)).toEqual({
      tier: "pro",
      ucretliAktif: false,
      expiresAt: "2026-10-01T00:00:00Z",
    });
  });

  it("bilinmeyen katman Free kabul edilir", () => {
    expect(resolveShopPlan({ tier: "gold", expires_at: null }, NOW).tier).toBe("free");
  });
});
