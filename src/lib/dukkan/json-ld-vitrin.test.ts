import { describe, expect, it } from "vitest";
import { buildCollectionPageJsonLd, buildUrunProductJsonLd } from "@/lib/dukkan/json-ld";

const base = {
  name: "17 pro turuncu uniq kılıf",
  description: null,
  images: ["https://cdn/a.jpg"],
  category: "Kılıf > Silikon Kılıf",
  shopName: "Beep Mobile Store",
  shopSlug: "beepmobilestore",
  path: "/beepmobilestore/urun/17-pro-turuncu-uniq-kilif",
};

describe("buildUrunProductJsonLd", () => {
  it("fiyat varsa TRY Offer ekler, stok 0 ise OutOfStock", () => {
    const schema = buildUrunProductJsonLd({ ...base, price: 2250, stokAdedi: 0 });
    expect(schema["@type"]).toBe("Product");
    expect(schema.url).toMatch(/\/beepmobilestore\/urun\/17-pro-turuncu-uniq-kilif$/);
    expect(schema.offers).toMatchObject({ priceCurrency: "TRY", price: 2250, availability: "https://schema.org/OutOfStock" });
    expect(schema.description).toContain("Beep Mobile Store");
  });

  it("fiyat anlaşılamıyorsa Offer eklemez", () => {
    const schema = buildUrunProductJsonLd({ ...base, price: null, stokAdedi: 3 }) as Record<string, unknown>;
    expect(schema.offers).toBeUndefined();
  });
});

describe("buildCollectionPageJsonLd", () => {
  it("öğeleri sıra numarasıyla ItemList olarak listeler", () => {
    const schema = buildCollectionPageJsonLd({
      slug: "beepmobilestore",
      path: "/kategori/kilif",
      name: "Kılıf | Beep Mobile Store",
      items: [
        { name: "A", path: "/beepmobilestore/urun/a" },
        { name: "B", path: "/beepmobilestore/pazaryeri/b", image: "https://cdn/b.jpg" },
      ],
    });
    expect(schema["@type"]).toBe("CollectionPage");
    expect(schema.url).toMatch(/\/beepmobilestore\/kategori\/kilif$/);
    expect(schema.mainEntity.numberOfItems).toBe(2);
    expect(schema.mainEntity.itemListElement[1]).toMatchObject({ position: 2, name: "B", image: "https://cdn/b.jpg" });
  });
});
