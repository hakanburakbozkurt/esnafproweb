/** Cihaz fotoğraf kuyruğu — sıralı dizi, ilk öğe kapak görseli. */

export const MAX_PHOTO_QUEUE = 10;

/** @deprecated Eski slot tabanlı upload limiti; kuyruk ile aynı. */
export const MAX_PHOTO_SLOTS = MAX_PHOTO_QUEUE;

export const ACCEPTED_PHOTO_TYPES =
  "image/jpeg,image/png,image/webp,image/gif" as const;

/** Boş girdileri atar, sırayı korur, üst sınır uygular. */
export function normalizePhotoQueue(photoUris: readonly string[]): string[] {
  return photoUris
    .map((u) => (typeof u === "string" ? u.trim() : ""))
    .filter(Boolean)
    .slice(0, MAX_PHOTO_QUEUE);
}

export function getPhotoQueueRemainingCapacity(
  photoUris: readonly string[]
): number {
  return Math.max(0, MAX_PHOTO_QUEUE - normalizePhotoQueue(photoUris).length);
}

/** Kuyruğun sonuna dosya ekler. */
export function appendFilesToPhotoQueue(
  photoUris: readonly string[],
  files: readonly File[]
): { next: string[]; assigned: number; skipped: number } {
  const current = normalizePhotoQueue(photoUris);
  const remaining = MAX_PHOTO_QUEUE - current.length;
  const limit = Math.min(files.length, remaining);
  const next = [...current];

  for (let i = 0; i < limit; i++) {
    next.push(URL.createObjectURL(files[i]));
  }

  return {
    next,
    assigned: limit,
    skipped: Math.max(0, files.length - limit),
  };
}

export function removePhotoAtIndex(
  photoUris: readonly string[],
  index: number
): string[] {
  const current = normalizePhotoQueue(photoUris);
  const uri = current[index];
  if (uri?.startsWith("blob:")) {
    URL.revokeObjectURL(uri);
  }
  return current.filter((_, i) => i !== index);
}

export function movePhotoInQueue(
  photoUris: readonly string[],
  fromIndex: number,
  toIndex: number
): string[] {
  const current = normalizePhotoQueue(photoUris);
  if (
    fromIndex < 0 ||
    toIndex < 0 ||
    fromIndex >= current.length ||
    toIndex >= current.length ||
    fromIndex === toIndex
  ) {
    return current;
  }

  const next = [...current];
  const [item] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, item);
  return next;
}

/** Seçilen fotoğrafı kapak (index 0) yapar. */
export function setCoverPhotoIndex(
  photoUris: readonly string[],
  index: number
): string[] {
  return movePhotoInQueue(photoUris, index, 0);
}

export function revokeBlobPhotoUrls(photoUris: readonly string[]) {
  for (const uri of photoUris) {
    if (uri?.startsWith("blob:")) {
      URL.revokeObjectURL(uri);
    }
  }
}
