"use client";

import imageCompression from "browser-image-compression";

const MAX_CIHAZ_IMAGE_MB = 1.2;
const MAX_CIHAZ_IMAGE_DIMENSION = 1920;
const CIHAZ_IMAGE_QUALITY = 0.82;

export async function compressCihazImage(file: File): Promise<File> {
  if (!file.type.startsWith("image/")) {
    return file;
  }

  if (file.type === "image/gif") {
    return file;
  }

  try {
    const preferJpeg = file.type === "image/jpeg" || file.type === "image/jpg";
    const compressed = await imageCompression(file, {
      maxSizeMB: MAX_CIHAZ_IMAGE_MB,
      maxWidthOrHeight: MAX_CIHAZ_IMAGE_DIMENSION,
      useWebWorker: true,
      initialQuality: CIHAZ_IMAGE_QUALITY,
      fileType: preferJpeg ? "image/jpeg" : "image/webp",
    });

    const baseName = file.name.replace(/\.[^.]+$/, "") || "cihaz";
    const extension =
      compressed.type === "image/png"
        ? "png"
        : compressed.type === "image/jpeg"
          ? "jpg"
          : "webp";

    return new File([compressed], `${baseName}.${extension}`, {
      type: compressed.type,
      lastModified: Date.now(),
    });
  } catch {
    return file;
  }
}

export async function compressCihazImages(files: File[]): Promise<File[]> {
  const results: File[] = [];

  for (const file of files) {
    results.push(await compressCihazImage(file));
  }

  return results;
}
