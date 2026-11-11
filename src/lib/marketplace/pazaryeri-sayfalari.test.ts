import { describe, expect, it } from "vitest";
import {
  enCokIlceler,
  PAZARYERI_SAYFALARI,
  pazaryeriSayfaAciklamasi,
  pazaryeriSayfaBasligi,
  pazaryeriSayfasiBul,
  sayfaIlanlari,
} from "@/lib/marketplace/pazaryeri-sayfalari";
import type { MarketplaceListing } from "@/lib/marketplace/public-listing.types";

function ilan(over: Partial<MarketplaceListing["device"]>, ilce: string | null): MarketplaceListing {
  return {
    device: { id: Math.random().toString(), brand: "Apple", model: "iPhone 13", listing_type: "used", device_category: "phone", ...over } as MarketplaceListing["device"],
    shop: { slug: "beep", dukkan_adi: "Beep", adres: null, whatsapp: null, telefon: null, logo_url: null, enlem: null, boylam: null },
    il: "İstanbul",
    ilce,
    locationLabel: null,
  };
}

const ilanlar = [
  ilan({}, "Esenyurt"),
  ilan({ model: "iPad 9", device_category: "tablet" }, "Esenyurt"),
  ilan({ listing_type: "new" }, "Başakşehir"),
  ilan({ listing_type: "new", model: "iPhone 16" }, "Başakşehir"),
];

describe("pazaryeri arama sayfaları", () => {
  it("slug'lar benzersiz ve bulunabilir", () => {
    const sluglar = PAZARYERI_SAYFALARI.map((s) => s.slug);
    expect(new Set(sluglar).size).toBe(sluglar.length);
    expect(pazaryeriSayfasiBul("ikinci-el-telefon")?.kategori).toBe("telefon");
    expect(pazaryeriSayfasiBul("yok")).toBeNull();
  });

  it("ilanları tür ve kategoriye göre ayırır", () => {
    expect(sayfaIlanlari(ilanlar, pazaryeriSayfasiBul("ikinci-el")!)).toHaveLength(2);
    expect(sayfaIlanlari(ilanlar, pazaryeriSayfasiBul("ikinci-el-telefon")!)).toHaveLength(1);
    expect(sayfaIlanlari(ilanlar, pazaryeriSayfasiBul("ikinci-el-tablet")!)).toHaveLength(1);
    expect(sayfaIlanlari(ilanlar, pazaryeriSayfasiBul("sifir-telefon")!)).toHaveLength(2);
  });

  it("başlık ve açıklamada ilanın olduğu ilçeler geçer", () => {
    const sayfa = pazaryeriSayfasiBul("sifir-telefon")!;
    const secili = sayfaIlanlari(ilanlar, sayfa);
    const ilceler = enCokIlceler(secili);
    expect(pazaryeriSayfaBasligi(sayfa, ilceler)).toBe("Sıfır Telefon Fiyatları — Başakşehir");
    expect(pazaryeriSayfaAciklamasi(sayfa, secili.length, ilceler)).toContain("Başakşehir bölgesindeki telefoncu mağazalarından 2 sıfır telefon ilanı");
    expect(enCokIlceler(ilanlar)).toEqual(["Başakşehir", "Esenyurt"]);
  });
});
