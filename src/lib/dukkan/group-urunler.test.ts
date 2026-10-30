import { afterEach, describe, expect, it, vi } from "vitest";
import {
  buildUrunPublicUrl,
  buildUrunWhatsAppUrl,
  groupUrunlerByKategori,
} from "@/lib/dukkan/group-urunler";
import { makeUrun } from "@/test/factories";

describe("groupUrunlerByKategori", () => {
  it("kategori yoksa tek, başlıksız grup döner", () => {
    const urunler = [makeUrun(), makeUrun()];
    const groups = groupUrunlerByKategori(urunler);

    expect(groups).toHaveLength(1);
    expect(groups[0].title).toBeNull();
    expect(groups[0].urunler).toEqual(urunler);
  });

  it("kategorileri ilk görünme sırasıyla dizer, kategorisizleri en sona 'Diğer ürünler' olarak koyar", () => {
    const kilif = makeUrun({ urun_kategorisi: "Kılıf" });
    const kategorisiz = makeUrun({ urun_kategorisi: "  " });
    const sarj = makeUrun({ urun_kategorisi: "Şarj" });
    const kilif2 = makeUrun({ urun_kategorisi: " Kılıf " });

    const groups = groupUrunlerByKategori([kilif, kategorisiz, sarj, kilif2]);

    expect(groups.map((g) => g.title)).toEqual(["Kılıf", "Şarj", "Diğer ürünler"]);
    expect(groups[0].urunler).toEqual([kilif, kilif2]);
    expect(groups[2].urunler).toEqual([kategorisiz]);
  });

  it("grup kimlikleri benzersizdir", () => {
    const groups = groupUrunlerByKategori([
      makeUrun({ urun_kategorisi: "A" }),
      makeUrun({ urun_kategorisi: "B" }),
      makeUrun(),
    ]);
    const ids = groups.map((g) => g.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe("ürün bağlantıları", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("paylaşılabilir ürün adresi ?urun= parametresi taşır", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://www.esnafpro.app/");
    expect(buildUrunPublicUrl("beep", "a b")).toBe("https://www.esnafpro.app/beep?urun=a%20b");
  });

  it("WhatsApp mesajı ürün adını ve ürün bağlantısını içerir", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://www.esnafpro.app");
    const url = new URL(
      buildUrunWhatsAppUrl("905551112233", "beep", { id: "u1", urun_adi: "iPhone Kılıf" })
    );

    expect(url.origin + url.pathname).toBe("https://wa.me/905551112233");
    expect(url.searchParams.get("text")).toBe(
      "Merhaba, iPhone Kılıf ürününüzle ilgileniyorum. Detaylar: https://www.esnafpro.app/beep?urun=u1"
    );
  });
});

describe("groupUrunlerByKategori alt kategoriler", () => {
  it("aynı ana kategorideki ürünleri tek klasörde toplar ve alt kategorilere ayırır", () => {
    const silikon = makeUrun({ urun_kategorisi: "Kılıf › Silikon Kılıf" });
    const deri = makeUrun({ urun_kategorisi: "Kılıf › Deri Kılıf" });
    const genel = makeUrun({ urun_kategorisi: "Kılıf" });
    const silikon2 = makeUrun({ urun_kategorisi: "Kılıf › Silikon Kılıf" });

    const groups = groupUrunlerByKategori([silikon, deri, genel, silikon2]);

    expect(groups).toHaveLength(1);
    expect(groups[0].title).toBe("Kılıf");
    expect(groups[0].urunler).toHaveLength(4);
    expect(groups[0].altGruplar.map((a) => a.title)).toEqual(["Silikon Kılıf", "Deri Kılıf", null]);
    expect(groups[0].altGruplar[0].urunler).toEqual([silikon, silikon2]);
  });

  it("alt kategorisi olmayan kategoride altGruplar boştur", () => {
    const groups = groupUrunlerByKategori([makeUrun({ urun_kategorisi: "Tablet" })]);
    expect(groups[0].altGruplar).toEqual([]);
  });
});
