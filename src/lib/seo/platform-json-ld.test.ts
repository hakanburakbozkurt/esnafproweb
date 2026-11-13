import { describe, expect, it } from "vitest";
import { buildPlatformJsonLd } from "@/lib/seo/platform-json-ld";

describe("buildPlatformJsonLd", () => {
  const schemas = buildPlatformJsonLd("https://www.esnafpro.app/");
  const byType = (type: string) => schemas.find((s) => s["@type"] === type) as Record<string, unknown>;

  it("Organization, WebSite ve SoftwareApplication üretir", () => {
    expect(schemas.map((s) => s["@type"])).toEqual(["Organization", "WebSite", "SoftwareApplication"]);
  });

  it("URL'ler sondaki eğik çizgi olmadan üretilir", () => {
    expect(byType("WebSite").url).toBe("https://www.esnafpro.app");
    expect(byType("Organization")["@id"]).toBe("https://www.esnafpro.app/#organization");
  });

  it("uygulama ücretsiz teklif içerir ve yayıncıyı kuruluşa bağlar", () => {
    const app = byType("SoftwareApplication");
    expect(app.offers).toMatchObject({ price: 0, priceCurrency: "TRY" });
    expect(app.publisher).toEqual({ "@id": "https://www.esnafpro.app/#organization" });
  });
});

describe("buildPlatformJsonLd kuruluş bilgileri", () => {
  const org = buildPlatformJsonLd("https://www.esnafpro.app").find(
    (s) => s["@type"] === "Organization"
  ) as Record<string, unknown>;

  it("logo, iletişim ve adres içerir (Google bilgi paneli için)", () => {
    expect(org.logo).toMatchObject({ url: "https://www.esnafpro.app/favicon.png" });
    expect(org.telephone).toMatch(/^\+90/);
    expect(org.address).toMatchObject({ addressLocality: "Esenyurt", addressCountry: "TR" });
  });
});
