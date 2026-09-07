/** Telefon, tablet ve bilgisayar marka / seçenek listeleri */

import {
  hasWarrantyFromType,
  warrantyTypeFromDb,
} from "@/lib/cihaz/cihaz-warranty";

export const PHONE_BRANDS = [
  "Apple",
  "General Mobile",
  "Huawei",
  "Infinix",
  "Samsung",
  "Vivo",
  "Xiaomi",
  "Tecno",
  "Reeder",
  "Realme",
  "Oppo",
  "Honor",
  "Diğer",
] as const;

export const PHONE_STORAGE_OPTIONS = [
  "8 GB",
  "16 GB",
  "32 GB",
  "64 GB",
  "128 GB",
  "256 GB",
  "512 GB",
  "1 TB",
] as const;

export const APPLE_IPHONE_MODELS = [
  "iPhone 7",
  "iPhone 7 Plus",
  "iPhone 8",
  "iPhone 8 Plus",
  "iPhone X",
  "iPhone XR",
  "iPhone XS",
  "iPhone XS Max",
  "iPhone 11",
  "iPhone 11 Pro",
  "iPhone 11 Pro Max",
  "iPhone 12",
  "iPhone 12 mini",
  "iPhone 12 Pro",
  "iPhone 12 Pro Max",
  "iPhone 13",
  "iPhone 13 mini",
  "iPhone 13 Pro",
  "iPhone 13 Pro Max",
  "iPhone 14",
  "iPhone 14 Plus",
  "iPhone 14 Pro",
  "iPhone 14 Pro Max",
  "iPhone 15",
  "iPhone 15 Plus",
  "iPhone 15 Pro",
  "iPhone 15 Pro Max",
  "iPhone 16",
  "iPhone 16 Plus",
  "iPhone 16 Pro",
  "iPhone 16 Pro Max",
  "iPhone 16e",
  "iPhone 17",
  "iPhone 17 Air",
  "iPhone 17 Pro",
  "iPhone 17 Pro Max",
] as const;

export const TABLET_BRANDS = [
  "Apple",
  "Asus",
  "Casper",
  "General Mobile",
  "Hometech",
  "Honor",
  "Huawei",
  "Lenovo",
  "Reeder",
  "Samsung",
  "TCL",
  "Xiaomi",
] as const;

export const APPLE_IPAD_MODELS = [
  "iPad Air 1",
  "iPad Air 2",
  "iPad Air 3",
  "iPad Air 4",
  "iPad Air 5",
  "iPad Air 6",
  "iPad Air 7",
  "iPad mini 1",
  "iPad mini 2",
  "iPad mini 3",
  "iPad mini 4",
  "iPad mini 5",
  "iPad mini 6",
  "iPad mini 7",
  "iPad 1",
  "iPad 2",
  "iPad 3",
  "iPad 4",
  "iPad 5",
  "iPad 6",
  "iPad 7",
  "iPad 8",
  "iPad 9",
  "iPad 10",
  "iPad 11",
  "iPad Pro 1",
  "iPad Pro 2",
  "iPad Pro 3",
  "iPad Pro 4",
  "iPad Pro 5",
  "iPad Pro 6",
  "iPad Pro 7",
  "iPad Pro 8",
] as const;

export const TABLET_STORAGE_OPTIONS = [
  "1 GB",
  "2 GB",
  "4 GB",
  "8 GB",
  "12 GB",
  "16 GB",
  "20 GB",
  "32 GB",
  "34 GB",
  "40 GB",
  "60 GB",
  "62 GB",
  "64 GB",
  "80 GB",
  "100 GB",
  "128 GB",
  "160 GB",
  "256 GB",
  "320 GB",
  "500 GB",
  "512 GB",
  "1 TB",
] as const;

export const PC_BRANDS = [
  "Acer",
  "Apple Macbook",
  "Asus",
  "Casper",
  "Crea",
  "Dell",
  "Honor",
  "HP",
  "Huawei",
  "IBM",
  "Lenovo",
  "LG",
  "Monster",
  "MSI",
  "Packard Bell",
  "Razer",
  "Samsung",
  "Sony",
  "Toshiba",
  "Vestel",
  "Xiaomi",
  "Diğer",
] as const;

export const APPLE_MAC_MODELS = [
  "Macbook",
  "Macbook Air",
  "MacBook Neo",
  "Macbook Pro",
] as const;

export const PC_RAM_OPTIONS = [
  "2 GB",
  "3 GB",
  "4 GB",
  "6 GB",
  "8 GB",
  "10 GB",
  "12 GB",
  "16 GB",
  "18 GB",
  "24 GB",
  "32 GB",
  "36 GB",
  "48 GB",
  "64 GB",
  "96 GB",
  "128 GB",
] as const;

