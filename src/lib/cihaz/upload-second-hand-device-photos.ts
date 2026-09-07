"use client";

import { createClient } from "@/lib/supabase/client";
import {
  ALLOWED_IMAGE_TYPES,
  MAX_IMAGE_SIZE_BYTES,
} from "@/lib/supabase/storage.constants";
import { MAX_PHOTO_SLOTS } from "@/lib/cihaz/cihaz-photo-slots";

export const SECOND_HAND_DEVICES_BUCKET = "second-hand-devices";

function validateImageBlob(blob: Blob, fileName?: string): string | null {
  if (blob.size > MAX_IMAGE_SIZE_BYTES) {
    return "Dosya boyutu en fazla 5 MB olabilir.";
  }
  if (blob.type && !ALLOWED_IMAGE_TYPES.includes(blob.type)) {
    return "Yalnızca JPEG, PNG, WebP veya GIF yükleyebilirsiniz.";
  }
  if (!blob.type && fileName) {
    const ext = fileName.split(".").pop()?.toLowerCase();
    if (ext && !["jpg", "jpeg", "png", "webp", "gif"].includes(ext)) {
      return "Yalnızca JPEG, PNG, WebP veya GIF yükleyebilirsiniz.";
    }
  }
  return null;
}

async function uriToBlob(uri: string): Promise<Blob> {
  if (uri.startsWith("blob:") || uri.startsWith("data:")) {
    const res = await fetch(uri);
    return res.blob();
  }
  throw new Error("Geçersiz yerel görsel.");
}

async function uploadBlob(
  userId: string,
  blob: Blob,
  slotIndex: number
): Promise<string> {
  const supabase = createClient();
  const ext =
    blob.type === "image/png"
      ? "png"
      : blob.type === "image/webp"
        ? "webp"
        : blob.type === "image/gif"
          ? "gif"
          : "jpg";
  const path = `${userId}/${Date.now()}_${slotIndex}_${crypto.randomUUID().slice(0, 8)}.${ext}`;

  const { error } = await supabase.storage
    .from(SECOND_HAND_DEVICES_BUCKET)
    .upload(path, blob, {
      contentType: blob.type || "image/jpeg",
      upsert: false,
      cacheControl: "3600",
    });

  if (error) {
    throw new Error(error.message);
  }

  const { data } = supabase.storage
    .from(SECOND_HAND_DEVICES_BUCKET)
    .getPublicUrl(path);

  return data.publicUrl;
}

export async function uploadSecondHandDeviceFile(
  userId: string,
  file: File,
  slotIndex: number
): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  const validationError = validateImageBlob(file, file.name);
  if (validationError) {
    return { ok: false, error: validationError };
  }

  try {
    const url = await uploadBlob(userId, file, slotIndex);
    return { ok: true, url };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Görsel yüklenemedi.",
    };
  }
}

/** Slot sırasına göre (0..8): dolu olanları Storage'a yükler. Boş slotlar atlanır. */
export async function uploadSecondHandDevicePhotos(
  userId: string,
  photoUris: readonly string[]
): Promise<{ ok: true; imageUrls: string[] } | { ok: false; error: string }> {
  const imageUrls: string[] = [];
  const len = Math.min(photoUris.length, MAX_PHOTO_SLOTS);

  for (let i = 0; i < len; i++) {
    const raw = photoUris[i];
    const u = typeof raw === "string" ? raw.trim() : "";
    if (!u) continue;

    if (u.startsWith("http://") || u.startsWith("https://")) {
      imageUrls.push(u);
      continue;
    }

    try {
      const blob = await uriToBlob(u);
      const validationError = validateImageBlob(blob);
      if (validationError) {
        return { ok: false, error: validationError };
      }
      const url = await uploadBlob(userId, blob, i);
      imageUrls.push(url);
    } catch (err) {
      return {
        ok: false,
        error: err instanceof Error ? err.message : "Görsel yüklenemedi.",
      };
    }
  }

  return { ok: true, imageUrls };
}

/** Düzenleme: mevcut http URL'leri korur, yerel URI'ları yükler */
export async function resolveSecondHandPhotoUrls(
  userId: string,
  photoUris: readonly string[]
): Promise<{ ok: true; imageUrls: string[] } | { ok: false; error: string }> {
  const imageUrls: string[] = [];
  const len = Math.min(photoUris.length, MAX_PHOTO_SLOTS);

  for (let i = 0; i < len; i++) {
    const raw = photoUris[i];
    const u = typeof raw === "string" ? raw.trim() : "";
    if (!u) continue;

    if (u.startsWith("http://") || u.startsWith("https://")) {
      imageUrls.push(u);
      continue;
    }

    const single = await uploadSecondHandDevicePhotos(userId, [u]);
    if (!single.ok) return single;
    if (single.imageUrls[0]) imageUrls.push(single.imageUrls[0]);
  }

  return { ok: true, imageUrls };
}
