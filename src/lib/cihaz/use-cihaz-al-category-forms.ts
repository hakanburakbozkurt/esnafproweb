"use client";

import { useCallback, useState } from "react";
import type { DeviceRowForHydrate } from "@/lib/cihaz/hydrate-second-hand-device-form";
import { buildHydratedCategoryForms } from "@/lib/cihaz/hydrate-second-hand-device-form";
import type {
  DeviceCategory,
  ListingType,
  PaymentMethod,
} from "@/lib/cihaz/types";
import { DEFAULT_NEW_DEVICE_WARRANTY } from "@/lib/cihaz/cihaz-warranty";

export type SharedCihazForm = {
  listing_type: ListingType;
  device_category: DeviceCategory;
  purchase_price: string;
  sale_price: string;
  payment_method: PaymentMethod;
  swap_device_name: string;
  seller_name: string;
  seller_tc: string;
  seller_phone: string;
  buyer_name: string;
  buyer_tc: string;
  buyer_phone: string;
  icloud_signed_out: boolean;
  notes: string;
  has_box: boolean;
  has_invoice: boolean;
};

export type PhoneCategoryForm = {
  brand: string;
  model: string;
  imei: string;
  serial_no: string;
  capacity: string;
  color: string;
  warranty_type: string;
  screen_size: string;
  condition: string;
  battery_health: string;
  battery_cycle_count: string;
  changed_parts: string;
  non_working_features: string;
  photo_uris: string[];
};

export type TabletCategoryForm = {
  brand: string;
  model: string;
  serial_no: string;
  capacity: string;
  color: string;
  screen_size: string;
  operating_system: string;
  sim_support: boolean;
  warranty_type: string;
  condition: string;
  changed_parts: string;
  non_working_features: string;
  photo_uris: string[];
};

export type ComputerCategoryForm = {
  brand: string;
  model: string;
  serial_no: string;
  processor: string;
  ram: string;
  hdd: string;
  ssd: string;
  gpu: string;
  screen_size: string;
  resolution: string;
  color: string;
  warranty_type: string;
  condition: string;
  battery_cycle_count: string;
  changed_parts: string;
  non_working_features: string;
  photo_uris: string[];
};

export type WatchCategoryForm = {
  brand: string;
  model: string;
  serial_no: string;
  case_diameter: string;
  color: string;
  case_material: string;
  has_sapphire_glass: boolean;
  sim_support: boolean;
  warranty_type: string;
  condition: string;
  changed_parts: string;
  non_working_features: string;
  photo_uris: string[];
};

export type ConsoleCategoryForm = {
  brand: string;
  model: string;
  casing_type: string;
  drive_type: string;
  capacity: string;
  warranty_type: string;
  serial_no: string;
  condition: string;
  changed_parts: string;
  non_working_features: string;
  photo_uris: string[];
};

export const DEFAULT_SHARED_FORM: SharedCihazForm = {
  listing_type: "used",
  device_category: "phone",
  purchase_price: "",
  sale_price: "",
  payment_method: "Nakit",
  swap_device_name: "",
  seller_name: "",
  seller_tc: "",
  seller_phone: "",
  buyer_name: "",
  buyer_tc: "",
  buyer_phone: "",
  icloud_signed_out: false,
  notes: "",
  has_box: false,
  has_invoice: false,
};

export const DEFAULT_PHONE_FORM: PhoneCategoryForm = {
  brand: "",
  model: "",
  imei: "",
  serial_no: "",
  capacity: "",
  color: "",
  warranty_type: "",
  screen_size: "",
  condition: "İyi",
  battery_health: "",
  battery_cycle_count: "",
  changed_parts: "",
  non_working_features: "",
  photo_uris: [],
};

export const DEFAULT_TABLET_FORM: TabletCategoryForm = {
  brand: "",
  model: "",
  serial_no: "",
  capacity: "",
  color: "",
  screen_size: "",
  operating_system: "",
  sim_support: false,
  warranty_type: "",
  condition: "İyi",
  changed_parts: "",
  non_working_features: "",
  photo_uris: [],
};

export const DEFAULT_COMPUTER_FORM: ComputerCategoryForm = {
  brand: "",
  model: "",
  serial_no: "",
  processor: "",
  ram: "",
  hdd: "Yok",
  ssd: "Yok",
  gpu: "Paylaşımlı",
  screen_size: "",
  resolution: "",
  color: "",
  warranty_type: "",
  condition: "İyi",
  battery_cycle_count: "",
  changed_parts: "",
  non_working_features: "",
  photo_uris: [],
};