export const PC_DISK_OPTIONS = [
  "Yok",
  "20 GB ve altı",
  "30 GB",
  "40 GB",
  "60 GB",
  "64 GB",
  "80 GB",
  "100 GB",
  "120 GB",
  "128 GB",
  "160 GB",
  "200 GB",
  "250 GB",
  "256 GB",
  "320 GB",
  "400 GB",
  "500 GB",
  "512 GB",
  "640 GB",
  "750 GB",
  "1 TB",
  "2 TB",
  "3 TB ve Üstü",
] as const;

export const PC_GPU_OPTIONS = [
  "Paylaşımlı",
  "64 MB ve altı",
  "128 MB",
  "256 MB",
  "358 MB",
  "512 MB",
  "768 MB",
  "1 GB",
  "1.5 GB",
  "2 GB",
  "3 GB",
  "4 GB",
  "6 GB",
  "8 GB",
  "12 GB",
  "16 GB",
  "18 GB",
  "24 GB",
  "30 GB",
  "38 GB",
  "40 GB",
  "Diğer",
] as const;

export const PC_SCREEN_OPTIONS = [
  "7 inç",
  "8,9 inç",
  "10 inç",
  "10,1 inç",
  "10,2 inç",
  "10,6 inç",
  "11 inç",
  "11,1 inç",
  "11,6 inç",
  "12 inç",
  "12,1 inç",
  "12,5 inç",
  "13 inç",
  "13,2 inç",
  "13,3 inç",
  "13,6 inç",
  "13,8 inç",
  "14 inç",
  "14,1 inç",
  "15 inç",
  "15,3 inç",
  "15,4 inç",
  "15,6 inç",
  "16 inç",
  "16,1 inç",
  "16,2 inç",
  "16.4 inç",
  "17 inç",
  "17.3 inç",
  "18 inç",
  "18,4 inç",
  "20,1 inç",
  "24 inç",
  "Diğer",
] as const;

export const PC_RESOLUTION_OPTIONS = [
  "1280x720 (HD)",
  "1366x768 (HD)",
  "1280x800 (HD+)",
  "1440x900 (HD+)",
  "1600x900 (HD+)",
  "1920x1080 (FHD)",
  "1920x1200 (FHD+)",
  "1920x1280 (FHD+)",
  "2560x1440 (QHD)",
  "2048x1536 (QHD+)",
  "2160x1440 (QHD+)",
  "2240x1400 (QHD+)",
  "2304x1536 (QHD+)",
  "2340x1440 (QHD+)",
  "2408x1506 (QHD+)",
  "2560x1600 (QHD+)",
  "2880x1800 (QHD+)",
  "3024x1964 (QHD+)",
  "3072x1620 (QHD+)",
  "3200x1800 (QHD+)",
  "3456x2234 (QHD+)",
  "3840x2160 (UHD)",
  "3840x2400 (UHD)",
  "Diğer",
] as const;

export const PC_COLOR_OPTIONS = [
  "Uzay Grisi",
  "Gümüş",
  "Gece Yarısı",
  "Yıldız Işığı",
  "Siyah",
  "Beyaz",
  "Gri",
  "Metalik",
  "Diğer",
] as const;

export const PHONE_COLOR_OPTIONS = [
  "Siyah",
  "Beyaz",
  "Gri",
  "Gümüş",
  "Altın",
  "Mavi",
  "Yeşil",
  "Kırmızı",
  "Mor",
  "Pembe",
  "Turuncu",
  "Sarı",
  "Diğer",
] as const;

export const TABLET_COLOR_OPTIONS = PHONE_COLOR_OPTIONS;

export const KONDISYON_OPTIONS = ["Mükemmel", "İyi", "Normal", "Kötü"] as const;

export type PaymentMethod = "Nakit" | "Kart" | "Takas";

export const PAYMENT_METHOD_OPTIONS: PaymentMethod[] = [
  "Nakit",
  "Kart",
  "Takas",
];

export type ListingType = "new" | "used";

export type DeviceCategory =
  | "phone"
  | "computer"
  | "watch"
  | "tablet"
  | "console";

export const DEVICE_CATEGORY_META: Record<
  DeviceCategory,
  { label: string; icon: string }
> = {
  phone: { label: "Telefon", icon: "phone" },
  computer: { label: "Bilgisayar", icon: "laptop" },
  watch: { label: "Saat", icon: "watch" },
  tablet: { label: "Tablet", icon: "tablet" },
  console: { label: "Konsol", icon: "gamepad" },
};

export const LISTING_TYPE_LABEL: Record<ListingType, string> = {
  used: "İkinci El",
  new: "Sıfır",
};

