/**
 * Vitrinde ürün formunda hazır olarak sunulan kategoriler.
 * Sıra, formdaki açılır listedeki sıradır. Ürünün kategori metni bu adlarla
 * birebir eşleşir ve vitrin bu değere göre gruplanır.
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

/** Hazır kategoriler önce (verilen sırayla), ardından mevcut özel kategoriler (A-Z). */
export function mergeVitrinKategorileri(mevcut: readonly string[]): string[] {
  const hazir: string[] = [...VITRIN_KATEGORILERI];
  const ozel = mevcut
    .filter((kategori) => !hazir.includes(kategori))
    .sort((a, b) => a.localeCompare(b, "tr"));
  return [...hazir, ...ozel];
}
