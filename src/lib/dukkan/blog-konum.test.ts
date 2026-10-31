import { describe, expect, it } from "vitest";
import { buildBlogPostingJsonLd } from "@/lib/dukkan/json-ld";
import { buildBlogPostSeoMetadata, type DukkanSeoSource } from "@/lib/dukkan/metadata";
import type { DukkanBlogYazisi } from "@/types/database.types";

const post = {
  id: "p1",
  slug: "iphone-ekran-degisimi",
  baslik: "iPhone ekran değişimi nasıl yapılır",
  icerik: "<p>Kısa içerik</p>",
  kapak_url: null,
  meta_title: null,
  meta_description: null,
  created_at: "2026-01-01T00:00:00Z",
  updated_at: null,
} as unknown as DukkanBlogYazisi;

const dukkan = {
  dukkan_adi: "Beep Mobile Store",
  slug: "beepmobilestore",
  adres: "Esenkent Mah. Örnek Sok. No:1, Esenyurt, İstanbul",
  approval_status: "approved",
} as unknown as DukkanSeoSource;

describe("blog konum", () => {
  it("özel meta başlık yoksa yazı başlığına il/ilçe ekler", () => {
    const meta = buildBlogPostSeoMetadata(dukkan, post);
    expect(meta.title).toBe(
      "iPhone ekran değişimi nasıl yapılır — Esenyurt, İstanbul | Beep Mobile Store | EsnafPRO"
    );
  });

  it("özel meta başlık varsa olduğu gibi kullanır", () => {
    const meta = buildBlogPostSeoMetadata(dukkan, { ...post, meta_title: "Özel başlık" });
    expect(meta.title).toBe("Özel başlık | Beep Mobile Store | EsnafPRO");
  });

  it("BlogPosting şemasına içerik konumu ekler", () => {
    const schema = buildBlogPostingJsonLd({
      post,
      shopName: dukkan.dukkan_adi,
      shopSlug: dukkan.slug,
      shopAdres: dukkan.adres,
    }) as Record<string, unknown>;
    expect(schema.contentLocation).toEqual({
      "@type": "AdministrativeArea",
      name: "Esenyurt, İstanbul",
    });
  });

  it("adres yoksa içerik konumu eklenmez", () => {
    const schema = buildBlogPostingJsonLd({
      post,
      shopName: dukkan.dukkan_adi,
      shopSlug: dukkan.slug,
    }) as Record<string, unknown>;
    expect(schema.contentLocation).toBeUndefined();
  });
});
