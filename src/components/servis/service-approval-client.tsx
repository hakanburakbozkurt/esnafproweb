"use client";

import Link from "next/link";
import { useActionState, useEffect, useState, type ReactNode } from "react";
import { Card } from "@/components/ui/card";
import {
  getServiceStatusLabel,
  getServiceStatusStyle,
} from "@/lib/constants/service-status";
import { approveServiceTerms } from "@/lib/servis/service-approval-actions";
import type { PublicServiceApprovalRecord } from "@/lib/servis/service-approval.types";
import { parsePhysicalChecks } from "@/lib/servis/service-approval";
import { PhysicalChecksList } from "@/components/servis/physical-checks-list";
import {
  SERVICE_TERMS_ITEMS,
  SERVICE_TERMS_TITLE,
} from "@/lib/servis/service-terms";
import { cn } from "@/lib/utils/cn";

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: ReactNode;
}) {
  return (
    <div className="border-b border-slate-100 py-3 last:border-b-0">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
        {label}
      </p>
      <div className="mt-1 text-sm leading-relaxed text-slate-800">{value}</div>
    </div>
  );
}

function ApprovalStatusBadge({
  approvalStatus,
}: {
  approvalStatus: PublicServiceApprovalRecord["approval_status"];
}) {
  const labels = {
    beklemede: "Onay Bekliyor",
    onaylandi: "Onaylandı",
    reddedildi: "Reddedildi",
  } as const;

  const styles = {
    beklemede: "bg-amber-50 text-amber-800 ring-amber-600/20",
    onaylandi: "bg-emerald-50 text-emerald-800 ring-emerald-600/20",
    reddedildi: "bg-red-50 text-red-700 ring-red-600/20",
  } as const;

  return (
    <span
      className={cn(
        "inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset",
        styles[approvalStatus]
      )}
    >
      {labels[approvalStatus]}
    </span>
  );
}

