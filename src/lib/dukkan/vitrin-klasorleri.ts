import { ayirKategori, VITRIN_KATEGORILERI } from "@/lib/dukkan/vitrin-kategorileri";

/**
 * Vitrin klasörleri: mağazanın ürünleri (dukkan_urunleri) ve yayındaki cihazları
 * (second_hand_devices_public) aynı kategori klasörlerinde toplanır.
 * Veritabanına yazmaz; yalnızca gösterim için hesaplanır.
 */

/** Türkçe karakterleri sadeleştirip URL'ye uygun parça üretir: "Cam - Ekran Koruyucu" → "cam-ekran-koruyucu". */
export function slugifyTr(text: string): string {
  return text
    .trim()
    .toLocaleLowerCase("tr-TR")
    .replace(/ı/g, "i")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/g, "");
}

/**
 * Cihaz türü → müşterinin gördüğü klasör adı. "(cihaz)" eki burada kullanılmaz;
 * ürün formundaki "(cihaz)" seçenekleri de aynı klasörlere gider (aşağıdaki eşleme).
 */
const CIHAZ_KLASORU: Record<string, string> = {
  phone: "Telefonlar",
  tablet: "Tabletler",
  computer: "Bilgisayarlar",
  watch: "Akıllı Saatler",
  console: "Konsollar",
};

/** Cihaz türü bilinmiyorsa düştüğü klasör. */
const VARSAYILAN_CIHAZ_KLASORU = "Diğer Cihazlar";

/** Ürün formunda "(cihaz)" ile seçilen kategori → aynı cihaz klasörü. */
const CIHAZ_URUN_KATEGORISI_KLASORU: Record<string, string> = {
  "Telefon (cihaz)": CIHAZ_KLASORU.phone,
  "Tablet (cihaz)": CIHAZ_KLASORU.tablet,
  "Bilgisayar (cihaz)": CIHAZ_KLASORU.computer,
  "Akıllı Saat (cihaz)": CIHAZ_KLASORU.watch,
  "Konsol (cihaz)": CIHAZ_KLASORU.console,
};

export const DIGER_URUNLER_KLASORU = "Diğer Ürünler";

/** Eşit adette klasörlerin sırası: önce cihaz klasörleri, sonra hazır ürün kategorileri. */
const KLASOR_SIRASI: readonly string[] = [
  ...Object.values(CIHAZ_KLASORU),
  VARSAYILAN_CIHAZ_KLASORU,
  ...VITRIN_KATEGORILERI,
];

export type VitrinUrunMin = {
  id: string;
  urun_adi: string;
  urun_kategorisi: string | null;
};

export type VitrinCihazMin = {
  /** second_hand_devices_public bir görünüm olduğu için tip düzeyinde boş olabilir */
  id: string | null;
  device_category: string | null;
  listing_type: string | null;
};

export type KlasorOgesi<U, C> =
  | { tur: "urun"; urun: U; alt: string | null }
  | { tur: "cihaz"; cihaz: C; alt: null };

export type KlasorAltGrubu = {
  slug: string;
  ad: string;
  adet: number;
};

export type VitrinKlasoru<U, C> = {
  slug: string;
  ad: string;
  ogeler: KlasorOgesi<U, C>[];
  urunSayisi: number;
  cihazSayisi: number;
  /** Alt kategori seçenekleri (ilk görünme sırasıyla). Alt kategorisi olmayan öğeler burada yer almaz. */
  altlar: KlasorAltGrubu[];
};

export function cihazKlasorAdi(deviceCategory: string | null | undefined): string {
  return CIHAZ_KLASORU[deviceCategory?.trim() ?? ""] ?? VARSAYILAN_CIHAZ_KLASORU;
}

function siraIndex(ad: string): number {
  const index = KLASOR_SIRASI.indexOf(ad);
  return index === -1 ? KLASOR_SIRASI.length : index;
}

/**
 * Ürün ve cihazları klasörlere toplar. Boş klasör üretmez.
 * Sıralama: öğe sayısı çoktan aza; eşitlikte cihaz klasörleri ve hazır kategori sırası;
 * kategorisiz ürünler ("Diğer Ürünler") her zaman en sonda.
 */
