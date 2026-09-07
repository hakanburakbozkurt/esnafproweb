/** Cihaz Al — fotoğraf slot indeksleri */

export const PHOTO_LABELS = [
  "Cihaz Ön",
  "Cihaz Arka",
  "Ekran",
  "Kimlik Ön",
  "Kimlik Arka",
  "Fatura",
  "Hasar 1",
  "Hasar 2",
  "Diğer",
] as const;

/** Vitrin / sıfır ürün görselleri */
export const PRODUCT_PHOTO_INDICES = [0, 1, 2, 8] as const;

/** Kimlik & fatura — ikinci el belge kasası */
export const DOCUMENT_PHOTO_INDICES = [3, 4, 5] as const;

/** İkinci el ek görseller (hasar vb.) */
export const DAMAGE_PHOTO_INDICES = [6, 7] as const;

export const USED_MODE_PHOTO_INDICES = [
  ...PRODUCT_PHOTO_INDICES,
  ...DAMAGE_PHOTO_INDICES,
] as const;

export const MAX_PHOTO_SLOTS = 9;
