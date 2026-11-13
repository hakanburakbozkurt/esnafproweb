import { describe, expect, it } from "vitest";
import { PLATFORM_PAGE_SEO_DEFAULTS } from "@/lib/seo/platform-page-seo.defaults";

// Google başlığı ~60, açıklamayı ~160 karakterden sonra keser; SEO denetim araçları da bu sınırlara bakar.
const BASLIK_MAX = 60;
const ACIKLAMA_MIN = 70;
const ACIKLAMA_MAX = 160;

describe("PLATFORM_PAGE_SEO_DEFAULTS", () => {
  it.each(PLATFORM_PAGE_SEO_DEFAULTS.map((s) => [s.page_path, s] as const))(
    "%s başlığı ve açıklaması arama sonucunda kesilmeyecek uzunlukta",
    (_path, seo) => {
      expect(seo.meta_title.length).toBeLessThanOrEqual(BASLIK_MAX);
      expect(seo.meta_description.length).toBeGreaterThanOrEqual(ACIKLAMA_MIN);
      expect(seo.meta_description.length).toBeLessThanOrEqual(ACIKLAMA_MAX);
    }
  );

  it("her sayfa yolu bir kez tanımlı", () => {
    const yollar = PLATFORM_PAGE_SEO_DEFAULTS.map((s) => s.page_path);
    expect(new Set(yollar).size).toBe(yollar.length);
  });
});
