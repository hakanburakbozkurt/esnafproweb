import { describe, expect, it } from "vitest";
import { withLocalAreaSuffix } from "@/lib/dukkan/metadata";
import { URUN_META_ACIKLAMA_UZUNLUGU, urunMetaAciklamasi, urunSeoBasligi } from "@/lib/dukkan/urun-seo";

const beep = {
  dukkan_adi: "Beep Mobile Store",
  adres: "Reşneli Niyazi Sokak No:49 asık veysel mahallesı esenyurt \r\nsepet market yanı 1.kat carsıpazarkent avm",
};

describe("ürün SEO metinleri (Beep gerçek adresi)", () => {
  it("başlıkta ürün + ilçe", () => {
    expect(urunSeoBasligi({ urun_adi: "17 pro turuncu uniq kılıf" }, beep)).toBe("17 pro turuncu uniq kılıf — Esenyurt");
  });

  it("açıklama fiyat, mağaza ve konumla başlar, sınırı aşmaz, konum tekrarlanmaz", () => {
    const aciklama = urunMetaAciklamasi(
      {
        urun_adi: "17 pro turuncu uniq kılıf",
        urun_aciklama: "UNIQ Lino Liquid Silicone MagClick Uyumlu Kılıf, şıklığı, korumayı ve fonksiyonelliği bir arada arayanlar için tasarlandı. Premium kalitedeki sıvı silikon yapısı",
        fiyat: "2250",
        stok_adedi: 1,
      },
      beep
    );
    expect(aciklama.startsWith("17 pro turuncu uniq kılıf 2.250 TL — Beep Mobile Store, Esenyurt, İstanbul. UNIQ")).toBe(true);
    expect(aciklama.length).toBeLessThanOrEqual(URUN_META_ACIKLAMA_UZUNLUGU);
    expect(withLocalAreaSuffix(aciklama, beep.adres)).toBe(aciklama);
  });

  it("açıklama ve fiyat yoksa çağrı cümlesi eklenir; tükendiyse fiyat yazılmaz", () => {
    expect(urunMetaAciklamasi({ urun_adi: "Kordon", urun_aciklama: null, fiyat: null, stok_adedi: null }, beep)).toBe(
      "Kordon — Beep Mobile Store, Esenyurt, İstanbul. Stok ve fiyat için WhatsApp'tan hemen bilgi alın."
    );
    expect(urunMetaAciklamasi({ urun_adi: "Kordon", urun_aciklama: null, fiyat: "300", stok_adedi: 0 }, beep)).not.toContain("300");
  });
});
