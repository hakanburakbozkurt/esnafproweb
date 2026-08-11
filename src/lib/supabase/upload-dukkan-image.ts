"use client";

import { isWholesalerAccount, wholesalerStoreAccessError } from "@/lib/auth/wholesaler";
import { createClient } from "@/lib/supabase/client";
import {
  ALLOWED_IMAGE_TYPES,
  DUKKAN_STORAGE_BUCKET,
  MAX_IMAGE_SIZE_BYTES,
  STORE_ASSETS_PREFIX,
} from "@/lib/supabase/storage.constants";
import { isValidSlugFormat, sanitizeSlugInput } from "@/lib/utils/slug";

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

function normalizeStoreSlug(storeSlug: string): string | null {
  const normalized = sanitizeSlugInput(storeSlug.trim());
  if (!normalized || !isValidSlugFormat(normalized)) {
    return null;
  }
  return normalized;
}

/** store-assets/{slug}/{subfolder}/{fileName} */
export function buildStoreAssetStoragePath(
  storeSlug: string,
  subfolder: string,
  fileName: string
): string {
  const slug = normalizeStoreSlug(storeSlug);
  if (!slug) {
    throw new Error("Geçersiz mağaza slug'ı.");
  }

  const folder = subfolder.trim().replace(/^\/+|\/+$/g, "");
  if (!folder) {
    throw new Error("Geçersiz alt klasör.");
  }

  return `${STORE_ASSETS_PREFIX}/${slug}/${folder}/${fileName}`;
}

export async function uploadDukkanImage(
  file: File,
  storeSlug: string,
  subfolder: string
): Promise<UploadResult> {
  const validationError = validateImageFile(file);
  if (validationError) {
    return { error: validationError };
  }

  const slug = normalizeStoreSlug(storeSlug);
  if (!slug) {
    return {
      error:
        "Görsel yüklemek için geçerli bir mağaza slug'ı girin (ör. beepmobilestore).",
    };
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

  let path: string;
  try {
    path = buildStoreAssetStoragePath(slug, subfolder, fileName);
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : "Dosya yolu oluşturulamadı.",
    };
  }

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
