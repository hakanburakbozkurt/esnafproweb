import { describe, expect, it } from "vitest";
import { parseUrunlerFromFormData } from "@/lib/dukkan/form-data";

function formOf(entries: Record<string, string>): FormData {
  const formData = new FormData();
  for (const [key, value] of Object.entries(entries)) formData.append(key, value);
  return formData;
}

describe("parseUrunlerFromFormData", () => {
  it("fotoğrafı olmayan ürünleri kaydetmez", () => {
    const result = parseUrunlerFromFormData(
      formOf({ urun_adi_0: "Fotoğrafsız", fotograf_url_1: "b.webp", urun_adi_1: "Fotolu" })
    );
    expect(result).toHaveLength(1);
    expect(result[0].urun_adi).toBe("Fotolu");
  });

  it("yalnızca ek fotoğrafı olan ürünü de kaydeder", () => {
    const [urun] = parseUrunlerFromFormData(formOf({ fotograf_url_0_5: "e.webp" }));
    expect(urun.fotograf_url).toBeNull();
    expect(urun.fotograf_url_5).toBe("e.webp");
  });

  it("kategori, fiyat ve stok alanlarını ayrıştırır", () => {
    const [urun] = parseUrunlerFromFormData(
      formOf({
        fotograf_url_0: "a.webp",
        urun_kategorisi_0: "  Kılıf ",
        fiyat_0: " 250 TL ",
        stok_adedi_0: "3",
      })
    );
    expect(urun).toMatchObject({ urun_kategorisi: "Kılıf", fiyat: "250 TL", stok_adedi: 3 });
  });

  it("barkodu temizler: boşluk ve izin verilmeyen karakterler atılır", () => {
    const result = parseUrunlerFromFormData(
      formOf({
        fotograf_url_0: "a",
        barkod_0: " 869 0000 000017 ",
        fotograf_url_1: "b",
        barkod_1: "KLF-01/ş",
        fotograf_url_2: "c",
        barkod_2: "",
      })
    );
    expect(result.map((u) => u.barkod)).toEqual(["8690000000017", "KLF-01", null]);
  });

  it("boş veya geçersiz stoğu NULL yapar; 0 korunur", () => {
    const result = parseUrunlerFromFormData(
      formOf({
        fotograf_url_0: "a",
        stok_adedi_0: "",
        fotograf_url_1: "b",
        stok_adedi_1: "-2",
        fotograf_url_2: "c",
        stok_adedi_2: "0",
      })
    );
    expect(result.map((u) => u.stok_adedi)).toEqual([null, null, 0]);
  });

  it("boş kategoriyi NULL (kategorisiz) yapar", () => {
    const [urun] = parseUrunlerFromFormData(formOf({ fotograf_url_0: "a", urun_kategorisi_0: "  " }));
    expect(urun.urun_kategorisi).toBeNull();
  });

  describe("uygulama stok bağlantısı (product_id)", () => {
    const UUID = "3F2504E0-4F89-11D3-9A0C-0305E82C3301";

    it("geçerli UUID'yi küçük harfe çevirerek korur", () => {
      const [urun] = parseUrunlerFromFormData(formOf({ fotograf_url_0: "a", product_id_0: ` ${UUID} ` }));
      expect(urun.product_id).toBe(UUID.toLowerCase());
    });

    it("boş veya geçersiz değeri NULL yapar", () => {
      const result = parseUrunlerFromFormData(
        formOf({
          fotograf_url_0: "a",
          fotograf_url_1: "b",
          product_id_1: "urun-1; drop table",
        })
      );
      expect(result.map((u) => u.product_id)).toEqual([null, null]);
    });

    it("kopyalanan üründe aynı bağlantıyı yalnızca ilkinde tutar", () => {
      const result = parseUrunlerFromFormData(
        formOf({
          fotograf_url_0: "a",
          product_id_0: UUID,
          fotograf_url_1: "b",
          product_id_1: UUID,
        })
      );
      expect(result.map((u) => u.product_id)).toEqual([UUID.toLowerCase(), null]);
    });

    it("fotoğrafsız bağlı ürün de diğer ürünler gibi atlanır", () => {
      const result = parseUrunlerFromFormData(formOf({ product_id_0: UUID }));
      expect(result).toHaveLength(0);
    });
  });
});
