import { describe, expect, it } from "vitest";
import { buildProductJsonLd, buildUrunProductJsonLd } from "@/lib/dukkan/json-ld";

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

describe("buildProductJsonLd (cihaz ilanı) konum", () => {
  const device = {
    brand: "Apple",
    model: "iPad 9",
    sale_price: 9000,
    web_title: "iPad 9",
    web_description: null,
    image_urls: [],
    web_slug: "ipad-9",
    condition: "used",
  } as never;

  it("adres varsa teklifte areaServed ve satıcı adresi üretir", () => {
    const schema = buildProductJsonLd({
      device,
      shopName: "Beep Mobile Store",
      shopSlug: "beepmobilestore",
      shopAdres: "Esenkent Mah. Örnek Sok. No:1, Esenyurt, İstanbul",
      devicePath: "/beepmobilestore/pazaryeri/ipad-9",
    }) as Record<string, any>;
    expect(schema.offers.areaServed.name).toContain("Esenyurt");
    expect(schema.offers.seller.address.addressLocality).toBe("Esenyurt");
  });

  it("adres yoksa konum alanı eklenmez", () => {
    const schema = buildProductJsonLd({
      device,
      shopName: "Beep Mobile Store",
      shopSlug: "beepmobilestore",
      shopAdres: null,
      devicePath: "/beepmobilestore/pazaryeri/ipad-9",
    }) as Record<string, any>;
    expect(schema.offers.areaServed).toBeUndefined();
    expect(schema.offers.seller.address).toBeUndefined();
  });
});