export type SecondHandDeviceInsert = {
  user_id: string;
  brand: string;
  model: string;
  capacity: string | null;
  color: string | null;
  serial_no: string | null;
  imei: string | null;
  condition: string;
  listing_type: ListingType;
  device_category: DeviceCategory;
  battery_health: string | null;
  battery_cycle_count: string | null;
  changed_parts: string | null;
  non_working_features: string | null;
  purchase_price: number;
  sale_price: number;
  payment_method: PaymentMethod;
  swap_device_name: string | null;
  seller_name: string | null;
  seller_tc: string | null;
  seller_phone: string | null;
  buyer_name: string | null;
  buyer_tc: string | null;
  buyer_phone: string | null;
  seller_signature: string | null;
  buyer_signature: string | null;
  icloud_signed_out: boolean;
  notes: string | null;
  image_urls: string[];
  status: "available";
  processor: string | null;
  ram: string | null;
  hdd: string | null;
  ssd: string | null;
  gpu: string | null;
  screen_size: string | null;
  resolution: string | null;
  has_warranty: boolean;
  warranty_type: string | null;
  sim_support: boolean;
  operating_system: string | null;
  case_material: string | null;
  has_sapphire_glass: boolean;
  casing_type: string | null;
  drive_type: string | null;
  has_box: boolean;
  has_invoice: boolean;
};

export type IkinciElCihaz = {
  id: string;
  user_id: string;
  brand: string;
  model: string;
  imei: string | null;
  condition: string;
  purchase_price: number;
  sale_price: number;
  status: "available" | "sold";
  notes: string | null;
  created_at: string;
  capacity: string | null;
  color: string | null;
  serial_no: string | null;
  battery_health: string | null;
  battery_cycle_count: string | null;
  changed_parts: string | null;
  non_working_features: string | null;
  seller_name: string | null;
  seller_tc: string | null;
  seller_phone: string | null;
  buyer_name: string | null;
  buyer_tc: string | null;
  buyer_phone: string | null;
  payment_method: PaymentMethod;
  icloud_signed_out: boolean;
  swap_device_name: string | null;
  image_urls?: string[] | null;
  listing_type?: ListingType;
  device_category?: DeviceCategory;
  processor?: string | null;
  ram?: string | null;
  hdd?: string | null;
  ssd?: string | null;
  gpu?: string | null;
  screen_size?: string | null;
  resolution?: string | null;
  has_warranty?: boolean;
  warranty_type?: string | null;
  sim_support?: boolean;
  operating_system?: string | null;
  case_material?: string | null;
  has_sapphire_glass?: boolean;
  casing_type?: string | null;
  drive_type?: string | null;
  has_box?: boolean;
  has_invoice?: boolean;
  web_published: boolean;
  web_title?: string | null;
  web_description?: string | null;
  web_slug?: string | null;
};

export type WebPublishingPatch = {
  web_published: boolean;
  web_title?: string | null;
  web_description?: string | null;
};

export function isListingType(v: unknown): v is ListingType {
  return v === "new" || v === "used";
}

export function isDeviceCategory(v: unknown): v is DeviceCategory {
  return (
    v === "phone" ||
    v === "computer" ||
    v === "watch" ||
    v === "tablet" ||
    v === "console"
  );
}

export function mapDeviceRowFromDb(row: IkinciElCihaz): IkinciElCihaz {
  const r = row as Record<string, unknown>;
  const wt = warrantyTypeFromDb({
    warranty_type: typeof r.warranty_type === "string" ? r.warranty_type : null,
    has_warranty: typeof r.has_warranty === "boolean" ? r.has_warranty : null,
  });
  return {
    ...row,
    listing_type: isListingType(r.listing_type) ? r.listing_type : "used",
    device_category: isDeviceCategory(r.device_category)
      ? r.device_category
      : "phone",
    warranty_type: wt,
    has_warranty: hasWarrantyFromType(wt),
    sim_support:
      typeof r.sim_support === "boolean" ? r.sim_support : undefined,
    operating_system:
      typeof r.operating_system === "string" ? r.operating_system : null,
    case_material:
      typeof r.case_material === "string" ? r.case_material : null,
    has_sapphire_glass:
      typeof r.has_sapphire_glass === "boolean"
        ? r.has_sapphire_glass
        : undefined,
    casing_type:
      typeof r.casing_type === "string" ? r.casing_type : null,
    drive_type: typeof r.drive_type === "string" ? r.drive_type : null,
    has_box: typeof r.has_box === "boolean" ? r.has_box : false,
    has_invoice: typeof r.has_invoice === "boolean" ? r.has_invoice : false,
    web_published:
      typeof r.web_published === "boolean" ? r.web_published : false,
    web_title: typeof r.web_title === "string" ? r.web_title : null,
    web_description:
      typeof r.web_description === "string" ? r.web_description : null,
    web_slug: typeof r.web_slug === "string" ? r.web_slug : null,
  };
}
