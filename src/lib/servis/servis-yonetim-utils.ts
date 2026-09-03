import type { TechnicalServiceRecord } from "@/lib/servis/technical-service.types";

export function formatServiceDateTime(value: string | null | undefined): string {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function formatServiceDate(value: string | null | undefined): string {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

/** date input (YYYY-MM-DD) → inclusive UTC aralığı */
export function resolveStrictDateRangeBounds(dateFrom?: string, dateTo?: string) {
  const from = dateFrom?.trim();
  const to = dateTo?.trim();

  let startIso: string | undefined;
  let endIso: string | undefined;

  if (from) {
    const start = new Date(`${from}T00:00:00`);
    if (!Number.isNaN(start.getTime())) {
      startIso = start.toISOString();
    }
  }

  if (to) {
    const end = new Date(`${to}T23:59:59.999`);
    if (!Number.isNaN(end.getTime())) {
      endIso = end.toISOString();
    }
  }

  if (startIso && endIso && startIso > endIso) {
    return { error: "Başlangıç tarihi bitiş tarihinden sonra olamaz." as const };
  }

  return { startIso, endIso };
}

export type ServiceDevicePhoto = {
  url: string;
  label: string;
};

export function collectServiceDevicePhotos(
  record: Pick<
    TechnicalServiceRecord,
    | "photo_front_url"
    | "photo_back_url"
    | "photo_bottom_url"
    | "device_photo_urls"
  >
): ServiceDevicePhoto[] {
  const photos: ServiceDevicePhoto[] = [];

  if (record.photo_front_url?.trim()) {
    photos.push({ url: record.photo_front_url.trim(), label: "Ön" });
  }
  if (record.photo_back_url?.trim()) {
    photos.push({ url: record.photo_back_url.trim(), label: "Arka" });
  }
  if (record.photo_bottom_url?.trim()) {
    photos.push({ url: record.photo_bottom_url.trim(), label: "Alt" });
  }

  const extras = record.device_photo_urls ?? [];
  extras.forEach((url, index) => {
    const trimmed = url?.trim();
    if (trimmed) {
      photos.push({ url: trimmed, label: `Ek ${index + 1}` });
    }
  });

  return photos;
}

export const APPROVAL_STATUS_LABELS: Record<string, string> = {
  beklemede: "Onay Bekliyor",
  onaylandi: "Onaylandı",
  reddedildi: "Reddedildi",
};

export const APPROVAL_STATUS_STYLES: Record<string, string> = {
  beklemede: "bg-amber-50 text-amber-800 ring-amber-600/20",
  onaylandi: "bg-emerald-50 text-emerald-800 ring-emerald-600/20",
  reddedildi: "bg-red-50 text-red-700 ring-red-600/20",
};
