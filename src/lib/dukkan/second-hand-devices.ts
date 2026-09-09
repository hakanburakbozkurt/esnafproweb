import { getPublicSiteUrl } from "@/lib/auth/site-url";
import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  Database,
  SecondHandDevicePublic,
} from "@/types/database.types";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** Liste kartları için güvenli alanlar. */
export const PUBLIC_SECOND_HAND_DEVICE_SELECT =
  "id, brand, model, condition, sale_price, image_urls, web_title, web_description, web_slug, color, device_category, listing_type, created_at, web_published, web_published_at" as const;

/** Detay sayfası için ek teknik ve ekspertiz alanları (hassas veri yok). */
export const PUBLIC_SECOND_HAND_DEVICE_DETAIL_SELECT =
  `${PUBLIC_SECOND_HAND_DEVICE_SELECT}, accepts_installments, capacity, battery_health, battery_cycle_count, ram, ssd, hdd, gpu, changed_parts, non_working_features, notes, has_box, has_invoice, has_warranty, warranty_type, processor, screen_size, resolution, sim_support, operating_system, case_material, has_sapphire_glass, casing_type, drive_type, web_description` as const;

type PublicDeviceListRow = Pick<
  SecondHandDevicePublic,
  | "id"
  | "brand"
  | "model"
  | "condition"
  | "sale_price"
  | "image_urls"
  | "web_title"
  | "web_description"
  | "web_slug"
  | "color"
  | "device_category"
  | "listing_type"
  | "created_at"
  | "web_published"
  | "web_published_at"
>;

type PublicDeviceDetailRow = PublicDeviceListRow &
  Pick<
    SecondHandDevicePublic,
    | "capacity"
    | "battery_health"
    | "battery_cycle_count"
    | "ram"
    | "ssd"
    | "hdd"
    | "gpu"
    | "changed_parts"
    | "non_working_features"
    | "notes"
    | "has_box"
    | "has_invoice"
    | "has_warranty"
    | "warranty_type"
    | "processor"
    | "screen_size"
    | "resolution"
    | "sim_support"
    | "operating_system"
    | "case_material"
    | "has_sapphire_glass"
    | "casing_type"
    | "drive_type"
    | "web_description"
    | "accepts_installments"
  >;

export type DeviceConditionWarning = {
  key: string;
  title: string;
  content: string;
};

export type DeviceSpecRow = {
  label: string;
  value: string;
};

export type ExpertiseReportSection = {
  title: string;
  content: string;
  tone?: "default" | "warning" | "success";
};

export type ExpertiseReport = {
  highlights: DeviceSpecRow[];
  sections: ExpertiseReportSection[];
  hasContent: boolean;
};

type ParsedExpertiseField = {
  tramer?: string;
  paintedParts?: string;
  changedParts?: string;
  plainText?: string;
};

function pickString(value: unknown): string | null {
  if (typeof value === "string" && value.trim()) return value.trim();
  if (typeof value === "number" && !Number.isNaN(value)) return String(value);
  if (typeof value === "boolean") return value ? "Evet" : "Hayır";
  return null;
}

function parseExpertiseField(value: string | null | undefined): ParsedExpertiseField | null {
  if (!value?.trim()) return null;

  const trimmed = value.trim();
  if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
    try {
      const parsed = JSON.parse(trimmed) as unknown;
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        const record = parsed as Record<string, unknown>;
        const result: ParsedExpertiseField = {
          tramer:
            pickString(record.tramer) ??
            pickString(record.tramer_kaydi) ??
            pickString(record.tramer_durumu) ??
            pickString(record.tramerDurumu) ??
            undefined,
          paintedParts:
            pickString(record.painted_parts) ??
            pickString(record.boyali_parca) ??
            pickString(record.boyali_parçalar) ??
            pickString(record.boyali) ??
            pickString(record.boyaliParcalar) ??
            undefined,
          changedParts:
            pickString(record.changed_parts) ??
            pickString(record.degisen_parca) ??
            pickString(record.degisen_parçalar) ??
            pickString(record.degisen) ??
            pickString(record.degisenParcalar) ??
            undefined,
        };

        if (result.tramer || result.paintedParts || result.changedParts) {
          return result;
        }
      }
    } catch {
      // Düz metin olarak devam et.
    }
  }

  return { plainText: trimmed };
}