export const DEFAULT_WATCH_FORM: WatchCategoryForm = {
  brand: "",
  model: "",
  serial_no: "",
  case_diameter: "",
  color: "",
  case_material: "",
  has_sapphire_glass: false,
  sim_support: false,
  warranty_type: "",
  condition: "İyi",
  changed_parts: "",
  non_working_features: "",
  photo_uris: [],
};

export const DEFAULT_CONSOLE_FORM: ConsoleCategoryForm = {
  brand: "",
  model: "",
  casing_type: "",
  drive_type: "",
  capacity: "",
  warranty_type: "",
  serial_no: "",
  condition: "İyi",
  changed_parts: "",
  non_working_features: "",
  photo_uris: [],
};

export function useCihazAlCategoryForms() {
  const [shared, setShared] = useState<SharedCihazForm>(DEFAULT_SHARED_FORM);
  const [phone, setPhone] = useState<PhoneCategoryForm>(DEFAULT_PHONE_FORM);
  const [tablet, setTablet] = useState<TabletCategoryForm>(DEFAULT_TABLET_FORM);
  const [computer, setComputer] =
    useState<ComputerCategoryForm>(DEFAULT_COMPUTER_FORM);
  const [watch, setWatch] = useState<WatchCategoryForm>(DEFAULT_WATCH_FORM);
  const [consoleForm, setConsoleForm] =
    useState<ConsoleCategoryForm>(DEFAULT_CONSOLE_FORM);

  const updateShared = useCallback(
    (patch: Partial<SharedCihazForm>) =>
      setShared((prev) => ({ ...prev, ...patch })),
    []
  );

  const updatePhone = useCallback(
    (patch: Partial<PhoneCategoryForm>) =>
      setPhone((prev) => ({ ...prev, ...patch })),
    []
  );

  const updateTablet = useCallback(
    (patch: Partial<TabletCategoryForm>) =>
      setTablet((prev) => ({ ...prev, ...patch })),
    []
  );

  const updateComputer = useCallback(
    (patch: Partial<ComputerCategoryForm>) =>
      setComputer((prev) => ({ ...prev, ...patch })),
    []
  );

  const updateWatch = useCallback(
    (patch: Partial<WatchCategoryForm>) =>
      setWatch((prev) => ({ ...prev, ...patch })),
    []
  );

  const updateConsole = useCallback(
    (patch: Partial<ConsoleCategoryForm>) =>
      setConsoleForm((prev) => ({ ...prev, ...patch })),
    []
  );

  const setDeviceCategory = useCallback((dc: DeviceCategory) => {
    setShared((prev) => ({ ...prev, device_category: dc }));
  }, []);

  const setListingType = useCallback((lt: ListingType) => {
    setShared((prev) => ({ ...prev, listing_type: lt }));
    if (lt === "new") {
      const w = { warranty_type: DEFAULT_NEW_DEVICE_WARRANTY };
      setPhone((p) => ({ ...p, ...w }));
      setTablet((p) => ({ ...p, ...w }));
      setComputer((p) => ({ ...p, ...w }));
      setWatch((p) => ({ ...p, ...w }));
      setConsoleForm((p) => ({ ...p, ...w }));
    }
  }, []);

  const resetAll = useCallback(() => {
    setShared(DEFAULT_SHARED_FORM);
    setPhone(DEFAULT_PHONE_FORM);
    setTablet(DEFAULT_TABLET_FORM);
    setComputer(DEFAULT_COMPUTER_FORM);
    setWatch(DEFAULT_WATCH_FORM);
    setConsoleForm(DEFAULT_CONSOLE_FORM);
  }, []);

  const hydrateFromDevice = useCallback((device: DeviceRowForHydrate) => {
    const s = buildHydratedCategoryForms(device);
    setShared(s.shared);
    setPhone(s.phone);
    setTablet(s.tablet);
    setComputer(s.computer);
    setWatch(s.watch);
    setConsoleForm(s.console);
  }, []);

  return {
    shared,
    phone,
    tablet,
    computer,
    watch,
    console: consoleForm,
    updateShared,
    updatePhone,
    updateTablet,
    updateComputer,
    updateWatch,
    updateConsole,
    setDeviceCategory,
    setListingType,
    resetAll,
    hydrateFromDevice,
  };
}
