/** Cihaz formu seçenekleri: veritabanı kaydı yoksa sabit listeler kullanılır. */

export const SECENEK_KATEGORILERI = ["telefon", "tablet", "bilgisayar"] as const;
export const SECENEK_TURLERI = ["renk", "kapasite", "model"] as const;

export type SecenekKategori = (typeof SECENEK_KATEGORILERI)[number];
export type SecenekTuru = (typeof SECENEK_TURLERI)[number];

export const SECENEK_KATEGORI_ETIKETLERI: Record<SecenekKategori, string> = {
  telefon: "Telefon",
  tablet: "Tablet",
  bilgisayar: "Bilgisayar",
};

export const SECENEK_TUR_ETIKETLERI: Record<SecenekTuru, string> = {
  renk: "Renk",
  kapasite: "Kapasite",
  model: "Model",
};

export type CihazSecenekRow = {
  id: string;
  kategori: SecenekKategori;
  tur: SecenekTuru;
  deger: string;
  sira: number;
};

export type CihazSecenekMap = Record<string, string[]>;

export function secenekAnahtari(kategori: SecenekKategori, tur: SecenekTuru): string {
  return `${kategori}:${tur}`;
}

export function secenekSatirlariniHaritayaCevir(rows: CihazSecenekRow[]): CihazSecenekMap {
  const map: CihazSecenekMap = {};
  const sirali = [...rows].sort((a, b) => a.sira - b.sira || a.deger.localeCompare(b.deger, "tr"));

  for (const row of sirali) {
    const anahtar = secenekAnahtari(row.kategori, row.tur);
    if (!map[anahtar]) map[anahtar] = [];
    map[anahtar].push(row.deger);
  }

  return map;
}

/** Veritabanında o alan için kayıt varsa onu, yoksa sabit listeyi döndürür. */
export function secenekListesi(
  map: CihazSecenekMap | null | undefined,
  kategori: SecenekKategori,
  tur: SecenekTuru,
  yedek: readonly string[]
): readonly string[] {
  const liste = map?.[secenekAnahtari(kategori, tur)];
  return liste && liste.length > 0 ? liste : yedek;
}