export function ServiceApprovalClient({
  token,
  record,
}: {
  token: string;
  record: PublicServiceApprovalRecord;
}) {
  const [state, formAction, isPending] = useActionState(approveServiceTerms, {});
  const [localApproved, setLocalApproved] = useState(
    record.approval_status === "onaylandi"
  );
  const [trackingCode, setTrackingCode] = useState(record.tracking_code);

  useEffect(() => {
    if (state.success) {
      setLocalApproved(true);
      if (state.trackingCode) {
        setTrackingCode(state.trackingCode);
      }
    }
  }, [state.success, state.trackingCode]);

  const isApproved = localApproved || record.approval_status === "onaylandi";
  const isRejected = record.approval_status === "reddedildi";
  const canApprove =
    !isApproved && !isRejected && !isPending && !record.token_expired;
  const displayTrackingCode = trackingCode ?? state.trackingCode ?? null;

  const physicalChecks = parsePhysicalChecks(record.physical_checks);
  const accessoriesText =
    record.accessories.length > 0
      ? record.accessories.join(", ")
      : "Kayıtlı aksesuar bulunmuyor";

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Card>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-600">
              Servis Onayı
            </p>
            <h2 className="mt-2 text-xl font-bold text-slate-900 sm:text-2xl">
              Cihaz Teslim Bilgileri
            </h2>
          </div>
          <ApprovalStatusBadge approvalStatus={record.approval_status} />
        </div>

        <div className="mt-5 divide-y divide-slate-100">
          <DetailRow label="Müşteri Adı" value={record.customer_name} />
          <DetailRow label="Cihaz Modeli" value={record.device_info} />
          <DetailRow
            label="IMEI"
            value={
              record.device_imei?.trim() ? (
                <span className="font-mono">{record.device_imei}</span>
              ) : (
                "—"
              )
            }
          />
          <DetailRow label="Bırakılan Aksesuarlar" value={accessoriesText} />
          <DetailRow
            label="Servis Durumu"
            value={
              record.status ? (
                <span
                  className={cn(
                    "inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset",
                    getServiceStatusStyle(record.status)
                  )}
                >
                  {getServiceStatusLabel(record.status)}
                </span>
              ) : (
                "—"
              )
            }
          />
          {record.fault_description && (
            <DetailRow
              label="Bildirilen Arıza"
              value={record.fault_description}
            />
          )}
          {physicalChecks.length > 0 && (
            <DetailRow
              label="Fiziksel Kontroller"
              value={<PhysicalChecksList items={physicalChecks} />}
            />
          )}
        </div>
      </Card>

      {state.warning && (
        <div
          role="status"
          className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
        >
          {state.warning}
        </div>
      )}

      {state.success && (
        <div
          role="status"
          className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
        >
          {state.alreadyApproved
            ? "Bu servis kaydı daha önce onaylanmış. Teşekkür ederiz."
            : "Servis şartlarını onayladınız. Kaydınız başarıyla güncellendi."}
          {displayTrackingCode && (
            <>
              <p className="mt-2 font-medium">
                Takip numaranız:{" "}
                <span className="font-mono text-base">{displayTrackingCode}</span>
              </p>
              <Link
                href={`/servis-takip/${encodeURIComponent(displayTrackingCode)}`}
                className="mt-3 inline-flex text-sm font-semibold text-emerald-700 underline-offset-2 hover:underline"
              >
                Cihaz durumunu takip et →
              </Link>
            </>
          )}
        </div>
      )}

      {isApproved && displayTrackingCode && !state.success && (
        <div
          role="status"
          className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
        >
          Cihaz takip numaranız:{" "}
          <span className="font-mono font-semibold">{displayTrackingCode}</span>
          <div className="mt-3">
            <Link
              href={`/servis-takip/${encodeURIComponent(displayTrackingCode)}`}
              className="inline-flex text-sm font-semibold text-emerald-700 underline-offset-2 hover:underline"
            >
              Cihaz durumunu takip et →
            </Link>
          </div>
        </div>
      )}

      {record.token_expired && !isApproved && (
        <div
          role="alert"
          className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
        >
          Bu onay bağlantısının süresi dolmuş. Servis noktanızdan yeni bir onay
          linki isteyin.
        </div>
      )}

      {state.error && (
        <div
          role="alert"
          className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {state.error}
        </div>
      )}

      {isRejected && (
        <div
          role="alert"
          className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
        >
          Bu servis kaydı daha önce reddedilmiş. Sorularınız için servis
          noktanızla iletişime geçin.
        </div>
      )}

      <Card className="overflow-hidden p-0">
        <div className="border-b border-slate-200/80 bg-slate-50/80 px-5 py-4 sm:px-6">
          <h3 className="text-base font-bold text-slate-900">
            {SERVICE_TERMS_TITLE}
          </h3>
          <p className="mt-1 text-xs text-slate-500">
            Lütfen aşağıdaki maddeleri okuyun ve onaylayın.
          </p>
        </div>
        <div className="max-h-72 overflow-y-auto px-5 py-4 sm:max-h-80 sm:px-6">
          <ol className="list-decimal space-y-3 pl-5 text-sm leading-relaxed text-slate-700">
            {SERVICE_TERMS_ITEMS.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ol>
        </div>
      </Card>

      <form action={formAction} className="pb-2">
        <input type="hidden" name="token" value={token} />
        <button
          type="submit"
          disabled={!canApprove}
          className={cn(
            "inline-flex min-h-12 w-full items-center justify-center rounded-full px-6 text-sm font-bold text-white shadow-lg transition",
            canApprove
              ? "bg-emerald-600 shadow-emerald-600/20 hover:bg-emerald-700"
              : "cursor-not-allowed bg-slate-300 shadow-none"
          )}
        >
          {isPending
            ? "Onaylanıyor…"
            : isApproved
              ? "Onaylandı"
              : "Servis Şartlarını Okudum ve Onaylıyorum"}
        </button>
      </form>
    </div>
  );
}
