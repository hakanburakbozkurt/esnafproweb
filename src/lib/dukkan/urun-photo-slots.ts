import { URUN_PHOTO_KEYS } from "@/lib/dukkan/urun-photos";

/** Ürün başına fotoğraf sınırı (teknik servisin MAX_PRODUCT_PHOTO_SLOTS sabitinden bağımsız) */
export const MAX_URUN_PHOTO_SLOTS = URUN_PHOTO_KEYS.length;

type UrunPhotoKey = (typeof URUN_PHOTO_KEYS)[number];
type UrunPhotoFormFields = Record<UrunPhotoKey, string>;

/** Dolu fotoğrafları sırayla döner; ilk eleman kapaktır. */
export function getUrunPhotoList(item: UrunPhotoFormFields): string[] {
  return URUN_PHOTO_KEYS.map((key) => item[key].trim()).filter(Boolean);
}

/** Listeyi boşluksuz olarak fotograf_url … fotograf_url_8 alanlarına yazar. */
export function setUrunPhotoList<T extends UrunPhotoFormFields>(item: T, urls: string[]): T {
  const next = { ...item };
  URUN_PHOTO_KEYS.forEach((key, index) => {
    next[key] = (urls[index] ?? "") as T[UrunPhotoKey];
  });
  return next;
}
