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

export const ACCEPTED_PHOTO_TYPES =
  "image/jpeg,image/png,image/webp,image/gif" as const;

export function getVisiblePhotoIndices(
  listingType: "new" | "used"
): readonly number[] {
  return listingType === "new" ? PRODUCT_PHOTO_INDICES : USED_MODE_PHOTO_INDICES;
}

export function getEmptyVisibleSlotIndices(
  photoUris: readonly string[],
  visibleIndices: readonly number[]
): number[] {
  return visibleIndices.filter((index) => !photoUris[index]?.trim());
}

/** Dosyaları boş slotlara sırayla yerleştirir; en fazla visible boş slot kadar. */
export function fillPhotoSlotsFromFiles(
  photoUris: readonly string[],
  visibleIndices: readonly number[],
  files: readonly File[],
  options?: { startAtIndex?: number }
): { next: string[]; assigned: number; skipped: number } {
  const next = [...photoUris];
  while (next.length < MAX_PHOTO_SLOTS) next.push("");

  let emptySlots = getEmptyVisibleSlotIndices(next, visibleIndices);
  const startAt = options?.startAtIndex;

  if (startAt !== undefined && emptySlots.includes(startAt)) {
    emptySlots = [startAt, ...emptySlots.filter((i) => i !== startAt)];
  }

  const limit = Math.min(files.length, emptySlots.length);
  let assigned = 0;

  for (let i = 0; i < limit; i++) {
    next[emptySlots[i]] = URL.createObjectURL(files[i]);
    assigned += 1;
  }

  return {
    next,
    assigned,
    skipped: Math.max(0, files.length - assigned),
  };
}

export function clearPhotoSlot(
  photoUris: readonly string[],
  index: number
): string[] {
  const next = [...photoUris];
  while (next.length < MAX_PHOTO_SLOTS) next.push("");

  const existing = next[index]?.trim();
  if (existing?.startsWith("blob:")) {
    URL.revokeObjectURL(existing);
  }

  next[index] = "";
  return next;
}

export function revokeBlobPhotoUrls(photoUris: readonly string[]) {
  for (const uri of photoUris) {
    if (uri?.startsWith("blob:")) {
      URL.revokeObjectURL(uri);
    }
  }
}
