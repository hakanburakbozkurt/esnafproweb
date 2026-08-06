import {
  ALLOWED_FEED_EXTENSIONS,
  ALLOWED_FEED_MIME_TYPES,
  MAX_FEED_FILE_BYTES,
} from "@/lib/supabase/storage.constants";

function getFileExtension(fileName: string): string {
  const ext = fileName.split(".").pop()?.toLowerCase();
  return ext ? `.${ext}` : "";
}

export function validateWholesalerFeedFile(file: File): string | null {
  const extension = getFileExtension(file.name);
  const extensionAllowed = ALLOWED_FEED_EXTENSIONS.some((allowed) => allowed === extension);

  if (!extensionAllowed && !ALLOWED_FEED_MIME_TYPES.includes(file.type)) {
    return "Yalnızca XML, JSON, Excel (.xlsx, .xls) veya CSV dosyası yükleyebilirsiniz.";
  }

  if (file.size > MAX_FEED_FILE_BYTES) {
    return "Dosya boyutu en fazla 50 MB olabilir.";
  }

  if (file.size === 0) {
    return "Boş dosya yüklenemez.";
  }

  return null;
}
