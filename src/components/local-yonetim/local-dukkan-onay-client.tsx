"use client";

import Link from "next/link";
import { useActionState, useMemo, useState } from "react";
import {
  localAccentLabelClass,
  localBtnSmallDangerClass,
  localBtnSmallPrimaryClass,
  localBtnSmallSecondaryClass,
  localCardClass,
  localPanelClass,
  localSectionTitleClass,
} from "@/components/local-yonetim/local-admin-ui";
import { LocalAuthNotice } from "@/components/local-yonetim/local-auth-notice";
import {
  approveDukkanForm,
  pendingDukkanForm,
  rejectDukkanForm,
  type DukkanApprovalAdminState,
} from "@/lib/dukkan/admin-approval-actions";
import {
  SHOP_APPROVAL_STATUS_CONFIG,
  type ShopApprovalStatus,
} from "@/lib/dukkan/approval-status";
import {
  countDukkanlarByApprovalStatus,
  type AdminDukkanListItem,
} from "@/lib/dukkan/admin-dukkanlar.shared";
import { cn } from "@/lib/utils/cn";

const initialState: DukkanApprovalAdminState = {};

type ApprovalTab = ShopApprovalStatus;

const TAB_ORDER: ApprovalTab[] = ["pending", "active", "rejected"];

const localStatusBadgeClass: Record<ShopApprovalStatus, string> = {
  active: "border-emerald-200 bg-emerald-50 text-emerald-800",
  pending: "border-amber-200 bg-amber-50 text-amber-800",
  rejected: "border-red-200 bg-red-50 text-red-800",
};

type LocalDukkanOnayClientProps = {
  dukkanlar: AdminDukkanListItem[];
  canEdit: boolean;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("tr-TR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function AdminStatusBadge({ status }: { status: ShopApprovalStatus }) {
  const config = SHOP_APPROVAL_STATUS_CONFIG[status];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium",
        localStatusBadgeClass[status]
      )}
    >
      <span aria-hidden>{config.dot}</span>
      {config.label}
    </span>
  );
}

function DukkanApprovalRow({
  dukkan,
  canEdit,
}: {
  dukkan: AdminDukkanListItem;
  canEdit: boolean;
}) {
  const [approveState, approveAction, approvePending] = useActionState(
    approveDukkanForm,
    initialState
  );
  const [rejectState, rejectAction, rejectPending] = useActionState(
    rejectDukkanForm,
    initialState
  );
  const [pendingState, pendingAction, pendingPending] = useActionState(
    pendingDukkanForm,
    initialState
  );

  const feedback =
    approveState.success ??
    approveState.error ??
    rejectState.success ??
    rejectState.error ??
    pendingState.success ??
    pendingState.error;

  const isBusy = approvePending || rejectPending || pendingPending;

  return (
    <article className={localCardClass}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-semibold text-neutral-900">{dukkan.dukkan_adi}</h3>
            <AdminStatusBadge status={dukkan.approval_status} />
          </div>

          <p className="text-sm text-neutral-600">
            Slug:{" "}
            <Link
              href={`/${dukkan.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-emerald-700 hover:text-emerald-800"
            >
              /{dukkan.slug}
            </Link>
          </p>

          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-neutral-500">
            <span>Oluşturulma: {formatDate(dukkan.created_at)}</span>
            {dukkan.telefon && <span>Telefon: {dukkan.telefon}</span>}
            <span>Vitrin: {dukkan.aktif ? "Açık" : "Kapalı"}</span>
          </div>
        </div>

        {canEdit && (
          <div className="flex flex-wrap gap-2">
            {dukkan.approval_status !== "active" && (
              <form action={approveAction}>
                <input type="hidden" name="dukkan_id" value={dukkan.id} />
                <button type="submit" disabled={isBusy} className={localBtnSmallPrimaryClass}>
                  {approvePending ? "Onaylanıyor…" : "Onayla"}
                </button>
              </form>
            )}

            {dukkan.approval_status !== "rejected" && (
              <form action={rejectAction}>
                <input type="hidden" name="dukkan_id" value={dukkan.id} />
                <button type="submit" disabled={isBusy} className={localBtnSmallDangerClass}>
                  {rejectPending ? "Reddediliyor…" : "Reddet"}
                </button>
              </form>
            )}

            {dukkan.approval_status !== "pending" && (
              <form action={pendingAction}>
                <input type="hidden" name="dukkan_id" value={dukkan.id} />
                <button type="submit" disabled={isBusy} className={localBtnSmallSecondaryClass}>
                  {pendingPending ? "Güncelleniyor…" : "İncelemeye Al"}
                </button>
              </form>
            )}
          </div>
        )}
      </div>

      {feedback && (
        <p
          className={cn(
            "mt-3 text-sm",
            feedback.includes("onaylandı") ||
              feedback.includes("güncel") ||
              feedback.includes("incelemeye")
              ? "text-emerald-700"
              : feedback.includes("reddedildi")
                ? "text-amber-700"
                : "text-red-600"
          )}
        >
          {feedback}
        </p>
      )}
    </article>
  );
}

export function LocalDukkanOnayClient({
  dukkanlar,
  canEdit,
}: LocalDukkanOnayClientProps) {
  const [activeTab, setActiveTab] = useState<ApprovalTab>("pending");

  const counts = useMemo(
    () => countDukkanlarByApprovalStatus(dukkanlar),
    [dukkanlar]
  );

  const filtered = useMemo(
    () => dukkanlar.filter((dukkan) => dukkan.approval_status === activeTab),
    [dukkanlar, activeTab]
  );

  return (
    <div className="space-y-8">
      <header className="space-y-3 border-b border-neutral-100 pb-6">
        <p className={localAccentLabelClass}>Moderasyon</p>
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
          Dükkan onay yönetimi
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-neutral-600">
          Onay bekleyen, aktif ve reddedilen dükkan vitrinlerini yönetin. Yalnızca{" "}
          <strong className="font-semibold text-neutral-800">active</strong> statüsündeki
          dükkanlar arama motorlarına indexlenir.
        </p>
        <LocalAuthNotice canEdit={canEdit} nextPath="/local-yonetim/dukkan-onay" />
      </header>

      <section className={cn(localPanelClass, "bg-white")}>
        <h2 className={localSectionTitleClass}>Başvuru durumları</h2>

        <div className="mt-4 flex flex-wrap gap-2 border-b border-neutral-100 pb-4">
          {TAB_ORDER.map((tab) => {
            const config = SHOP_APPROVAL_STATUS_CONFIG[tab];
            const isActive = activeTab === tab;

            return (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "inline-flex min-h-10 items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition",
                  isActive
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "border border-neutral-200 bg-white text-neutral-600 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
                )}
              >
                <span aria-hidden>{config.dot}</span>
                {config.label}
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-xs tabular-nums",
                    isActive ? "bg-emerald-500/30 text-white" : "bg-neutral-100 text-neutral-600"
                  )}
                >
                  {counts[tab]}
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-5 space-y-3">
          {filtered.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-neutral-200 px-4 py-8 text-center text-sm text-neutral-500">
              Bu sekmede listelenecek dükkan yok.
            </p>
          ) : (
            filtered.map((dukkan) => (
              <DukkanApprovalRow key={dukkan.id} dukkan={dukkan} canEdit={canEdit} />
            ))
          )}
        </div>
      </section>
    </div>
  );
}
