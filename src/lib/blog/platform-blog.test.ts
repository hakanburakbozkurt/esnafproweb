import { describe, expect, it } from "vitest";
import {
  isPlatformBlogCategory,
  platformBlogCategoryLabel,
  platformBlogReadingMinutes,
  validatePlatformBlogPublish,
} from "@/lib/blog/platform-blog.constants";

const LONG_CONTENT = `<p>${"telefon ekran değişimi fiyatları ".repeat(40)}</p>`;

describe("validatePlatformBlogPublish", () => {
  it("kapak görseli yoksa reddeder", () => {
    const result = validatePlatformBlogPublish({
      ozet: "Özet",
      icerik: LONG_CONTENT,
      kapak_url: null,
    });

    expect(result.ok).toBe(false);
  });

  it("özet yoksa reddeder", () => {
    const result = validatePlatformBlogPublish({
      ozet: "   ",
      icerik: LONG_CONTENT,
      kapak_url: "https://cdn.example.com/kapak.webp",
    });

    expect(result.ok).toBe(false);
  });

  it("içerik 600 karakterin altındaysa reddeder", () => {
    const result = validatePlatformBlogPublish({
      ozet: "Özet",
      icerik: "<p>Kısa bir yazı.</p>",
      kapak_url: "https://cdn.example.com/kapak.webp",
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain("600");
    }
  });

  it("tüm kriterler sağlanınca kabul eder", () => {
    const result = validatePlatformBlogPublish({
      ozet: "Ekran değişimi fiyatlarını etkileyen kalemleri anlatıyoruz.",
      icerik: LONG_CONTENT,
      kapak_url: "https://cdn.example.com/kapak.webp",
    });

    expect(result.ok).toBe(true);
  });
});

describe("kategori yardımcıları", () => {
  it("bilinen kategoriyi doğrular", () => {
    expect(isPlatformBlogCategory("tamir")).toBe(true);
    expect(isPlatformBlogCategory("olmayan-kategori")).toBe(false);
    expect(isPlatformBlogCategory(null)).toBe(false);
  });

  it("etiketi Türkçe döndürür, bilinmeyende Rehber'e düşer", () => {
    expect(platformBlogCategoryLabel("yerel-seo")).toBe("Yerel SEO");
    expect(platformBlogCategoryLabel("saçma")).toBe("Rehber");
  });
});

describe("platformBlogReadingMinutes", () => {
  it("boş metinde en az 1 dk döndürür", () => {
    expect(platformBlogReadingMinutes("")).toBe(1);
  });

  it("200 kelime/dk üzerinden yuvarlar", () => {
    expect(platformBlogReadingMinutes("kelime ".repeat(600))).toBe(3);
  });
});