export async function fetchPublishedSecondHandDevices(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<PublicDeviceListRow[]> {
  const { data, error } = await supabase
    .from("second_hand_devices_public")
    .select(PUBLIC_SECOND_HAND_DEVICE_SELECT)
    .eq("user_id", userId)
    .eq("web_published", true)
    .order("web_published_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[second-hand-devices] fetch error:", error.message);
    return [];
  }

  return (data ?? []) as PublicDeviceListRow[];
}

export async function fetchPublishedSecondHandDeviceBySlug(
  supabase: SupabaseClient<Database>,
  userId: string,
  deviceSlug: string
): Promise<PublicDeviceDetailRow | null> {
  const trimmedSlug = deviceSlug.trim();
  if (!trimmedSlug) return null;

  const base = () =>
    supabase
      .from("second_hand_devices_public")
      .select(PUBLIC_SECOND_HAND_DEVICE_DETAIL_SELECT)
      .eq("user_id", userId)
      .eq("web_published", true);

  const byWebSlug = await base().eq("web_slug", trimmedSlug).maybeSingle();
  if (byWebSlug.data) return byWebSlug.data as PublicDeviceDetailRow;
  if (byWebSlug.error) {
    console.error("[second-hand-devices] detail fetch error:", byWebSlug.error.message);
    return null;
  }

  if (UUID_REGEX.test(trimmedSlug)) {
    const byId = await base().eq("id", trimmedSlug).maybeSingle();
    if (byId.error) {
      console.error("[second-hand-devices] detail fetch by id error:", byId.error.message);
      return null;
    }
    return (byId.data as PublicDeviceDetailRow | null) ?? null;
  }

  return null;
}

