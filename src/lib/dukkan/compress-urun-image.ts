"use client";

import imageCompression from "browser-image-compression";
import { logDukkanAction } from "@/lib/dukkan/logger";

const MAX_URUN_IMAGE_MB = 1;
const MAX_URUN_IMAGE_DIMENSION = 1600;
const URUN_IMAGE_QUALITY = 0.82;

/**
 * Ürün fotoğrafını yüklemeden önce küçültür. Sıkıştırma başarısız olursa
 * orijinal dosya döner; boyut sınırını yükleme fonksiyonu ayrıca denetler.
 */
export async function compressUrunImage(
  file: File,
  onProgress?: (percent: number) => void
): Promise<File> {
  if (!file.type.startsWith("image/") || file.type === "image/gif") {
    onProgress?.(100);
    return file;
  }

  try {
    const preferJpeg = file.type === "image/jpeg" || file.type === "image/jpg";
    const compressed = await imageCompression(file, {
      maxSizeMB: MAX_URUN_IMAGE_MB,
      maxWidthOrHeight: MAX_URUN_IMAGE_DIMENSION,
      useWebWorker: true,
      initialQuality: URUN_IMAGE_QUALITY,
      fileType: preferJpeg ? "image/jpeg" : "image/webp",
      onProgress,
    });

    const baseName = file.name.replace(/\.[^.]+$/, "") || "urun";
    const extension = compressed.type === "image/jpeg" ? "jpg" : "webp";

    return new File([compressed], `${baseName}.${extension}`, {
      type: compressed.type,
      lastModified: Date.now(),
    });
  } catch (err) {
    logDukkanAction("compressUrunImage", "compression failed, using original", {
      err,
      name: file.name,
      size: file.size,
      type: file.type,
    });
    onProgress?.(100);
    return file;
  }
}
