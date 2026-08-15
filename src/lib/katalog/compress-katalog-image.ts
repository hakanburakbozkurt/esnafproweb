"use client";

import imageCompression from "browser-image-compression";

const MAX_KATALOG_IMAGE_MB = 1;
const MAX_KATALOG_IMAGE_DIMENSION = 1920;

export async function compressKatalogImage(file: File): Promise<File> {
  if (!file.type.startsWith("image/")) {
    return file;
  }

  if (file.type === "image/gif") {
    return file;
  }

  try {
    const compressed = await imageCompression(file, {
      maxSizeMB: MAX_KATALOG_IMAGE_MB,
      maxWidthOrHeight: MAX_KATALOG_IMAGE_DIMENSION,
      useWebWorker: true,
      initialQuality: 0.82,
      fileType: file.type === "image/png" ? "image/png" : "image/webp",
    });

    const baseName = file.name.replace(/\.[^.]+$/, "") || "katalog";
    const extension = compressed.type === "image/png" ? "png" : "webp";

    return new File([compressed], `${baseName}.${extension}`, {
      type: compressed.type,
      lastModified: Date.now(),
    });
  } catch {
    return file;
  }
}

export async function compressKatalogImages(files: File[]): Promise<File[]> {
  const results: File[] = [];

  for (const file of files) {
    results.push(await compressKatalogImage(file));
  }

  return results;
}
