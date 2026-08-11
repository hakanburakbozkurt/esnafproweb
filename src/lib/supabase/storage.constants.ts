export const DUKKAN_STORAGE_BUCKET = "dukkan-gorselleri";

/** Storage içinde mağaza görselleri kök prefix'i */
export const STORE_ASSETS_PREFIX = "store-assets";

export const MAX_GALLERY_PHOTOS = 4;
export const MAX_PRODUCT_PHOTOS = 8;
export const MAX_PRODUCT_PHOTO_SLOTS = 3;

export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export const WHOLESALER_FEED_BUCKET = "toptanci-feedleri";

export const MAX_FEED_FILE_BYTES = 50 * 1024 * 1024; // 50 MB

export const ALLOWED_FEED_EXTENSIONS = [".xml", ".json", ".xlsx", ".xls", ".csv"] as const;

export const ALLOWED_FEED_MIME_TYPES = [
  "text/xml",
  "application/xml",
  "application/json",
  "text/json",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/csv",
  "application/csv",
  "application/octet-stream",
];
