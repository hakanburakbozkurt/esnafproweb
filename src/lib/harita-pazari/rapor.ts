export type HaritaKonum = { lat: number; lng: number };

/** Google Places'tan canlı alınan, saklanmayan işletme bilgisi */
export type HaritaPlace = {
  id: string;
  ad: string;
  puan: number | null;
  yorumSayisi: number | null;
  kategori: string | null;
  konum: HaritaKonum | null;
  haritaUrl: string | null;
};

export type SiraDegisimi =
  | { tur: "yukseldi" | "dustu"; fark: number }
  | { tur: "sabit" }
  | { tur: "listeden_cikti" }
  | { tur: "yeni" }
  | { tur: "bilinmiyor" };

export type HaritaRaporSatiri = HaritaPlace & {
  /** 1–20; null = ilk 20 dışında */
  sira: number | null;
  mesafeKm: number | null;
  degisim: SiraDegisimi;
  kendi: boolean;
};

export type RakipAnalizi = {
  satir: HaritaRaporSatiri;
  puanKiyas: "senden_yuksek" | "senden_dusuk" | "esit" | "bilinmiyor";
  /** rakip yorum / senin yorum; senin yorumun 0 ise null */
  yorumOrani: number | null;
  tavsiye: string;
};

export type OzetMaddesi = { olumlu: boolean; metin: string };

export type HaritaPazariRaporu = {
  kendi: HaritaRaporSatiri | null;
  rakipler: HaritaRaporSatiri[];
  rakipAnalizi: RakipAnalizi[];
  ozet: OzetMaddesi[];
  aksiyon: string;
  yorumHedefi: { rakipOrtalamasi: number; eksik: number } | null;
  toplamSonuc: number;
  /** Sıra değişiminin neye göre hesaplandığı; karşılaştırma yoksa null */
  karsilastirmaTarihi: string | null;
};

const EARTH_RADIUS_KM = 6371;

export function mesafeKm(a: HaritaKonum, b: HaritaKonum): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h));
}

/** Türkçe karakterleri sadeleştirip karşılaştırılabilir kelimelere böler. */
export function normalizeIsletmeAdi(ad: string): string[] {
  return ad
    .toLocaleLowerCase("tr")
    .replace(/ı/g, "i")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .split(" ")
    .filter(Boolean);
}

/** Kısa addaki kelimelerin uzun adda bulunma oranı (0–1). */
export function adBenzerligi(a: string, b: string): number {
  const ta = new Set(normalizeIsletmeAdi(a));
  const tb = new Set(normalizeIsletmeAdi(b));
  if (!ta.size || !tb.size) return 0;
  let ortak = 0;
  for (const token of ta) if (tb.has(token)) ortak += 1;
  return ortak / Math.min(ta.size, tb.size);
}

const MIN_AD_BENZERLIGI = 0.6;
const MAX_KENDI_MESAFE_KM = 1;

/** Aday işletmeler arasından mağazanın kendi Google kaydını seçer. */
export function kendiIsletmeniBul(
  adaylar: HaritaPlace[],
  dukkan: { ad: string; konum: HaritaKonum }
): HaritaPlace | null {
  let enIyi: { place: HaritaPlace; benzerlik: number; mesafe: number } | null = null;

  for (const place of adaylar) {
    const benzerlik = adBenzerligi(dukkan.ad, place.ad);
    if (benzerlik < MIN_AD_BENZERLIGI) continue;
    const mesafe = place.konum ? mesafeKm(dukkan.konum, place.konum) : 0;
    if (mesafe > MAX_KENDI_MESAFE_KM) continue;

    if (
      !enIyi ||
      benzerlik > enIyi.benzerlik ||
      (benzerlik === enIyi.benzerlik && mesafe < enIyi.mesafe)
    ) {
      enIyi = { place, benzerlik, mesafe };
    }
  }

  return enIyi?.place ?? null;
}

export function siraDegisimi(
  placeId: string,
  guncelSira: number | null,
  oncekiSiralama: string[] | null
): SiraDegisimi {
  if (!oncekiSiralama) return { tur: "bilinmiyor" };
  const index = oncekiSiralama.indexOf(placeId);
  const oncekiSira = index === -1 ? null : index + 1;

  if (guncelSira === null) return oncekiSira === null ? { tur: "bilinmiyor" } : { tur: "listeden_cikti" };
  if (oncekiSira === null) return { tur: "yeni" };

  const fark = oncekiSira - guncelSira;
  if (fark > 0) return { tur: "yukseldi", fark };
  if (fark < 0) return { tur: "dustu", fark: -fark };
  return { tur: "sabit" };
}

/** Önceki taramalardan (yeniden eskiye) karşılaştırma tabanını seçer: tercihen ~1 hafta önce. */
export function karsilastirmaTaramasiSec<T extends { created_at: string }>(
  taramalar: T[],
  simdi: Date
): T | null {
  const HAFTA = 6.5 * 24 * 60 * 60 * 1000;
  const MIN_ARALIK = 12 * 60 * 60 * 1000;
  const eskiler = taramalar.filter(
    (t) => simdi.getTime() - new Date(t.created_at).getTime() >= MIN_ARALIK
  );
  return (
    eskiler.find((t) => simdi.getTime() - new Date(t.created_at).getTime() >= HAFTA) ??
    eskiler.at(-1) ??
    null
  );
}

