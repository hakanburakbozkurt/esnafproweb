import { describe, expect, it } from "vitest";
import { buildUrunProductJsonLd } from "@/lib/dukkan/json-ld";

const base = {
  name: "Hayalet cam",
  images: [],
  category: "Cam - Ekran Koruyucu",
  stokAdedi: 5,
  shopName: "Beep Mobile Store",
  shopSlug: "beepmobilestore",
  path: "/beepmobilestore/urun/hayalet-cam",
};

describe("buildUrunProductJsonLd konum", () => {
  it("adres verilirse teklifte areaServed ve satıcıda adres üretir", () => {
    const schema = buildUrunProductJsonLd({
      ...base,
      price: 150,
      shopAdres: "Esenkent Mah. Örnek Sok. No:1, Esenyurt, İstanbul",
    }) as Record<string, any>;

    expect(schema.offers.areaServed).toEqual({ "@type": "AdministrativeArea", name: expect.stringContaining("Esenyurt") });
    expect(schema.offers.seller.address).toMatchObject({
      "@type": "PostalAddress",
      addressLocality: "Esenyurt",
      addressCountry: "TR",
    });
  });

  it("adres yoksa konum alanı eklenmez", () => {
    const schema = buildUrunProductJsonLd({ ...base, price: 150, shopAdres: null }) as Record<string, any>;
    expect(schema.offers.areaServed).toBeUndefined();
    expect(schema.offers.seller.address).toBeUndefined();
  });
});
