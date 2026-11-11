/* eslint-disable @typescript-eslint/no-explicit-any -- testte şema nesnesinin alanlarına doğrudan bakılıyor */
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

    // Adreste "Esenkent Mah." geçtiği için semt ayrı bir Place olarak da yazılır
    expect(schema.offers.areaServed).toEqual([
      { "@type": "Place", name: "Esenkent, Esenyurt, İstanbul" },
      { "@type": "AdministrativeArea", name: "Esenyurt, İstanbul" },
    ]);
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
    expect(schema.offers.areaServed[1]).toEqual({ "@type": "AdministrativeArea", name: "Esenyurt, İstanbul" });
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

describe("Product şeması — GEO ve kimlik alanları", () => {
  it("il yazılmamış adreste de ilçe bulunur, mağazaya @id ile bağlanır", () => {
    const schema = buildUrunProductJsonLd({
      ...base,
      price: 2250,
      barkod: "8690000000001",
      shopAdres: "Reşneli Niyazi Sokak No:49 asık veysel mahallesı esenyurt",
    }) as Record<string, any>;
    expect(schema["@id"]).toContain("#product");
    expect(schema.gtin).toBe("8690000000001");
    expect(schema.sku).toBe("8690000000001");
    expect(schema.offers.itemCondition).toBe("https://schema.org/NewCondition");
    expect(schema.offers.areaServed.name).toBe("Esenyurt, İstanbul");
    expect(schema.offers.seller["@id"]).toMatch(/\/beepmobilestore#localbusiness$/);
  });

  it("sayısal olmayan barkod GTIN olarak gönderilmez", () => {
    const schema = buildUrunProductJsonLd({ ...base, price: 10, barkod: "BEEP-001" }) as Record<string, any>;
    expect(schema.sku).toBe("BEEP-001");
    expect(schema.gtin).toBeUndefined();
  });
});

describe("Cihaz ilanı — sıfır / ikinci el", () => {
  const cihaz = {
    brand: "Apple", model: "iPhone 15", sale_price: 40000, web_title: null, web_description: null,
    image_urls: [], web_slug: "apple-iphone-15", condition: "Mükemmel",
  };
  it("sıfır ilan NewCondition, ikinci el UsedCondition olur", () => {
    const sifir = buildProductJsonLd({ device: { ...cihaz, listing_type: "new" } as never, shopName: "Redikom",
      shopSlug: "redikom", shopAdres: "Bahçeşehir 2.Kısım Mahallesi", devicePath: "/redikom/pazaryeri/x" }) as Record<string, any>;
    const ikinci = buildProductJsonLd({ device: { ...cihaz, listing_type: "used" } as never, shopName: "Redikom",
      shopSlug: "redikom", shopAdres: null, devicePath: "/redikom/pazaryeri/x" }) as Record<string, any>;
    expect(sifir.offers.itemCondition).toBe("https://schema.org/NewCondition");
    expect(sifir.offers.areaServed).toEqual([
      { "@type": "Place", name: "Bahçeşehir, Başakşehir, İstanbul" },
      { "@type": "AdministrativeArea", name: "Başakşehir, İstanbul" },
    ]);
    expect(sifir.description).toContain("sıfır");
    expect(sifir.brand).toEqual({ "@type": "Brand", name: "Apple" });
    expect(ikinci.offers.itemCondition).toBe("https://schema.org/UsedCondition");
  });
});
