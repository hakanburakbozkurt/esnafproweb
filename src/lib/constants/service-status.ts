import type { ServiceDeviceStatus } from "@/types/database.types";

export const SERVICE_STATUS_LABELS: Record<ServiceDeviceStatus, string> = {
  tamirde: "Tamirde",
  hazir: "Hazır",
  teslim_edildi: "Teslim Edildi",
};

export const SERVICE_STATUS_STYLES: Record<ServiceDeviceStatus, string> = {
  tamirde: "bg-amber-50 text-amber-700 ring-amber-600/20",
  hazir: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  teslim_edildi: "bg-slate-100 text-slate-600 ring-slate-500/20",
};

const EXTENDED_SERVICE_STATUS_LABELS: Record<string, string> = {
  İncelemede: "İncelemede",
};

const EXTENDED_SERVICE_STATUS_STYLES: Record<string, string> = {
  İncelemede: "bg-sky-50 text-sky-700 ring-sky-600/20",
};

export function getServiceStatusLabel(status: string) {
  return (
    SERVICE_STATUS_LABELS[status as ServiceDeviceStatus] ??
    EXTENDED_SERVICE_STATUS_LABELS[status] ??
    status
  );
}

export function getServiceStatusStyle(status: string) {
  return (
    SERVICE_STATUS_STYLES[status as ServiceDeviceStatus] ??
    EXTENDED_SERVICE_STATUS_STYLES[status] ??
    "bg-slate-100 text-slate-600 ring-slate-500/20"
  );
}
