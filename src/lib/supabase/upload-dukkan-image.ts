"use client";

import { isWholesalerAccount, wholesalerStoreAccessError } from "@/lib/auth/wholesaler";
import { createClient } from "@/lib/supabase/client";
import {
  ALLOWED_IMAGE_TYPES,
  DUKKAN_STORAGE_BUCKET,
  MAX_IMAGE_SIZE_BYTES,
} from "@/lib/supabase/storage.constants";

export type UploadResult = { url: string } | { error: string };

function getFileExtension(file: File) {
  const fromName = file.name.split(".").pop()?.toLowerCase();
  if (fromName && ["jpg", "jpeg", "png", "webp", "gif"].includes(fromName)) {
    return fromName === "jpeg" ? "jpg" : fromName;
  }

  const mimeMap: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
  };

  return mimeMap[file.type] ?? "jpg";
}

export function validateImageFile(file: File): string | null {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return "Yalnızca JPEG, PNG, WebP veya GIF yükleyebilirsiniz.";
  }
  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return "Dosya boyutu en fazla 5 MB olabilir.";
  }
  return null;
}

export async function uploadDukkanImage(
  file: File,
  subfolder: string
): Promise<UploadResult> {
  const validationError = validateImageFile(file);
  if (validationError) {
    return { error: validationError };
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Görsel yüklemek için giriş yapmalısınız." };
  }

  if (await isWholesalerAccount(supabase, user)) {
    return { error: wholesalerStoreAccessError() };
  }

  const ext = getFileExtension(file);
  const fileName = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`;
  const path = `${user.id}/${subfolder}/${fileName}`;

  const { error } = await supabase.storage
    .from(DUKKAN_STORAGE_BUCKET)
    .upload(path, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type,
    });

  if (error) {
    return { error: error.message };
  }

  const { data } = supabase.storage
    .from(DUKKAN_STORAGE_BUCKET)
    .getPublicUrl(path);

  return { url: data.publicUrl };
}
