/**
 * Vitrinde ürün formunda hazır olarak sunulan ana kategoriler.
 * Sıra, formdaki açılır listedeki sıradır.
 */
export const VITRIN_KATEGORILERI = [
  "Cam - Ekran Koruyucu",
  "Kılıf",
  "Lens Koruma",
  "AirPods Kılıfı",
  "Dönüştürücü",
  "Şarj Grubu",
  "Ses & Kulaklık",
  "Tablet",
  "Watch Grubu",
  "Aksesuar",
] as const;

/**
 * Ürün formunda cihaz seçenekleri. "(cihaz)" ekı yalnızca bu açılır listede görünür;
 * vitrinde bu ürünler cihaz klasörlerine (Telefonlar, Tabletler…) gider.
 */
export const VITRIN_CIHAZ_KATEGORILERI = [
  "Telefon (cihaz)",
  "Tablet (cihaz)",
  "Bilgisayar (cihaz)",
  "Akıllı Saat (cihaz)",
  "Konsol (cihaz)",
] as const;

/** Her ana kategorinin alt kategorileri (veritabanındaki `categories` ağacından). */
export const VITRIN_ALT_KATEGORILERI: Readonly<Record<string, readonly string[]>> = {
  "Cam - Ekran Koruyucu": ["360 Tam Kaplama", "9H Temperli Cam", "Nano Ekran Koruyucu", "Seramik Cam", "Standart Cam"],
  Kılıf: ["Deri Kılıf", "Lansman Kılıf", "Mika Kılıf", "Şeffaf Kılıf", "Silikon Kılıf", "Taşlı Kılıf", "Zırhlı Kılıf"],
  "Lens Koruma": [
    "Bütünleşik Kamera Koruyucu",
    "Safir / Metal Kamera Koruyucu",
    "Standart Kamera Koruyucu",
    "Taşlı / Simli Kamera Koruyucu",
  ],
  "AirPods Kılıfı": [
    "AirPods 1-2. Nesil",
    "AirPods 3. Nesil",
    "AirPods 4. Nesil / ANC",
    "AirPods Max",
    "AirPods Pro",
    "AirPods Pro 2",
    "AirPods Pro 3",
  ],
  Dönüştürücü: [
    "Çok Fonksiyonlu Hublar",
    "Ethernet & Network",
    "Görüntü Dönüştürücüler",
    "Kart Okuyucular",
    "OTG & Veri Aktarım",
    "Ses Dönüştürücü & Aux",
  ],
  "Şarj Grubu": ["Araç Şarjı", "Powerbank", "Şarj Adaptörü", "Şarj Kabloları"],
  "Ses & Kulaklık": ["Bluetooth Kulaklık", "Kablolu Kulaklık", "Kablosuz Hoparlör"],
  Tablet: ["Tablet Ekran Koruma", "Tablet Kılıfı"],
  "Watch Grubu": ["Watch Aksesuar", "Watch Kordon", "Watch Koruma"],
  Aksesuar: ["Araç İçi Aksesuarlar", "Askı & Çanta Aks.", "Fotoğraf & Yayıncı", "Masaüstü Aksesuarlar", "Temizlik & Bakım"],
};

/** Ana ve alt kategoriyi tek bir değerde birleştiren ayraç. */
export const KATEGORI_AYRACI = " › ";

export function birlestirKategori(ana: string, alt?: string | null): string {
  const anaTemiz = ana.trim();
  const altTemiz = alt?.trim();
  return altTemiz ? `${anaTemiz}${KATEGORI_AYRACI}${altTemiz}` : anaTemiz;
}

/** "Kılıf › Silikon Kılıf" → { ana: "Kılıf", alt: "Silikon Kılıf" }. Alt yoksa alt null. */
export function ayirKategori(deger: string | null | undefined): { ana: string; alt: string | null } {
  const metin = (deger ?? "").trim();
  const index = metin.indexOf(KATEGORI_AYRACI);
  if (index === -1) return { ana: metin, alt: null };
  const ana = metin.slice(0, index).trim();
  const alt = metin.slice(index + KATEGORI_AYRACI.length).trim();
  return { ana, alt: alt || null };
}

/** Hazır kategoriler önce (verilen sırayla), ardından mevcut özel kategoriler (A-Z). */
export function mergeVitrinKategorileri(mevcut: readonly string[]): string[] {
  const hazir: string[] = [...VITRIN_KATEGORILERI, ...VITRIN_CIHAZ_KATEGORILERI];
  const ozel = mevcut
    .filter((kategori) => !hazir.includes(kategori))
    .sort((a, b) => a.localeCompare(b, "tr"));
  return [...hazir, ...ozel];
}