function rakipTavsiyesi(
  kendi: HaritaPlace,
  rakip: HaritaPlace,
  blogYaziSayisi: number
): string {
  const kendiYorum = kendi.yorumSayisi ?? 0;
  const rakipYorum = rakip.yorumSayisi ?? 0;

  if (rakipYorum > Math.max(kendiYorum * 1.5, kendiYorum + 10)) {
    return "Yorum sayısında öndeler. Her teslimde müşterinden Google yorumu iste; memnun müşteri en güçlü sinyaldir.";
  }
  if ((rakip.puan ?? 0) > (kendi.puan ?? 0)) {
    return "Puanları senden yüksek. Olumsuz yorumlara kibarca yanıt ver ve hizmet kaliteni öne çıkar.";
  }
  if (blogYaziSayisi < 3) {
    return "Blog yazıları ekleyerek yerel SEO skorunu yükselt; bölgendeki aramalarda daha görünür olursun.";
  }
  return "Ürün ve hizmet çeşitliliğini vitrininde öne çıkar; fiyat ve stok bilgilerini güncel tut.";
}

function puanKiyasi(kendi: HaritaPlace, rakip: HaritaPlace): RakipAnalizi["puanKiyas"] {
  if (kendi.puan === null || rakip.puan === null) return "bilinmiyor";
  if (rakip.puan > kendi.puan) return "senden_yuksek";
  if (rakip.puan < kendi.puan) return "senden_dusuk";
  return "esit";
}

const formatPuan = (puan: number | null) =>
  puan === null ? "—" : puan.toLocaleString("tr-TR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });

export function raporOlustur(input: {
  siralama: HaritaPlace[];
  kendiPlace: HaritaPlace | null;
  dukkanKonum: HaritaKonum;
  oncekiSiralama: string[] | null;
  karsilastirmaTarihi: string | null;
  blogYaziSayisi: number;
}): HaritaPazariRaporu {
  const { siralama, kendiPlace, dukkanKonum, oncekiSiralama, blogYaziSayisi } = input;

  const satir = (place: HaritaPlace, sira: number | null, kendi: boolean): HaritaRaporSatiri => ({
    ...place,
    sira,
    kendi,
    mesafeKm: place.konum ? mesafeKm(dukkanKonum, place.konum) : null,
    degisim: siraDegisimi(place.id, sira, oncekiSiralama),
  });

  const kendiIndex = kendiPlace ? siralama.findIndex((p) => p.id === kendiPlace.id) : -1;
  const kendi = kendiPlace ? satir(kendiPlace, kendiIndex === -1 ? null : kendiIndex + 1, true) : null;

  const rakipler = siralama
    .map((place, index) => ({ place, sira: index + 1 }))
    .filter(({ place }) => place.id !== kendiPlace?.id)
    .slice(0, 3)
    .map(({ place, sira }) => satir(place, sira, false));

  const rakipAnalizi: RakipAnalizi[] = kendi
    ? rakipler.map((rakip) => ({
        satir: rakip,
        puanKiyas: puanKiyasi(kendi, rakip),
        yorumOrani:
          kendi.yorumSayisi && rakip.yorumSayisi !== null
            ? rakip.yorumSayisi / kendi.yorumSayisi
            : null,
        tavsiye: rakipTavsiyesi(kendi, rakip, blogYaziSayisi),
      }))
    : [];

  const ozet: OzetMaddesi[] = [];
  let aksiyon = "Google İşletme profilinde fotoğraflarını ve çalışma saatlerini güncel tut.";
  let yorumHedefi: HaritaPazariRaporu["yorumHedefi"] = null;

  if (kendi) {
    if (kendi.sira === 1) ozet.push({ olumlu: true, metin: "Bölgende 1. sıradasın." });
    else if (kendi.sira) ozet.push({ olumlu: false, metin: `Bölgende ${kendi.sira}. sıradasın.` });
    else ozet.push({ olumlu: false, metin: "5 km içindeki ilk 20 sonuçta görünmüyorsun." });

    const rakipPuanlari = rakipler.map((r) => r.puan).filter((p): p is number => p !== null);
    if (kendi.puan !== null && rakipPuanlari.length) {
      const lider = kendi.puan >= Math.max(...rakipPuanlari);
      const kiyas = `${formatPuan(kendi.puan)} vs ${rakipPuanlari.map(formatPuan).join(" / ")}`;
      ozet.push({
        olumlu: lider,
        metin: lider ? `Puanda lidersin (${kiyas}).` : `Puanda rakiplerin önde (${kiyas}).`,
      });
    }

    const rakipYorumlari = rakipler
      .map((r) => r.yorumSayisi)
      .filter((y): y is number => y !== null);
    const kendiYorum = kendi.yorumSayisi ?? 0;
    if (rakipYorumlari.length) {
      const yorumLideri = kendiYorum >= Math.max(...rakipYorumlari);
      ozet.push({
        olumlu: yorumLideri,
        metin: yorumLideri ? "Yorum sayısında lidersin." : "Rakipler yorum sayısında ileride.",
      });

      const ortalama = Math.round(rakipYorumlari.reduce((a, b) => a + b, 0) / rakipYorumlari.length);
      if (ortalama > kendiYorum) yorumHedefi = { rakipOrtalamasi: ortalama, eksik: ortalama - kendiYorum };

      if (!yorumLideri) aksiyon = "Daha fazla müşteriden Google yorumu al.";
      else if (rakipPuanlari.some((p) => p > (kendi.puan ?? 0)))
        aksiyon = "Olumsuz yorumlara yanıt vererek puanını yükselt.";
    }
  }

  return {
    kendi,
    rakipler,
    rakipAnalizi,
    ozet,
    aksiyon,
    yorumHedefi,
    toplamSonuc: siralama.length,
    karsilastirmaTarihi: oncekiSiralama ? input.karsilastirmaTarihi : null,
  };
}
