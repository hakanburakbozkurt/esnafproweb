import { matchesListingType, matchesMarketplaceCategory } from "@/lib/marketplace/marketplace-filters";
import type {
  MarketplaceCategoryId,
  MarketplaceListing,
  MarketplaceListingTypeId,
} from "@/lib/marketplace/public-listing.types";

/**
 * Arama diline göre açılmış pazaryeri sayfaları ("ikinci el telefon",
 * "sıfır tablet" …). Her biri kendi başlığı, açıklaması ve JSON-LD'si olan,
 * Google'ın ayrı ayrı sıralayabileceği bir sayfadır: /pazaryeri/<slug>
 */
export type PazaryeriSayfasi = {
  slug: string;
  tur: Exclude<MarketplaceListingTypeId, "all">;
  kategori: MarketplaceCategoryId;
  /** H1 ve başlığın ana kısmı */
  baslik: string;
  /** Linklerde ve cümle içinde: "ikinci el telefon" */
  kisaAd: string;
  /** Üstteki küçük etiket */
  etiket: string;
};

export const PAZARYERI_SAYFALARI: readonly PazaryeriSayfasi[] = [
  { slug: "ikinci-el", tur: "used", kategori: "all", baslik: "İkinci El Telefon, Tablet ve Bilgisayar", kisaAd: "ikinci el cihaz", etiket: "İkinci El" },
  { slug: "sifir", tur: "new", kategori: "all", baslik: "Sıfır Telefon, Tablet ve Bilgisayar", kisaAd: "sıfır cihaz", etiket: "Sıfır" },
  { slug: "ikinci-el-telefon", tur: "used", kategori: "telefon", baslik: "İkinci El Telefon İlanları", kisaAd: "ikinci el telefon", etiket: "İkinci El · Telefon" },
  { slug: "sifir-telefon", tur: "new", kategori: "telefon", baslik: "Sıfır Telefon Fiyatları", kisaAd: "sıfır telefon", etiket: "Sıfır · Telefon" },
  { slug: "ikinci-el-tablet", tur: "used", kategori: "tablet", baslik: "İkinci El Tablet ve iPad İlanları", kisaAd: "ikinci el tablet", etiket: "İkinci El · Tablet" },
  { slug: "sifir-tablet", tur: "new", kategori: "tablet", baslik: "Sıfır Tablet ve iPad Fiyatları", kisaAd: "sıfır tablet", etiket: "Sıfır · Tablet" },
  { slug: "ikinci-el-bilgisayar", tur: "used", kategori: "bilgisayar", baslik: "İkinci El Laptop ve Bilgisayar İlanları", kisaAd: "ikinci el bilgisayar", etiket: "İkinci El · Bilgisayar" },
  { slug: "ikinci-el-akilli-saat", tur: "used", kategori: "akilli_saat", baslik: "İkinci El Akıllı Saat ve Apple Watch İlanları", kisaAd: "ikinci el akıllı saat", etiket: "İkinci El · Akıllı Saat" },
];

export function pazaryeriSayfasiBul(slug: string): PazaryeriSayfasi | null {
  return PAZARYERI_SAYFALARI.find((sayfa) => sayfa.slug === slug) ?? null;
}

export function pazaryeriSayfasiPath(sayfa: Pick<PazaryeriSayfasi, "slug">): string {
  return `/pazaryeri/${sayfa.slug}`;
}

type IlanBenzeri = Pick<MarketplaceListing, "device">;

export function ilanSayfayaUyar(ilan: IlanBenzeri, sayfa: PazaryeriSayfasi): boolean {
  return (
    matchesListingType(ilan.device.listing_type, sayfa.tur) &&
    matchesMarketplaceCategory(ilan as MarketplaceListing, sayfa.kategori)
  );
}

export function sayfaIlanlari<T extends IlanBenzeri>(ilanlar: T[], sayfa: PazaryeriSayfasi): T[] {
  return ilanlar.filter((ilan) => ilanSayfayaUyar(ilan, sayfa));
}

/** En çok ilanın olduğu ilçeler (başlık ve açıklama için): ["Esenyurt", "Başakşehir"] */
export function enCokIlceler(ilanlar: Pick<MarketplaceListing, "ilce" | "il">[], adet = 3): string[] {
  const sayac = new Map<string, number>();
  for (const ilan of ilanlar) {
    const ad = ilan.ilce ?? ilan.il;
    if (!ad) continue;
    sayac.set(ad, (sayac.get(ad) ?? 0) + 1);
  }
  return [...sayac.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "tr"))
    .slice(0, adet)
    .map(([ad]) => ad);
}

/** "Esenyurt, Başakşehir ve Ümraniye" */
export function ilceListesiMetni(ilceler: string[]): string {
  if (ilceler.length <= 1) return ilceler[0] ?? "";
  return `${ilceler.slice(0, -1).join(", ")} ve ${ilceler[ilceler.length - 1]}`;
}

export function pazaryeriSayfaBasligi(sayfa: PazaryeriSayfasi, ilceler: string[]): string {
  const alan = ilceler.slice(0, 2).join(", ");
  return alan ? `${sayfa.baslik} — ${alan}` : sayfa.baslik;
}

export function pazaryeriSayfaAciklamasi(sayfa: PazaryeriSayfasi, ilanSayisi: number, ilceler: string[]): string {
  if (ilanSayisi === 0) {
    return `${sayfa.baslik}: telefoncu esnaflarının ${sayfa.kisaAd} ilanları EsnafPRO pazaryerinde. Yakındaki mağazayı bulun, WhatsApp'tan sorun.`;
  }
  const yer = ilceListesiMetni(ilceler);
  const ozellik =
    sayfa.tur === "used"
      ? "Durum ve ekspertiz bilgisiyle"
      : "Mağaza ve garanti bilgisiyle";
  return `${yer ? `${yer} bölgesindeki ` : ""}telefoncu mağazalarından ${ilanSayisi} ${sayfa.kisaAd} ilanı. ${ozellik}; fiyatı görün, mağazaya WhatsApp'tan sorun.`;
}
