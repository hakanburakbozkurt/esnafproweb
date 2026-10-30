import { describe, expect, it } from "vitest";
import {
  VITRIN_ALT_KATEGORILERI,
  VITRIN_CIHAZ_KATEGORILERI,
  VITRIN_KATEGORILERI,
  ayirKategori,
  birlestirKategori,
  mergeVitrinKategorileri,
} from "@/lib/dukkan/vitrin-kategorileri";

const FORM_HAZIRLARI = [...VITRIN_KATEGORILERI, ...VITRIN_CIHAZ_KATEGORILERI];

describe("mergeVitrinKategorileri", () => {
  it("hazır kategorileri ve cihaz seçeneklerini verilen sırada başa koyar", () => {
    const sonuc = mergeVitrinKategorileri([]);
    expect(sonuc).toEqual(FORM_HAZIRLARI);
    expect(sonuc).toContain("Telefon (cihaz)");
  });

  it("özel kategorileri sona, A-Z sıralı ekler ve tekrar etmez", () => {
    const sonuc = mergeVitrinKategorileri(["Zeta", "Kılıf", "Alfa"]);
    expect(sonuc.slice(0, FORM_HAZIRLARI.length)).toEqual(FORM_HAZIRLARI);
    expect(sonuc.slice(FORM_HAZIRLARI.length)).toEqual(["Alfa", "Zeta"]);
    expect(sonuc.filter((k) => k === "Kılıf")).toHaveLength(1);
  });
});

describe("ana ve alt kategori ayrımı", () => {
  it("birleştirip ayırmak aynı değeri verir", () => {
    const deger = birlestirKategori("Kılıf", "Silikon Kılıf");
    expect(deger).toBe("Kılıf › Silikon Kılıf");
    expect(ayirKategori(deger)).toEqual({ ana: "Kılıf", alt: "Silikon Kılıf" });
  });

  it("alt kategori yoksa yalnızca ana kategori döner", () => {
    expect(birlestirKategori("Tablet", "")).toBe("Tablet");
    expect(ayirKategori("Tablet")).toEqual({ ana: "Tablet", alt: null });
    expect(ayirKategori(null)).toEqual({ ana: "", alt: null });
  });

  it("her ana kategorinin alt listesi tanımlıdır ve ana listeyle eşleşir", () => {
    for (const ana of VITRIN_KATEGORILERI) {
      expect(VITRIN_ALT_KATEGORILERI[ana]?.length ?? 0).toBeGreaterThan(0);
    }
  });
});