export function buildVitrinKlasorleri<U extends VitrinUrunMin, C extends VitrinCihazMin>(
  urunler: readonly U[],
  cihazlar: readonly C[]
): VitrinKlasoru<U, C>[] {
  const klasorler = new Map<string, VitrinKlasoru<U, C>>();
  const altSayaclari = new Map<string, Map<string, number>>();

  function klasorAl(ad: string): VitrinKlasoru<U, C> {
    let klasor = klasorler.get(ad);
    if (!klasor) {
      klasor = { slug: slugifyTr(ad) || "kategori", ad, ogeler: [], urunSayisi: 0, cihazSayisi: 0, altlar: [] };
      klasorler.set(ad, klasor);
      altSayaclari.set(ad, new Map());
    }
    return klasor;
  }

  function altEkle(klasorAd: string, alt: string | null) {
    if (!alt) return;
    const sayac = altSayaclari.get(klasorAd)!;
    sayac.set(alt, (sayac.get(alt) ?? 0) + 1);
  }

  for (const urun of urunler) {
    const { ana, alt } = ayirKategori(urun.urun_kategorisi);
    const klasorAd = CIHAZ_URUN_KATEGORISI_KLASORU[ana] ?? (ana || DIGER_URUNLER_KLASORU);
    const klasor = klasorAl(klasorAd);
    klasor.ogeler.push({ tur: "urun", urun, alt });
    klasor.urunSayisi += 1;
    altEkle(klasorAd, alt);
  }

  for (const cihaz of cihazlar) {
    // Cihaz klasörlerinde alt kategori yok; sıfır / ikinci el bilgisi kartın üzerinde yazar.
    const klasorAd = cihazKlasorAdi(cihaz.device_category);
    const klasor = klasorAl(klasorAd);
    klasor.ogeler.push({ tur: "cihaz", cihaz, alt: null });
    klasor.cihazSayisi += 1;
  }

  const sonuc = [...klasorler.values()];
  for (const klasor of sonuc) {
    const sayac = altSayaclari.get(klasor.ad)!;
    klasor.altlar = [...sayac.entries()].map(([ad, adet]) => ({ slug: slugifyTr(ad) || "alt", ad, adet }));
  }

  // Aynı slug'a düşen iki farklı klasör adı olursa (ör. "Kılıf" ve "kılıf ") ikinciye ek verilir.
  const kullanilan = new Set<string>();
  sonuc.sort((a, b) => {
    if (a.ad === DIGER_URUNLER_KLASORU) return 1;
    if (b.ad === DIGER_URUNLER_KLASORU) return -1;
    const fark = b.ogeler.length - a.ogeler.length;
    if (fark !== 0) return fark;
    const siraFark = siraIndex(a.ad) - siraIndex(b.ad);
    if (siraFark !== 0) return siraFark;
    return a.ad.localeCompare(b.ad, "tr");
  });
  for (const klasor of sonuc) {
    let slug = klasor.slug;
    let ek = 2;
    while (kullanilan.has(slug)) slug = `${klasor.slug}-${ek++}`;
    kullanilan.add(slug);
    klasor.slug = slug;
  }

  return sonuc;
}

/** Klasördeki öğeleri seçili alt kategoriye göre süzer (altSlug null/bilinmiyorsa hepsi). */
export function klasorOgeleriniSuz<U, C>(
  klasor: VitrinKlasoru<U, C>,
  altSlug: string | null | undefined
): { ogeler: KlasorOgesi<U, C>[]; seciliAlt: KlasorAltGrubu | null } {
  const seciliAlt = altSlug ? klasor.altlar.find((alt) => alt.slug === altSlug) ?? null : null;
  if (!seciliAlt) return { ogeler: klasor.ogeler, seciliAlt: null };
  return { ogeler: klasor.ogeler.filter((oge) => oge.alt === seciliAlt.ad), seciliAlt };
}

/**
 * Ürün sayfası adresleri ürün adından üretilir; ürünler her kayıtta yeniden
 * eklendiği için id kalıcı değildir. Aynı adlı ürünlere sırayla -2, -3 eklenir.
 * Girdi, vitrindeki sırayla (sira) verilmelidir ki sonuç kararlı olsun.
 */
export function buildUrunSluglari<U extends Pick<VitrinUrunMin, "id" | "urun_adi">>(
  urunler: readonly U[]
): Map<string, string> {
  const sonuc = new Map<string, string>();
  const kullanilan = new Set<string>();
  for (const urun of urunler) {
    const temel = slugifyTr(urun.urun_adi) || "urun";
    let slug = temel;
    let ek = 2;
    while (kullanilan.has(slug)) slug = `${temel}-${ek++}`;
    kullanilan.add(slug);
    sonuc.set(urun.id, slug);
  }
  return sonuc;
}

export function vitrinKlasorPath(shopSlug: string, klasorSlug: string, altSlug?: string | null): string {
  const base = `/${shopSlug}/kategori/${klasorSlug}`;
  return altSlug ? `${base}?alt=${encodeURIComponent(altSlug)}` : base;
}

export function vitrinUrunPath(shopSlug: string, urunSlug: string): string {
  return `/${shopSlug}/urun/${urunSlug}`;
}
