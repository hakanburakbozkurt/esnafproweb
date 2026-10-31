import { describe, expect, it } from "vitest";
import { buildUrunSluglari, vitrinUrunPath } from "@/lib/dukkan/vitrin-klasorleri";
import { buildStoreUrunLinks, LLMS_MAX_URUN, type LlmsUrunKaynagi } from "@/lib/seo/llms-store-urunler";

const urun = (
  id: string,
  urun_adi: string,
  extra: Partial<LlmsUrunKaynagi> = {}
): LlmsUrunKaynagi => ({
  id,
  urun_adi,
  urun_aciklama: null,
  urun_kategorisi: null,
  fiyat: null,
  stok_adedi: null,
  ...extra,
});

describe("buildStoreUrunLinks", () => {
  it("ürün adresleri vitrinle aynı slug'ları kullanır (çakışmada -2 eki dahil)", () => {
    const urunler = [urun("a", "Silikon Kılıf"), urun("b", "Silikon Kılıf")];
    const { urunLinks } = buildStoreUrunLinks("beep", urunler);
    const vitrinSluglari = buildUrunSluglari(urunler);

    expect(urunLinks[0].path).toBe(vitrinUrunPath("beep", vitrinSluglari.get("a")!));
    expect(urunLinks[1].path).toBe("/beep/urun/silikon-kilif-2");
  });

  it("fiyat, stok durumu ve kategoriyi not alanında verir", () => {
    const { urunLinks } = buildStoreUrunLinks("beep", [
      urun("a", "17 pro turuncu uniq kılıf", {
        urun_kategorisi: "Kılıf › Silikon Kılıf",
        fiyat: "2250",
        stok_adedi: 1,
      }),
      urun("b", "Cam", { urun_kategorisi: "Cam - Ekran Koruyucu", fiyat: null, stok_adedi: 0 }),
    ]);

    expect(urunLinks[0].note).toBe("Kılıf · 2250 · Son 1 adet");
    expect(urunLinks[1].note).toBe("Cam - Ekran Koruyucu · Fiyat için sorun · Tükendi");
  });

  it("konum verilirse ürün notuna ilçe/il ekler", () => {
    const { urunLinks } = buildStoreUrunLinks(
      "beep",
      [urun("a", "Hayalet cam", { urun_kategorisi: "Cam - Ekran Koruyucu", fiyat: "150" })],
      "Esenkent, Esenyurt"
    );
    expect(urunLinks[0].note).toBe("Cam - Ekran Koruyucu · 150 · Esenkent, Esenyurt");
  });

  it("açıklamayı nottan sonra ekler ve uzunluğu sınırlar", () => {
    const uzun = "a".repeat(400);
    const { urunLinks } = buildStoreUrunLinks("beep", [
      urun("a", "Şarj", { urun_aciklama: uzun, fiyat: "100" }),
    ]);

    expect(urunLinks[0].note!.startsWith("Diğer Ürünler · 100. aaa")).toBe(true);
    expect(urunLinks[0].note!.length).toBeLessThanOrEqual(160);
  });

  it("kategorileri klasör adresleriyle ve ürün sayısıyla listeler", () => {
    const { kategoriLinks } = buildStoreUrunLinks("beep", [
      urun("a", "x", { urun_kategorisi: "Kılıf › Silikon Kılıf" }),
      urun("b", "y", { urun_kategorisi: "Kılıf › Deri Kılıf" }),
      urun("c", "z", { urun_kategorisi: "Şarj Grubu" }),
    ]);

    const kilif = kategoriLinks.find((link) => link.title === "Kılıf")!;
    expect(kilif.path).toBe("/beep/kategori/kilif");
    expect(kilif.note).toBe("2 ürün. Alt kategoriler: Silikon Kılıf, Deri Kılıf");
    expect(kategoriLinks.map((link) => link.title)).toContain("Şarj Grubu");
  });

  it(`en fazla ${LLMS_MAX_URUN} ürün listeler ama toplam sayıyı doğru verir`, () => {
    const urunler = Array.from({ length: LLMS_MAX_URUN + 25 }, (_, i) => urun(`id${i}`, `Ürün ${i}`));
    const { urunLinks, urunToplam } = buildStoreUrunLinks("beep", urunler);

    expect(urunLinks).toHaveLength(LLMS_MAX_URUN);
    expect(urunToplam).toBe(LLMS_MAX_URUN + 25);
  });

  it("ürün yoksa boş liste döner", () => {
    expect(buildStoreUrunLinks("beep", [])).toEqual({ urunLinks: [], kategoriLinks: [], urunToplam: 0 });
  });
});