export async function hasPublishedSecondHandDevices(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<boolean> {
  const { data, error } = await supabase
    .from("second_hand_devices_public")
    .select("id")
    .eq("user_id", userId)
    .eq("web_published", true)
    .limit(1);

  if (error) {
    console.error("[second-hand-devices] count error:", error.message);
    return false;
  }

  return (data?.length ?? 0) > 0;
}

export function getSecondHandDeviceTitle(
  device: Pick<PublicDeviceListRow, "web_title" | "brand" | "model">
): string {
  if (device.web_title?.trim()) return device.web_title.trim();

  const brand = device.brand?.trim() ?? "";
  const model = device.model?.trim() ?? "";
  const combined = [brand, model].filter(Boolean).join(" ");

  return combined || "İkinci El Cihaz";
}

export function getSecondHandDeviceImages(
  device: Pick<PublicDeviceListRow, "image_urls">
): string[] {
  return device.image_urls?.filter((url) => url?.trim()) ?? [];
}

export function getSecondHandDeviceImage(
  device: Pick<PublicDeviceListRow, "image_urls">
): string | null {
  return getSecondHandDeviceImages(device)[0] ?? null;
}

export function getSecondHandDeviceHref(
  shopSlug: string,
  device: Pick<PublicDeviceListRow, "id" | "web_slug">
): string {
  const segment = device.web_slug?.trim() || device.id;
  return `/${shopSlug}/pazaryeri/${segment}`;
}

/** Vitrin detay sayfasının mutlak public URL'si (WhatsApp vb.). */
export function buildSecondHandDevicePublicUrl(
  shopSlug: string,
  device: Pick<PublicDeviceListRow, "id" | "web_slug">,
  origin?: string
): string {
  const base = (origin ?? getPublicSiteUrl()).replace(/\/$/, "");
  return `${base}${getSecondHandDeviceHref(shopSlug, device)}`;
}

export function buildSecondHandDeviceInquiryWhatsAppMessage(
  title: string,
  deviceUrl: string
): string {
  return `Merhaba, ${title} ilanınızla ilgileniyorum. Detaylar: ${deviceUrl}`;
}

export function appendSecondHandDeviceUrlToWhatsAppMessage(
  message: string,
  deviceUrl: string
): string {
  const trimmed = message.trim();
  if (!trimmed) return `Detaylar: ${deviceUrl}`;
  return `${trimmed} Detaylar: ${deviceUrl}`;
}

export function formatSecondHandPrice(price: number | null | undefined): string {
  if (price == null || Number.isNaN(price)) return "Fiyat sorunuz";

  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(price);
}

export function formatSecondHandCondition(condition: string | null | undefined): string {
  if (!condition?.trim()) return "Belirtilmedi";

  const normalized = condition.trim().toLowerCase();
  const labels: Record<string, string> = {
    sifir: "Sıfır",
    "sıfır": "Sıfır",
    cok_iyi: "Çok İyi",
    "çok iyi": "Çok İyi",
    iyi: "İyi",
    orta: "Orta",
    kotu: "Kötü",
    "kötü": "Kötü",
  };

  return labels[normalized] ?? condition.trim();
}

const DEVICE_CATEGORY_LABELS: Record<string, string> = {
  phone: "Telefon",
  tablet: "Tablet",
  computer: "Bilgisayar",
  watch: "Akıllı Saat",
  console: "Konsol",
};

export function getDeviceCategoryLabel(
  deviceCategory: string | null | undefined
): string | null {
  if (!deviceCategory?.trim()) return null;
  return DEVICE_CATEGORY_LABELS[deviceCategory.trim()] ?? null;
}

export function getListingTypeBadge(listingType: string | null | undefined): {
  label: string;
  tone: "new" | "used";
} {
  if (listingType?.trim() === "new") {
    return { label: "Sıfır", tone: "new" };
  }
  return { label: "İkinci El", tone: "used" };
}

export function formatListingTypeLabel(
  listingType: string | null | undefined
): string {
  return getListingTypeBadge(listingType).label;
}

function formatBooleanDetail(value: boolean | null | undefined, yes: string): string | null {
  if (value == null) return null;
  return value ? yes : null;
}

function formatSimSpecValue(simSupport: boolean | null | undefined): string | null {
  const displayValue =
    simSupport === true
      ? "Destekliyor"
      : simSupport === false
        ? "Desteklemiyor"
        : null;

  if (!shouldRenderSimSpec(simSupport, displayValue)) {
    return null;
  }

  return "Destekliyor";
}

/** SIM satırını yalnızca anlamlı pozitif değerlerde göster (eski/cache kayıtları dahil). */
export function shouldRenderSimSpec(
  simSupport: boolean | null | undefined,
  displayValue?: string | null
): boolean {
  const normalized = displayValue?.trim() ?? "";

  if (/desteklemiyor/i.test(normalized)) return false;
  if (simSupport === false) return false;
  if (simSupport === true) return true;
  if (!normalized) return false;

  return true;
}

const SPEC_LABELS_SHOWN_IN_EXPERTISE = new Set([
  "Pil Sağlığı",
  "Pil Döngüsü",
]);

export function formatSecondHandListingDate(
  device: Pick<PublicDeviceListRow, "web_published_at" | "created_at">
): string | null {
  const raw = device.web_published_at ?? device.created_at;
  if (!raw) return null;

  try {
    return new Intl.DateTimeFormat("tr-TR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date(raw));
  } catch {
    return null;
  }
}

export function formatSecondHandListingNumber(
  device: Pick<PublicDeviceListRow, "id">
): string | null {
  if (!device.id?.trim()) return null;
  return device.id.slice(0, 8).toUpperCase();
}

function getBrandModelLabel(
  device: Pick<PublicDeviceListRow, "brand" | "model">
): string | null {
  const combined = [device.brand?.trim(), device.model?.trim()]
    .filter(Boolean)
    .join(" ");
  return combined || null;
}

export type DeviceConditionMarker = {
  key: string;
  label: string;
  tone: "emerald" | "amber" | "sky";
};

/** Kozmetik / kullanım durumu — header yerine ekspertiz bölümünde gösterilir. */
export function getDeviceConditionMarkers(
  device: Pick<PublicDeviceDetailRow, "condition">
): DeviceConditionMarker[] {
  const cosmetic = formatSecondHandCondition(device.condition);
  if (!cosmetic || cosmetic === "Belirtilmedi") {
    return [];
  }

  return [{ key: "cosmetic", label: cosmetic, tone: "emerald" }];
}

export function getDeviceConditionWarnings(
  device: PublicDeviceDetailRow
): DeviceConditionWarning[] {
  const warnings: DeviceConditionWarning[] = [];
  const changedPartsParsed = parseExpertiseField(device.changed_parts);

  if (changedPartsParsed?.changedParts) {
    warnings.push({
      key: "changed-parts",
      title: "Değişen Parçalar",
      content: changedPartsParsed.changedParts,
    });
  } else if (changedPartsParsed?.plainText) {
    warnings.push({
      key: "changed-parts",
      title: "Değişen Parçalar",
      content: changedPartsParsed.plainText,
    });
  }

  if (device.non_working_features?.trim()) {
    warnings.push({
      key: "non-working",
      title: "Çalışmayan Özellikler",
      content: device.non_working_features.trim(),
    });
  }

  return warnings;
}

export function getSecondHandDeviceSpecRows(
  device: PublicDeviceDetailRow
): DeviceSpecRow[] {
  const warrantyLabel =
    device.warranty_type?.trim() ||
    formatBooleanDetail(device.has_warranty, "Garantili");

  const coreRows: Array<{ label: string; value: string | null | undefined }> = [
    { label: "İlan Tarihi", value: formatSecondHandListingDate(device) },
    { label: "İlan Numarası", value: formatSecondHandListingNumber(device) },
    { label: "Marka ve Model", value: getBrandModelLabel(device) },
    { label: "Renk", value: device.color?.trim() || null },
    { label: "Durumu", value: getListingTypeBadge(device.listing_type).label },
  ];

  const detailRows: Array<{ label: string; value: string | null | undefined }> = [
    { label: "Kategori", value: getDeviceCategoryLabel(device.device_category) },
    { label: "Kapasite", value: device.capacity },
    { label: "RAM", value: device.ram },
    { label: "SSD", value: device.ssd },
    { label: "HDD", value: device.hdd },
    { label: "GPU", value: device.gpu },
    { label: "İşlemci", value: device.processor },
    { label: "Ekran", value: device.screen_size },
    { label: "Çözünürlük", value: device.resolution },
    { label: "İşletim Sistemi", value: device.operating_system },
    { label: "Kasa Malzemesi", value: device.case_material },
    { label: "Kasa Tipi", value: device.casing_type },
    { label: "Sürücü Tipi", value: device.drive_type },
    { label: "SIM", value: formatSimSpecValue(device.sim_support) },
    {
      label: "Safir Cam",
      value: formatBooleanDetail(device.has_sapphire_glass, "Var"),
    },
    { label: "Garanti", value: warrantyLabel },
    {
      label: "Kutu",
      value: formatBooleanDetail(device.has_box, "Var"),
    },
    {
      label: "Fatura",
      value: formatBooleanDetail(device.has_invoice, "Var"),
    },
  ];

  const rows = [...coreRows, ...detailRows];
  const seen = new Set<string>();

  return rows
    .filter((row) => row.value?.trim())
    .filter((row) => !SPEC_LABELS_SHOWN_IN_EXPERTISE.has(row.label))
    .filter((row) => {
      const key = `${row.label}:${row.value!.trim()}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .map((row) => ({ label: row.label, value: row.value!.trim() }));
}

export function getSecondHandExpertiseReport(
  device: PublicDeviceDetailRow
): ExpertiseReport {
  const highlights: DeviceSpecRow[] = [
    { label: "Pil Sağlığı", value: device.battery_health?.trim() ?? "" },
    { label: "Pil Döngüsü", value: device.battery_cycle_count?.trim() ?? "" },
  ].filter((row) => row.value);

  const sections: ExpertiseReportSection[] = [];
  const changedPartsParsed = parseExpertiseField(device.changed_parts);

  if (changedPartsParsed?.tramer) {
    sections.push({
      title: "Tramer Kaydı",
      content: changedPartsParsed.tramer,
      tone: "warning",
    });
  }

  if (changedPartsParsed?.paintedParts) {
    sections.push({
      title: "Boyalı Parçalar",
      content: changedPartsParsed.paintedParts,
      tone: "warning",
    });
  }

  return {
    highlights,
    sections,
    hasContent: highlights.length > 0 || sections.length > 0,
  };
}

export function deviceAcceptsInstallments(
  device: Pick<PublicSecondHandDeviceDetail, "accepts_installments">
): boolean {
  return device.accepts_installments === true;
}

export function canShowDeviceInstallmentOptions(
  device: Pick<
    PublicSecondHandDeviceDetail,
    "accepts_installments" | "sale_price"
  >
): boolean {
  const price = device.sale_price;
  return (
    device.accepts_installments === true &&
    price != null &&
    !Number.isNaN(price) &&
    price > 0
  );
}

export type PublicSecondHandDevice = PublicDeviceListRow;
export type PublicSecondHandDeviceDetail = PublicDeviceDetailRow;
