import { describe, expect, it } from "vitest";
import {
  adBenzerligi,
  karsilastirmaTaramasiSec,
  kendiIsletmeniBul,
  mesafeKm,
  raporOlustur,
  siraDegisimi,
  type HaritaPlace,
} from "@/lib/harita-pazari/rapor";

const MERKEZ = { lat: 41.0, lng: 29.0 };

function place(id: string, overrides: Partial<HaritaPlace> = {}): HaritaPlace {
  return {
    id,
    ad: id,
    puan: 4.5,
    yorumSayisi: 100,
    kategori: "Cep telefonu mağazası",
    konum: MERKEZ,
    haritaUrl: null,
    ...overrides,
  };
}

describe("mesafeKm", () => {
  it("aynı nokta 0 km, ~0.009° enlem ≈ 1 km", () => {
    expect(mesafeKm(MERKEZ, MERKEZ)).toBe(0);
    expect(mesafeKm(MERKEZ, { lat: 41.009, lng: 29.0 })).toBeCloseTo(1, 1);
  });
});

describe("adBenzerligi", () => {
  it("Türkçe karakter ve büyük/küçük harf farkını yok sayar", () => {
    expect(adBenzerligi("Öztürk İletişim", "OZTURK ILETISIM")).toBe(1);
  });

  it("kısa ad uzun adın içindeyse eşleşir", () => {
    expect(adBenzerligi("Beep Mobile Store", "Beep Mobile Store - Kadıköy Telefon Tamiri")).toBe(1);
  });

  it("farklı işletmeler düşük skor alır", () => {
    expect(adBenzerligi("Beep Mobile Store", "Cep Hastanesi")).toBe(0);
  });
});

describe("kendiIsletmeniBul", () => {
  const dukkan = { ad: "Beep Mobile Store", konum: MERKEZ };

  it("adı ve konumu tutan kaydı seçer", () => {
    const kendi = place("beep", { ad: "Beep Mobile Store" });
    expect(kendiIsletmeniBul([place("rakip", { ad: "Cep Hastanesi" }), kendi], dukkan)).toBe(kendi);
  });

  it("aynı ad 1 km'den uzaksa (başka şube) seçmez", () => {
    const uzak = place("beep-2", { ad: "Beep Mobile Store", konum: { lat: 41.05, lng: 29.0 } });
    expect(kendiIsletmeniBul([uzak], dukkan)).toBeNull();
  });
});

describe("siraDegisimi", () => {
  it("önceki tarama yoksa bilinmiyor", () => {
    expect(siraDegisimi("a", 1, null)).toEqual({ tur: "bilinmiyor" });
  });

  it("yükselme, düşme ve sabit durumlarını hesaplar", () => {
    const onceki = ["b", "c", "a"];
    expect(siraDegisimi("a", 1, onceki)).toEqual({ tur: "yukseldi", fark: 2 });
    expect(siraDegisimi("b", 3, onceki)).toEqual({ tur: "dustu", fark: 2 });
    expect(siraDegisimi("c", 2, onceki)).toEqual({ tur: "sabit" });
  });

  it("listeye yeni girme ve listeden çıkma", () => {
    expect(siraDegisimi("yeni", 4, ["a"])).toEqual({ tur: "yeni" });
    expect(siraDegisimi("a", null, ["a"])).toEqual({ tur: "listeden_cikti" });
  });
});

describe("karsilastirmaTaramasiSec", () => {
  const simdi = new Date("2026-10-27T12:00:00Z");
  const gunOnce = (gun: number) => ({ created_at: new Date(simdi.getTime() - gun * 864e5).toISOString() });

  it("tercihen ~1 hafta önceki taramayı seçer", () => {
    const taramalar = [gunOnce(0.1), gunOnce(1), gunOnce(7), gunOnce(14)];
    expect(karsilastirmaTaramasiSec(taramalar, simdi)).toBe(taramalar[2]);
  });

  it("haftalık yoksa en eski (12 saatten eski) taramayı seçer", () => {
    const taramalar = [gunOnce(0.1), gunOnce(1), gunOnce(3)];
    expect(karsilastirmaTaramasiSec(taramalar, simdi)).toBe(taramalar[2]);
  });

  it("yalnızca bugünkü tarama varsa karşılaştırma yapmaz", () => {
    expect(karsilastirmaTaramasiSec([gunOnce(0.1)], simdi)).toBeNull();
  });
});

