import { describe, expect, it } from "vitest";
import {
  buildTrendyolDescription,
  buildTrendyolStokFiyatItem,
  buildTrendyolUrunItem,
  flattenTrendyolKategoriler,
  parseFiyat,
  searchTrendyolKategoriler,
  validateTrendyolGonderim,
} from "@/lib/pazaryeri/trendyol/payload";
import { makeUrun } from "@/test/factories";

describe("parseFiyat", () => {
  it.each([
    ["1.250 TL", 1250],
    ["1.250,50 ₺", 1250.5],
    ["250", 250],
    ["250 TL", 250],
    ["12.5", 12.5],
    ["1.250.000", 1250000],
    ["99,90", 99.9],
  ])("%s → %s", (input, expected) => {
    expect(parseFiyat(input)).toBe(expected);
  });

  it.each([null, "", "Fiyat sorunuz", "0", "1.2.3"])("%s → null", (input) => {
    expect(parseFiyat(input as string | null)).toBeNull();
  });
});

describe("validateTrendyolGonderim", () => {
  const tamUrun = makeUrun({
    urun_adi: "iPhone 15 Şeffaf Kılıf",
    fiyat: "250 TL",
    stok_adedi: 4,
    barkod: "8690000000017",
    fotograf_url: "https://cdn.test/1.webp",
  });
  const tamBilgi = { markaId: 10, kategoriId: 20, kdvOrani: 20, ozellikler: [] };

  it("eksiksiz ürün ve seçimde hata vermez", () => {
    expect(validateTrendyolGonderim(tamUrun, tamBilgi, [])).toEqual([]);
  });

  it("eksikleri tek tek Türkçe listeler", () => {
    const hatalar = validateTrendyolGonderim(
      makeUrun({ urun_adi: "Kılıf", fiyat: "sorunuz", barkod: null, fotograf_url: "http://x" }),
      { markaId: null, kategoriId: null, kdvOrani: 18, ozellikler: [] },
      []
    );
    expect(hatalar).toHaveLength(6);
    expect(hatalar[0]).toContain("barkod");
  });

  it("zorunlu özelliği, serbest değer izinliyse metinle kabul eder", () => {
    const ozellikler = [
      { attributeId: 1, name: "Renk", required: true, allowCustom: true },
      { attributeId: 2, name: "Uyumlu Marka", required: true, allowCustom: false },
      { attributeId: 3, name: "Desen", required: false, allowCustom: false },
    ];
    const hatalar = validateTrendyolGonderim(
      tamUrun,
      {
        ...tamBilgi,
        ozellikler: [
          { attributeId: 1, customAttributeValue: "Şeffaf" },
          { attributeId: 2, customAttributeValue: "Apple" },
        ],
      },
      ozellikler
    );
    expect(hatalar).toEqual(["Zorunlu özellik eksik: Uyumlu Marka."]);
  });
});

describe("buildTrendyolUrunItem", () => {
  it("ürünü Trendyol v2 öğesine çevirir", () => {
    const urun = makeUrun({
      urun_adi: "iPhone 15 Şeffaf Kılıf",
      urun_aciklama: "Darbe emici\n<b>ince</b>",
      fiyat: "1.250,50 TL",
      stok_adedi: 30000,
      barkod: "KLF-15",
      fotograf_url: "https://cdn.test/1.webp",
      fotograf_url_2: "http://guvensiz/2.webp",
      fotograf_url_3: "https://cdn.test/3.webp",
    });
    const item = buildTrendyolUrunItem(urun, {
      markaId: 10,
      kategoriId: 20,
      kdvOrani: 20,
      ozellikler: [
        { attributeId: 1, attributeValueId: 5 },
        { attributeId: 2, customAttributeValue: "  Şeffaf " },
        { attributeId: 3, customAttributeValue: "   " },
      ],
    });

    expect(item).toMatchObject({
      barcode: "KLF-15",
      productMainId: "KLF-15",
      stockCode: "KLF-15",
      brandId: 10,
      categoryId: 20,
      quantity: 20000,
      listPrice: 1250.5,
      salePrice: 1250.5,
      vatRate: 20,
      images: [{ url: "https://cdn.test/1.webp" }, { url: "https://cdn.test/3.webp" }],
      attributes: [
        { attributeId: 1, attributeValueId: 5 },
        { attributeId: 2, customAttributeValue: "Şeffaf" },
      ],
    });
    expect(item.description).toBe("Darbe emici<br>&lt;b&gt;ince&lt;/b&gt;");
  });

  it("açıklama yoksa ürün adını kullanır", () => {
    expect(buildTrendyolDescription({ urun_adi: "Kablo", urun_aciklama: null })).toBe("Kablo");
  });
});

describe("buildTrendyolStokFiyatItem", () => {
  it("geçerli fiyat yoksa null döner, stok yoksa 0 gönderir", () => {
    expect(buildTrendyolStokFiyatItem({ barkod: "A1", fiyat: "sorunuz", stok_adedi: 3 })).toBeNull();
    expect(buildTrendyolStokFiyatItem({ barkod: "A1", fiyat: "99", stok_adedi: null })).toEqual({
      barcode: "A1",
      quantity: 0,
      salePrice: 99,
      listPrice: 99,
    });
  });
});

describe("kategori ağacı", () => {
  const agac = [
    {
      id: 1,
      name: "Elektronik",
      subCategories: [
        {
          id: 2,
          name: "Telefon Aksesuarları",
          subCategories: [
            { id: 3, name: "Telefon Kılıfı", subCategories: [] },
            { id: 4, name: "Ekran Koruyucu", subCategories: [] },
          ],
        },
      ],
    },
  ];

  it("yalnızca son seviyeyi yol ile verir", () => {
    expect(flattenTrendyolKategoriler(agac)).toEqual([
      { id: 3, ad: "Telefon Kılıfı", yol: "Elektronik › Telefon Aksesuarları › Telefon Kılıfı" },
      { id: 4, ad: "Ekran Koruyucu", yol: "Elektronik › Telefon Aksesuarları › Ekran Koruyucu" },
    ]);
  });

  it("Türkçe büyük-küçük harf duyarsız arar, tüm kelimeler eşleşmeli", () => {
    const duz = flattenTrendyolKategoriler(agac);
    expect(searchTrendyolKategoriler(duz, "TELEFON kılıf").map((k) => k.id)).toEqual([3]);
    expect(searchTrendyolKategoriler(duz, "ekran")).toHaveLength(1);
    expect(searchTrendyolKategoriler(duz, " ")).toEqual([]);
  });
});
