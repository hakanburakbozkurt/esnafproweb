import { getLockedDriveType } from "@/lib/cihaz/cihaz-console-catalog";
import { hasWarrantyFromType } from "@/lib/cihaz/cihaz-warranty";
import type {
  ConsoleCategoryForm,
  ComputerCategoryForm,
  PhoneCategoryForm,
  SharedCihazForm,
  TabletCategoryForm,
  WatchCategoryForm,
} from "@/lib/cihaz/use-cihaz-al-category-forms";
import type {
  DeviceCategory,
  SecondHandDeviceInsert,
} from "@/lib/cihaz/types";

export type BuildDevicePayloadInput = {
  userId: string;
  shared: SharedCihazForm;
  phone: PhoneCategoryForm;
  tablet: TabletCategoryForm;
  computer: ComputerCategoryForm;
  watch: WatchCategoryForm;
  console: ConsoleCategoryForm;
  imageUrls: string[];
};

export type BuildDevicePayloadResult =
  | { ok: true; payload: SecondHandDeviceInsert }
  | { ok: false; error: string };

export function buildDevicePayload(
  input: BuildDevicePayloadInput
): BuildDevicePayloadResult {
  const {
    userId,
    shared,
    phone,
    tablet,
    computer,
    watch,
    console: consoleForm,
    imageUrls,
  } = input;

  const deviceCat: DeviceCategory =
    shared.device_category === "computer" ||
    shared.device_category === "watch" ||
    shared.device_category === "tablet" ||
    shared.device_category === "console"
      ? shared.device_category
      : "phone";

  const active =
    deviceCat === "tablet"
      ? tablet
      : deviceCat === "computer"
        ? computer
        : deviceCat === "watch"
          ? watch
          : deviceCat === "console"
            ? consoleForm
            : phone;

  if (!active.brand.trim() || !active.model.trim()) {
    return { ok: false, error: "Marka ve model zorunlu." };
  }

  if (deviceCat === "watch" && !watch.case_diameter.trim()) {
    return { ok: false, error: "Kasa çapı zorunlu." };
  }

  const purchaseNum =
    parseFloat(shared.purchase_price.replace(",", ".")) || 0;
  const saleNum = parseFloat(shared.sale_price.replace(",", ".")) || 0;

  const imeiTrim = deviceCat === "phone" ? phone.imei.trim() : "";
  const imeiDigitsOnly = imeiTrim.replace(/\D/g, "");
  const imeiStored =
    imeiTrim.length === 0
      ? null
      : imeiDigitsOnly.length >= 14
        ? imeiDigitsOnly
        : imeiTrim;

  const listingType = shared.listing_type === "new" ? "new" : "used";
  const isSifir = listingType === "new";
  const effectiveImei = deviceCat === "phone" ? imeiStored : null;

  let batteryCycleForDb: string | null = null;
  if (!isSifir && deviceCat === "phone") {
    const digits = phone.battery_cycle_count.replace(/\D/g, "");
    batteryCycleForDb = digits.length > 0 ? digits : null;
  } else if (!isSifir && deviceCat === "computer") {
    const digits = computer.battery_cycle_count.replace(/\D/g, "");
    batteryCycleForDb =
      computer.brand === "Apple Macbook" && digits.length > 0 ? digits : null;
  }

  const trimmedColor =
    "color" in active ? active.color.trim() || null : null;
  const trimmedSerial = active.serial_no.trim() || null;

  let capacityDb: string | null =
    "capacity" in active ? active.capacity.trim() || null : null;
  let colorDb = trimmedColor;
  let imeiDb = effectiveImei;
  let batteryHealthDb =
    !isSifir && deviceCat === "phone"
      ? phone.battery_health.trim() || null
      : null;
  let processorDb: string | null = null;
  let ramDb: string | null = null;
  let hddDb: string | null = null;
  let ssdDb: string | null = null;
  let gpuDb: string | null = null;
  let screenSizeDb: string | null = null;
  let resolutionDb: string | null = null;
  const warrantyTypeDb = active.warranty_type.trim() || "Garanti Yok";
  const hasWarrantyDb = hasWarrantyFromType(warrantyTypeDb);
  let simSupportDb = false;
  let operatingSystemDb: string | null = null;
  let caseMaterialDb: string | null = null;
  let hasSapphireGlassDb = false;
  let casingTypeDb: string | null = null;
  let driveTypeDb: string | null = null;

  if (deviceCat === "computer") {
    imeiDb = null;
    capacityDb = null;
    batteryHealthDb = null;
    processorDb = computer.processor.trim() || null;
    ramDb = computer.ram.trim() || null;
    hddDb = computer.hdd.trim() || null;
    ssdDb = computer.ssd.trim() || null;
    gpuDb = computer.gpu.trim() || null;
    screenSizeDb = computer.screen_size.trim() || null;
    resolutionDb = computer.resolution.trim() || null;
  } else if (deviceCat === "tablet") {
    imeiDb = null;
    batteryHealthDb = null;
    screenSizeDb = tablet.screen_size.trim() || null;
    simSupportDb = tablet.sim_support;
    operatingSystemDb = tablet.operating_system.trim() || null;
  } else if (deviceCat === "watch") {
    imeiDb = null;
    capacityDb = null;
    batteryHealthDb = null;
    screenSizeDb = watch.case_diameter.trim() || null;
    simSupportDb = watch.sim_support;
    caseMaterialDb = watch.case_material.trim() || null;
    hasSapphireGlassDb = watch.has_sapphire_glass;
  } else if (deviceCat === "console") {
    imeiDb = null;
    batteryHealthDb = null;
    capacityDb = consoleForm.capacity.trim() || null;
    casingTypeDb = consoleForm.casing_type.trim() || null;
    driveTypeDb =
      consoleForm.drive_type.trim() ||
      getLockedDriveType(consoleForm.brand, consoleForm.model) ||
      null;
  } else if (
    deviceCat === "phone" &&
    phone.brand === "Apple" &&
    phone.screen_size.trim()
  ) {
    screenSizeDb = phone.screen_size.trim();
  }

  const payload: SecondHandDeviceInsert = {
    user_id: userId,
    brand: active.brand.trim(),
    model: active.model.trim(),
    capacity: capacityDb,
    color: colorDb,
    serial_no: trimmedSerial,
    imei: imeiDb,
    condition: isSifir
      ? "Mükemmel"
      : active.condition.trim() || "İyi",
    listing_type: listingType,
    device_category: deviceCat,
    battery_health: batteryHealthDb,
    battery_cycle_count: batteryCycleForDb,
    changed_parts: isSifir ? null : active.changed_parts.trim() || null,
    non_working_features: isSifir
      ? null
      : active.non_working_features.trim() || null,
    purchase_price: purchaseNum,
    sale_price: saleNum,
    payment_method: shared.payment_method,
    swap_device_name:
      shared.payment_method === "Takas"
        ? shared.swap_device_name.trim() || null
        : null,
    seller_name: shared.seller_name.trim() || null,
    seller_tc: shared.seller_tc.trim() || null,
    seller_phone: shared.seller_phone.trim() || null,
    buyer_name: shared.buyer_name.trim() || null,
    buyer_tc: shared.buyer_tc.trim() || null,
    buyer_phone: shared.buyer_phone.trim() || null,
    seller_signature: null,
    buyer_signature: null,
    icloud_signed_out: isSifir ? false : shared.icloud_signed_out,
    notes: shared.notes.trim() || null,
    image_urls: imageUrls,
    status: "available",
    processor: processorDb,
    ram: ramDb,
    hdd: hddDb,
    ssd: ssdDb,
    gpu: gpuDb,
    screen_size: screenSizeDb,
    resolution: resolutionDb,
    has_warranty: hasWarrantyDb,
    warranty_type: warrantyTypeDb,
    sim_support: simSupportDb,
    operating_system: operatingSystemDb,
    case_material: caseMaterialDb,
    has_sapphire_glass: hasSapphireGlassDb,
    casing_type: casingTypeDb,
    drive_type: driveTypeDb,
    has_box: shared.has_box,
    has_invoice: shared.has_invoice,
  };

  return { ok: true, payload };
}