describe("raporOlustur", () => {
  const kendi = place("beep", { ad: "Beep Mobile Store", puan: 5, yorumSayisi: 59 });
  const ozturk = place("ozturk", { ad: "Öztürk İletişim", puan: 4.8, yorumSayisi: 245, konum: { lat: 41.0027, lng: 29.0 } });
  const cep = place("cep", { ad: "Cep Hastanesi", puan: 4.6, yorumSayisi: 189 });
  const dorduncu = place("d", { puan: 4.1, yorumSayisi: 20 });
  const besinci = place("e");

  const rapor = raporOlustur({
    siralama: [kendi, ozturk, cep, dorduncu, besinci],
    kendiPlace: kendi,
    dukkanKonum: MERKEZ,
    oncekiSiralama: ["beep", "cep", "d", "ozturk"],
    karsilastirmaTarihi: "2026-10-20T09:00:00Z",
    blogYaziSayisi: 0,
  });

  it("kendi sıranı ve kendini hariç tutan ilk 3 rakibi döner", () => {
    expect(rapor.kendi).toMatchObject({ id: "beep", sira: 1, kendi: true, mesafeKm: 0 });
    expect(rapor.rakipler.map((r) => [r.id, r.sira])).toEqual([
      ["ozturk", 2],
      ["cep", 3],
      ["d", 4],
    ]);
    expect(rapor.rakipler[0].degisim).toEqual({ tur: "yukseldi", fark: 2 });
    expect(rapor.rakipler[0].mesafeKm).toBeCloseTo(0.3, 1);
  });

  it("rakip analizi: puan kıyası, yorum oranı ve tavsiye", () => {
    const [ilk] = rapor.rakipAnalizi;
    expect(ilk.puanKiyas).toBe("senden_dusuk");
    expect(ilk.yorumOrani).toBeCloseTo(245 / 59, 2);
    expect(ilk.tavsiye).toMatch(/yorum/i);
  });

  it("özet: puanda lider, yorumda geride → aksiyon yorum toplamak", () => {
    expect(rapor.ozet).toContainEqual({ olumlu: true, metin: "Bölgende 1. sıradasın." });
    expect(rapor.ozet.find((m) => m.metin.startsWith("Puanda"))?.olumlu).toBe(true);
    expect(rapor.ozet).toContainEqual({ olumlu: false, metin: "Rakipler yorum sayısında ileride." });
    expect(rapor.aksiyon).toBe("Daha fazla müşteriden Google yorumu al.");
  });

  it("yorum hedefi rakip ortalamasına göre hesaplanır", () => {
    const ortalama = Math.round((245 + 189 + 20) / 3);
    expect(rapor.yorumHedefi).toEqual({ rakipOrtalamasi: ortalama, eksik: ortalama - 59 });
  });

  it("kendi kaydı ilk 20'de yoksa sıra null olur", () => {
    const disarida = raporOlustur({
      siralama: [ozturk, cep],
      kendiPlace: kendi,
      dukkanKonum: MERKEZ,
      oncekiSiralama: null,
      karsilastirmaTarihi: null,
      blogYaziSayisi: 5,
    });
    expect(disarida.kendi?.sira).toBeNull();
    expect(disarida.ozet[0]).toEqual({ olumlu: false, metin: "5 km içindeki ilk 20 sonuçta görünmüyorsun." });
    expect(disarida.karsilastirmaTarihi).toBeNull();
  });
});
