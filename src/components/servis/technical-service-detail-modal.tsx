"use client";

import { useEffect, useState, type ReactNode } from "react";
import { X } from "lucide-react";
import { FaultDescriptionDisplay } from "@/components/servis/fault-description-display";
import { PhysicalChecksList } from "@/components/servis/physical-checks-list";
import { ServiceTrackingLink } from "@/components/servis/service-tracking-link";
import { TechnicalServicePhotoGallery } from "@/components/servis/technical-service-photo-gallery";
import {
  getServiceStatusLabel,
  getServiceStatusStyle,
} from "@/lib/constants/service-status";
import { parsePhysicalChecks } from "@/lib/servis/service-approval";
import {
  APPROVAL_STATUS_LABELS,
  APPROVAL_STATUS_STYLES,
  collectServiceDevicePhotos,
  formatServiceDateTime,
} from "@/lib/servis/servis-yonetim-utils";
import type { TechnicalServiceRecord } from "@/lib/servis/technical-service.types";
import { cn } from "@/lib/utils/cn";

function DetailBlock({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <section className="border-b border-slate-100 py-4 last:border-b-0">
      <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
        {label}
      </h3>
      <div className="mt-2 text-sm leading-relaxed text-slate-800">{children}</div>
    </section>
  );
}

export function TechnicalServiceDetailModal({
  record,
  onClose,
  isLoading,
  error,
}: {
  record: TechnicalServiceRecord | null;
  onClose: () => void;
  isLoading?: boolean;
  error?: string | null;
}) {
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose]);

  const physicalChecks = record
    ? parsePhysicalChecks(record.physical_checks)
    : [];
  const hasPhysicalChecks =
    record != null && Object.keys(record.physical_checks).length > 0;
  const photos = record ? collectServiceDevicePhotos(record) : [];
  const accessoriesText =
    record && record.accessories.length > 0
      ? record.accessories.join(", ")
      : null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-slate-900/50 p-0 backdrop-blur-[2px] sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Servis kaydı detayı"
      onClick={onClose}
    >
      <div
        className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-t-3xl border border-slate-200 bg-white shadow-2xl sm:rounded-3xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4 sm:px-6">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-600">
              Servis Detayı
            </p>
            <h2 className="mt-1 truncate text-lg font-bold text-slate-900 sm:text-xl">
              {record?.service_id ?? record?.device_info ?? "Kayıt"}
            </h2>
            {record && (
              <p className="mt-1 text-xs text-slate-500">
                Teslim alım: {formatServiceDateTime(record.created_at)}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:bg-slate-50"
            aria-label="Kapat"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="overflow-y-auto px-5 py-2 sm:px-6">
          {isLoading && (
            <p className="py-10 text-center text-sm text-slate-500">
              Detay yükleniyor…
            </p>
          )}

          {error && (
            <div
              role="alert"
              className="my-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {error}
            </div>
          )}

          {record && !isLoading && (
            <>
              <div className="flex flex-wrap gap-2 py-3">
                {record.status && (
                  <span
                    className={cn(
                      "inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset",
                      getServiceStatusStyle(record.status)
                    )}
                  >
                    {getServiceStatusLabel(record.status)}
                  </span>
                )}
                <span
                  className={cn(
                    "inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset",
                    APPROVAL_STATUS_STYLES[record.approval_status] ??
                      "bg-slate-100 text-slate-600 ring-slate-500/20"
                  )}
                >
                  {APPROVAL_STATUS_LABELS[record.approval_status] ??
                    record.approval_status}
                </span>
              </div>

              <DetailBlock label="Müşteri">
                <p className="font-semibold text-slate-900">{record.customer_name}</p>
                <p className="mt-1 text-slate-600">
                  {record.customer_phone?.trim() || "Telefon kayıtlı değil"}
                </p>
                {record.secondary_phone?.trim() && (
                  <p className="mt-0.5 text-slate-500">
                    İkinci tel: {record.secondary_phone}
                  </p>
                )}
              </DetailBlock>

              <DetailBlock label="Cihaz">
                <p className="font-semibold text-slate-900">{record.device_info}</p>
                {record.device_imei?.trim() && (
                  <p className="mt-1 font-mono text-xs text-slate-600">
                    IMEI: {record.device_imei}
                  </p>
                )}
              </DetailBlock>

              {record.technician_name?.trim() && (
                <DetailBlock label="Sorumlu Personel">
                  {record.technician_name}
                </DetailBlock>
              )}

              {accessoriesText && (
                <DetailBlock label="Bırakılan Aksesuarlar">
                  {accessoriesText}
                </DetailBlock>
              )}

              {record.fault_description && (
                <DetailBlock label="Bildirilen Arıza">
                  <FaultDescriptionDisplay
                    faultDescription={record.fault_description}
                    lockType={record.lock_type}
                    devicePassword={record.device_password}
                    patternLockData={record.pattern_lock_data}
                  />
                </DetailBlock>
              )}

              {record.cosmetic_notes?.trim() && (
                <DetailBlock label="Fiziksel Notlar">
                  <p className="whitespace-pre-wrap">{record.cosmetic_notes}</p>
                </DetailBlock>
              )}

              {hasPhysicalChecks && (
                <DetailBlock label="Fiziksel Kontroller">
                  <PhysicalChecksList items={physicalChecks} />
                </DetailBlock>
              )}

              <DetailBlock label="Teslim Alım Fotoğrafları">
                <TechnicalServicePhotoGallery photos={photos} />
              </DetailBlock>

              {record.tracking_code && (
                <div className="py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                    Müşteri Takip
                  </p>
                  <p className="mt-2 text-sm text-slate-600">
                    Takip kodu:{" "}
                    <span className="font-mono font-semibold text-slate-900">
                      {record.tracking_code}
                    </span>
                  </p>
                  <ServiceTrackingLink
                    trackingCode={record.tracking_code}
                    className="mt-3"
                  />
                </div>
              )}

              {record.completed_at && (
                <DetailBlock label="Tamamlanma">
                  {formatServiceDateTime(record.completed_at)}
                </DetailBlock>
              )}
            </>
          )}
        </div>

        <div className="border-t border-slate-100 px-5 py-4 sm:px-6">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex min-h-11 w-full items-center justify-center rounded-full border border-slate-200 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 sm:w-auto sm:px-8"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
}
