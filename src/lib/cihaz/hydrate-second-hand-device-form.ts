import type {
  ConsoleCategoryForm,
  ComputerCategoryForm,
  PhoneCategoryForm,
  SharedCihazForm,
  TabletCategoryForm,
  WatchCategoryForm,
} from "@/lib/cihaz/use-cihaz-al-category-forms";
import {
  DEFAULT_CONSOLE_FORM,
  DEFAULT_COMPUTER_FORM,
  DEFAULT_PHONE_FORM,
  DEFAULT_SHARED_FORM,
  DEFAULT_TABLET_FORM,
  DEFAULT_WATCH_FORM,
} from "@/lib/cihaz/use-cihaz-al-category-forms";
import type {
  DeviceCategory,
  ListingType,
  PaymentMethod,
} from "@/lib/cihaz/types";
import { warrantyTypeFromDb } from "@/lib/cihaz/cihaz-warranty";

export type DeviceRowForHydrate = {
  brand: string;
  model: string;
  device_category?: DeviceCategory;
  listing_type?: ListingType;
  purchase_price: number;
  sale_price: number;
  payment_method?: PaymentMethod;
  swap_device_name?: string | null;
  seller_name?: string | null;
  seller_tc?: string | null;
  seller_phone?: string | null;
  buyer_name?: string | null;
  buyer_tc?: string | null;
  buyer_phone?: string | null;
  icloud_signed_out?: boolean;
  notes?: string | null;
  image_urls?: string[] | null;
  capacity?: string | null;
  color?: string | null;
  serial_no?: string | null;
  imei?: string | null;
  condition?: string;
  battery_health?: string | null;
  battery_cycle_count?: string | null;
  changed_parts?: string | null;
  non_working_features?: string | null;
  processor?: string | null;
  ram?: string | null;
  hdd?: string | null;
  ssd?: string | null;
  gpu?: string | null;
  screen_size?: string | null;
  resolution?: string | null;
  sim_support?: boolean;
  operating_system?: string | null;
  case_material?: string | null;
  has_sapphire_glass?: boolean;
  casing_type?: string | null;
  drive_type?: string | null;
  warranty_type?: string | null;
  has_warranty?: boolean | null;
  has_box?: boolean | null;
  has_invoice?: boolean | null;
};

export type HydratedCategoryForms = {
  shared: SharedCihazForm;
  phone: PhoneCategoryForm;
  tablet: TabletCategoryForm;
  computer: ComputerCategoryForm;
  watch: WatchCategoryForm;
  console: ConsoleCategoryForm;
};

function photosForCategory(
  cat: DeviceCategory,
  urls?: string[] | null
): string[] {
  return (urls ?? []).filter(
    (u): u is string => typeof u === "string" && u.trim().length > 0
  );
}

export function buildHydratedCategoryForms(
  device: DeviceRowForHydrate
): HydratedCategoryForms {
  const cat: DeviceCategory = device.device_category ?? "phone";
  const wt = warrantyTypeFromDb(device);
  const photos = photosForCategory(cat, device.image_urls);

  const shared: SharedCihazForm = {
    ...DEFAULT_SHARED_FORM,
    listing_type: device.listing_type === "new" ? "new" : "used",
    device_category: cat,
    purchase_price:
      device.purchase_price > 0 ? String(device.purchase_price) : "",
    sale_price: device.sale_price > 0 ? String(device.sale_price) : "",
    payment_method: device.payment_method ?? "Nakit",
    swap_device_name: device.swap_device_name ?? "",
    seller_name: device.seller_name ?? "",
    seller_tc: device.seller_tc ?? "",
    seller_phone: device.seller_phone ?? "",
    buyer_name: device.buyer_name ?? "",
    buyer_tc: device.buyer_tc ?? "",
    buyer_phone: device.buyer_phone ?? "",
    icloud_signed_out: device.icloud_signed_out ?? false,
    notes: device.notes ?? "",
    has_box: device.has_box ?? false,
    has_invoice: device.has_invoice ?? false,
  };

  const phone: PhoneCategoryForm = {
    ...DEFAULT_PHONE_FORM,
    brand: device.brand ?? "",
    model: device.model ?? "",
    imei: device.imei ?? "",
    serial_no: device.serial_no ?? "",
    capacity: device.capacity ?? "",
    color: device.color ?? "",
    warranty_type: wt,
    screen_size: device.screen_size ?? "",
    condition: device.condition ?? "İyi",
    battery_health: device.battery_health ?? "",
    battery_cycle_count: device.battery_cycle_count ?? "",
    changed_parts: device.changed_parts ?? "",
    non_working_features: device.non_working_features ?? "",
    photo_uris: cat === "phone" ? photos : [],
  };

  const tablet: TabletCategoryForm = {
    ...DEFAULT_TABLET_FORM,
    brand: device.brand ?? "",
    model: device.model ?? "",
    serial_no: device.serial_no ?? "",
    capacity: device.capacity ?? "",
    color: device.color ?? "",
    screen_size: device.screen_size ?? "",
    operating_system: device.operating_system ?? "",
    sim_support: device.sim_support ?? false,
    warranty_type: wt,
    condition: device.condition ?? "İyi",
    changed_parts: device.changed_parts ?? "",
    non_working_features: device.non_working_features ?? "",
    photo_uris: cat === "tablet" ? photos : [],
  };

  const computer: ComputerCategoryForm = {
    ...DEFAULT_COMPUTER_FORM,
    brand: device.brand ?? "",
    model: device.model ?? "",
    serial_no: device.serial_no ?? "",
    processor: device.processor ?? "",
    ram: device.ram ?? "",
    hdd: device.hdd ?? "Yok",
    ssd: device.ssd ?? "Yok",
    gpu: device.gpu ?? "Paylaşımlı",
    screen_size: device.screen_size ?? "",
    resolution: device.resolution ?? "",
    color: device.color ?? "",
    warranty_type: wt,
    condition: device.condition ?? "İyi",
    battery_cycle_count: device.battery_cycle_count ?? "",
    changed_parts: device.changed_parts ?? "",
    non_working_features: device.non_working_features ?? "",
    photo_uris: cat === "computer" ? photos : [],
  };

  const watch: WatchCategoryForm = {
    ...DEFAULT_WATCH_FORM,
    brand: device.brand ?? "",
    model: device.model ?? "",
    serial_no: device.serial_no ?? "",
    case_diameter: device.screen_size ?? "",
    color: device.color ?? "",
    case_material: device.case_material ?? "",
    has_sapphire_glass: device.has_sapphire_glass ?? false,
    sim_support: device.sim_support ?? false,
    warranty_type: wt,
    condition: device.condition ?? "İyi",
    changed_parts: device.changed_parts ?? "",
    non_working_features: device.non_working_features ?? "",
    photo_uris: cat === "watch" ? photos : [],
  };

  const console: ConsoleCategoryForm = {
    ...DEFAULT_CONSOLE_FORM,
    brand: device.brand ?? "",
    model: device.model ?? "",
    casing_type: device.casing_type ?? "",
    drive_type: device.drive_type ?? "",
    capacity: device.capacity ?? "",
    warranty_type: wt,
    serial_no: device.serial_no ?? "",
    condition: device.condition ?? "İyi",
    changed_parts: device.changed_parts ?? "",
    non_working_features: device.non_working_features ?? "",
    photo_uris: cat === "console" ? photos : [],
  };

  return { shared, phone, tablet, computer, watch, console };
}
