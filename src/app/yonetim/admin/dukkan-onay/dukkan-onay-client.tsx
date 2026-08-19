"use client";

import Link from "next/link";
import { useActionState, useMemo, useState } from "react";
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
} from "@/lib/dukkan/get-admin-dukkanlar";
import { cn } from "@/lib/utils/cn";

const initialState: DukkanApprovalAdminState = {};

const panelClass = "rounded-2xl border border-zinc-800 bg-zinc-900 p-5 sm:p-6";

const btnPrimaryClass =
  "inline-flex min-h-9 items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50";

const btnSecondaryClass =
  "inline-flex min-h-9 items-center justify-center rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-xs font-semibold text-zinc-100 transition hover:border-zinc-600 hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-50";

const btnDangerClass =
  "inline-flex min-h-9 items-center justify-center rounded-lg border border-rose-900/80 bg-rose-950/50 px-4 py-2 text-xs font-semibold text-rose-300 transition hover:border-rose-800 hover:bg-rose-950 disabled:cursor-not-allowed disabled:opacity-50";

const adminStatusBadgeClass: Record<ShopApprovalStatus, string> = {
  active: "border-emerald-800/60 bg-emerald-950/40 text-emerald-300",
  pending: "border-amber-800/60 bg-amber-950/40 text-amber-300",
  rejected: "border-rose-800/60 bg-rose-950/40 text-rose-300",
};

type ApprovalTab = ShopApprovalStatus;

const TAB_ORDER: ApprovalTab[] = ["pending", "active", "rejected"];

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
        adminStatusBadgeClass[status]
      )}
    >
      <span aria-hidden>{config.dot}</span>
      {config.label}
    </span>
  );
}

function DukkanApprovalRow({ dukkan }: { dukkan: AdminDukkanListItem }) {
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
    <article className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4 sm:p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-semibold text-zinc-100">
              {dukkan.dukkan_adi}
            </h3>
            <AdminStatusBadge status={dukkan.approval_status} />
          </div>

          <p className="text-sm text-zinc-400">
            Slug:{" "}
            <Link
              href={`/${dukkan.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-indigo-300 hover:text-indigo-200"
            >
              /{dukkan.slug}
            </Link>
          </p>

          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-zinc-500">
            <span>Oluşturulma: {formatDate(dukkan.created_at)}</span>
            {dukkan.telefon && <span>Telefon: {dukkan.telefon}</span>}
            <span>Vitrin: {dukkan.aktif ? "Açık" : "Kapalı"}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {dukkan.approval_status !== "active" && (
            <form action={approveAction}>
              <input type="hidden" name="dukkan_id" value={dukkan.id} />
              <button type="submit" disabled={isBusy} className={btnPrimaryClass}>
                {approvePending ? "Onaylanıyor…" : "Onayla"}
              </button>
            </form>
          )}

          {dukkan.approval_status !== "rejected" && (
            <form action={rejectAction}>
              <input type="hidden" name="dukkan_id" value={dukkan.id} />
              <button type="submit" disabled={isBusy} className={btnDangerClass}>
                {rejectPending ? "Reddediliyor…" : "Reddet"}
              </button>
            </form>
          )}

          {dukkan.approval_status !== "pending" && (
            <form action={pendingAction}>
              <input type="hidden" name="dukkan_id" value={dukkan.id} />
              <button type="submit" disabled={isBusy} className={btnSecondaryClass}>
                {pendingPending ? "Güncelleniyor…" : "İncelemeye Al"}
              </button>
            </form>
          )}
        </div>
      </div>

      {feedback && (
        <p
          className={cn(
            "mt-3 text-sm",
            feedback.includes("onaylandı") ||
              feedback.includes("güncel") ||
              feedback.includes("incelemeye")
              ? "text-emerald-400"
              : feedback.includes("reddedildi")
                ? "text-amber-400"
                : "text-red-400"
          )}
        >
          {feedback}
        </p>
      )}
    </article>
  );
}

export function DukkanOnayAdminClient({
  dukkanlar,
}: {
  dukkanlar: AdminDukkanListItem[];
}) {
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
      <section className={panelClass}>
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-indigo-400">
          Super Admin
        </p>
        <h2 className="mt-2 text-xl font-bold text-zinc-100">Dükkan Onay Yönetimi</h2>
        <p className="mt-2 text-sm leading-relaxed text-zinc-400">
          Onay bekleyen, aktif ve reddedilen dükkan vitrinlerini yönetin. Yalnızca{" "}
          <strong className="font-semibold text-zinc-200">active</strong> statüsündeki
          dükkanlar arama motorlarına indexlenir.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <a href="/yonetim/admin/fiyatlar" className={btnSecondaryClass}>
            Fiyat Yönetimi
          </a>
          <a href="/yonetim/admin/sss" className={btnSecondaryClass}>
            SSS Yönetimi
          </a>
        </div>
      </section>

      <section className={panelClass}>
        <div className="flex flex-wrap gap-2 border-b border-zinc-800 pb-4">
          {TAB_ORDER.map((tab) => {
            const config = SHOP_APPROVAL_STATUS_CONFIG[tab];
            const isActive = activeTab === tab;

            return (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "inline-flex min-h-10 items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition",
                  isActive
                    ? "bg-indigo-600 text-white"
                    : "border border-zinc-700 bg-zinc-800 text-zinc-300 hover:border-zinc-600 hover:bg-zinc-700"
                )}
              >
                <span aria-hidden>{config.dot}</span>
                {config.label}
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-xs tabular-nums",
                    isActive ? "bg-indigo-500/40 text-white" : "bg-zinc-900 text-zinc-400"
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
            <p className="rounded-xl border border-dashed border-zinc-800 px-4 py-8 text-center text-sm text-zinc-500">
              Bu sekmede listelenecek dükkan yok.
            </p>
          ) : (
            filtered.map((dukkan) => (
              <DukkanApprovalRow key={dukkan.id} dukkan={dukkan} />
            ))
          )}
        </div>
      </section>
    </div>
  );
}
