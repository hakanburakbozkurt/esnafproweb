import { describe, expect, it } from "vitest";
import { parseUrunFiyati } from "@/lib/dukkan/urun-fiyat";
import {
  buildUrunSluglari,
  buildVitrinKlasorleri,
  klasorOgeleriniSuz,
  slugifyTr,
  vitrinKlasorPath,
} from "@/lib/dukkan/vitrin-klasorleri";

const urun = (id: string, urun_adi: string, urun_kategorisi: string | null = null) => ({
  id,
  urun_adi,
  urun_kategorisi,
});
const cihaz = (id: string, device_category: string | null, listing_type: string | null = "used") => ({
  id,
  device_category,
  listing_type,
});

describe("slugifyTr", () => {
  it("Türkçe karakterleri ve işaretleri sadeleştirir", () => {
    expect(slugifyTr("Cam - Ekran Koruyucu")).toBe("cam-ekran-koruyucu");
    expect(slugifyTr("Ses & Kulaklık")).toBe("ses-kulaklik");
    expect(slugifyTr("AirPods Kılıfı")).toBe("airpods-kilifi");
    expect(slugifyTr("Akıllı Saat")).toBe("akilli-saat");
    expect(slugifyTr("ÇĞİÖŞÜ çğıöşü")).toBe("cgiosu-cgiosu");
    expect(slugifyTr("  ")).toBe("");
  });
});

describe("buildVitrinKlasorleri", () => {
  it("aynı ana kategorideki ürünleri tek klasörde toplar, alt kategorileri sayar", () => {
    const klasorler = buildVitrinKlasorleri(
      [
        urun("1", "Silikon", "Kılıf › Silikon Kılıf"),
        urun("2", "Deri", "Kılıf › Deri Kılıf"),
        urun("3", "Genel kılıf", "Kılıf"),
        urun("4", "Silikon 2", "Kılıf › Silikon Kılıf"),
      ],
      []
    );
    expect(klasorler).toHaveLength(1);
    expect(klasorler[0]).toMatchObject({ slug: "kilif", ad: "Kılıf", urunSayisi: 4, cihazSayisi: 0 });
    expect(klasorler[0].altlar).toEqual([
      { slug: "silikon-kilif", ad: "Silikon Kılıf", adet: 2 },
      { slug: "deri-kilif", ad: "Deri Kılıf", adet: 1 },
    ]);
  });

  it("cihazları ürünlerden ayrı, '(cihaz)' ekli klasörlere koyar ve alt kategori açmaz", () => {
    const klasorler = buildVitrinKlasorleri(
      [urun("u1", "iPad kılıfı", "Tablet › Tablet Kılıfı")],
      [
        cihaz("c1", "tablet", "new"),
        cihaz("c2", "phone"),
        cihaz("c3", "phone", "new"),
        cihaz("c4", "computer"),
        cihaz("c5", "watch"),
        cihaz("c6", null),
      ]
    );
    const tablet = klasorler.find((k) => k.ad === "Tablet")!;
    expect(tablet).toMatchObject({ urunSayisi: 1, cihazSayisi: 0 });

    const tabletCihaz = klasorler.find((k) => k.ad === "Tablet (cihaz)")!;
    expect(tabletCihaz).toMatchObject({ slug: "tablet-cihaz", urunSayisi: 0, cihazSayisi: 1, altlar: [] });

    const telefon = klasorler.find((k) => k.ad === "Telefon (cihaz)")!;
    expect(telefon).toMatchObject({ slug: "telefon-cihaz", cihazSayisi: 2, altlar: [] });
    expect(klasorler.map((k) => k.ad)).toEqual(
      expect.arrayContaining(["Bilgisayar (cihaz)", "Akıllı Saat (cihaz)", "Diğer (cihaz)"])
    );
  });

  it("çok öğeli klasör önce, kategorisiz ürünler her zaman en sonda", () => {
    const klasorler = buildVitrinKlasorleri(
      [urun("1", "a"), urun("2", "b"), urun("3", "c", "Kılıf"), urun("4", "d", "Şarj Grubu"), urun("5", "e", "Şarj Grubu")],
      []
    );
    expect(klasorler.map((k) => k.ad)).toEqual(["Şarj Grubu", "Kılıf", "Diğer Ürünler"]);
    expect(klasorler.at(-1)?.slug).toBe("diger-urunler");
  });

  it("aynı slug'a düşen farklı adlara ek verir ve boş klasör üretmez", () => {
    const klasorler = buildVitrinKlasorleri([urun("1", "a", "Kılıf"), urun("2", "b", "KILIF")], []);
    expect(klasorler.map((k) => k.slug).sort()).toEqual(["kilif", "kilif-2"]);
    expect(buildVitrinKlasorleri([], [])).toEqual([]);
  });
});

describe("klasorOgeleriniSuz", () => {
  it("alt kategoriye göre süzer, bilinmeyen alt için hepsini döner", () => {
    const [klasor] = buildVitrinKlasorleri(
      [urun("1", "a", "Kılıf › Deri Kılıf"), urun("2", "b", "Kılıf")],
      []
    );
    expect(klasorOgeleriniSuz(klasor, "deri-kilif").ogeler).toHaveLength(1);
    expect(klasorOgeleriniSuz(klasor, "deri-kilif").seciliAlt?.ad).toBe("Deri Kılıf");
    expect(klasorOgeleriniSuz(klasor, "yok").ogeler).toHaveLength(2);
    expect(klasorOgeleriniSuz(klasor, null).seciliAlt).toBeNull();
  });
});

describe("buildUrunSluglari", () => {
  it("ad tabanlı, tekrar eden adlara sırayla ek veren kararlı adresler üretir", () => {
    const sluglar = buildUrunSluglari([
      urun("a", "Tablet kılıfı modellerimız"),
      urun("b", "Tablet Kılıfı Modellerimız"),
      urun("c", "!!!"),
    ]);
    expect(sluglar.get("a")).toBe("tablet-kilifi-modellerimiz");
    expect(sluglar.get("b")).toBe("tablet-kilifi-modellerimiz-2");
    expect(sluglar.get("c")).toBe("urun");
  });

  it("klasör adresi alt kategoriyi sorgu parametresiyle taşır", () => {
    expect(vitrinKlasorPath("beep", "kilif")).toBe("/beep/kategori/kilif");
    expect(vitrinKlasorPath("beep", "kilif", "deri-kilif")).toBe("/beep/kategori/kilif?alt=deri-kilif");
  });
});

describe("parseUrunFiyati", () => {
  it("yaygın Türkçe fiyat yazımlarını sayıya çevirir", () => {
    expect(parseUrunFiyati("1350")).toBe(1350);
    expect(parseUrunFiyati("1.350 TL")).toBe(1350);
    expect(parseUrunFiyati("1.350,50 ₺")).toBe(1350.5);
    expect(parseUrunFiyati("12.5")).toBe(12.5);
    expect(parseUrunFiyati("2.250.000")).toBe(2250000);
  });

  it("anlaşılmayan veya aralık yazımlarında null döner", () => {
    expect(parseUrunFiyati(null)).toBeNull();
    expect(parseUrunFiyati("Fiyat için sorun")).toBeNull();
    expect(parseUrunFiyati("1350-1500")).toBeNull();
    expect(parseUrunFiyati("0")).toBeNull();
  });
});
