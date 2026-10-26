import { describe, expect, it } from "vitest";
import { calculateProfileHealthScore } from "@/lib/dukkan/profile-health-score";
import { DUKKAN_SETTINGS_SECTIONS } from "@/lib/dukkan/settings-sections";
import { getBreakdownHref } from "@/lib/yonetim/profile-health-links";

describe("getBreakdownHref", () => {
  const { breakdown } = calculateProfileHealthScore({});
  const sectionIds = new Set<string>(DUKKAN_SETTINGS_SECTIONS.map((s) => s.id));

  it("her skor maddesi genel ayar sayfası yerine kendi bölümüne bağlanır", () => {
    for (const item of breakdown) {
      expect(getBreakdownHref(item.label), item.label).not.toBe("/dukkan-ayarlari");
    }
  });

  it("ayar bağlantıları var olan bölüm kimliklerine gider", () => {
    for (const item of breakdown) {
      const href = getBreakdownHref(item.label);
      const hash = href.split("#")[1];
      if (hash) expect(sectionIds.has(hash), `${item.label} → ${href}`).toBe(true);
    }
  });
});
