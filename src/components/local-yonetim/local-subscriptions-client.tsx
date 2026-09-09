"use client";

import Link from "next/link";
import { useActionState } from "react";
import {
  localAccentLabelClass,
  localAlertErrorClass,
  localAlertInfoClass,
  localAlertSuccessClass,
  localBtnPrimaryClass,
  localBtnSecondaryClass,
  localBtnSmallDangerClass,
  localBtnSmallPrimaryClass,
  localBtnSmallSecondaryClass,
  localWorkspaceSectionClass,
} from "@/components/local-yonetim/local-admin-ui";
import { LocalAuthNotice } from "@/components/local-yonetim/local-auth-notice";
import {
  resetShopFreeLimitsForm,
  setShopTierFreeForm,
  upgradeShopToProForm,
} from "@/lib/local-yonetim/subscriptions/subscription-actions";
import type {
  ShopSubscriptionAdminRow,
  SubscriptionAdminState,
} from "@/lib/local-yonetim/subscriptions/types";
import { cn } from "@/lib/utils/cn";

const initialState: SubscriptionAdminState = {};

type LocalSubscriptionsClientProps = {
  rows: ShopSubscriptionAdminRow[];
  canEdit: boolean;
  loadError?: string;
};

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("tr-TR", {
    dateStyle: "medium",
  }).format(new Date(value));
}

function TierBadge({ tier }: { tier: ShopSubscriptionAdminRow["tier"] }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
        tier === "pro"
          ? "bg-emerald-100 text-emerald-800"
          : "bg-neutral-100 text-neutral-700"
      )}
    >
      {tier === "pro" ? "Pro" : "Free"}
    </span>
  );
}

function SubscriptionRowActions({
  row,
  canEdit,
}: {
  row: ShopSubscriptionAdminRow;
  canEdit: boolean;
}) {
  const [upgradeState, upgradeAction, upgradePending] = useActionState(
    upgradeShopToProForm,
    initialState
  );
  const [resetState, resetAction, resetPending] = useActionState(
    resetShopFreeLimitsForm,
    initialState
  );
  const [freeState, freeAction, freePending] = useActionState(
    setShopTierFreeForm,
    initialState
  );

  const feedback =
    upgradeState.success ??
    upgradeState.error ??
    resetState.success ??
    resetState.error ??
    freeState.success ??
    freeState.error;

  if (!canEdit) return null;

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {row.tier !== "pro" && (
          <form action={upgradeAction}>
            <input type="hidden" name="dukkan_id" value={row.dukkan_id} />
            <input type="hidden" name="pro_months" value="12" />
            <button type="submit" disabled={upgradePending} className={localBtnSmallPrimaryClass}>
              {upgradePending ? "…" : "Pro Yap"}
            </button>
          </form>
        )}

        <form action={resetAction}>
          <input type="hidden" name="dukkan_id" value={row.dukkan_id} />
          <button type="submit" disabled={resetPending} className={localBtnSmallSecondaryClass}>
            {resetPending ? "…" : "Kota Sıfırla"}
          </button>
        </form>

        {row.tier === "pro" && (
          <form action={freeAction}>
            <input type="hidden" name="dukkan_id" value={row.dukkan_id} />
            <button type="submit" disabled={freePending} className={localBtnSmallDangerClass}>
              {freePending ? "…" : "Free'ye Al"}
            </button>
          </form>
        )}
      </div>

      {feedback && (
        <p
          className={cn(
            "text-xs",
            feedback.includes("yükseltildi") ||
              feedback.includes("sıfırlandı") ||
              feedback.includes("alındı")
              ? "text-emerald-700"
              : "text-red-600"
          )}
        >
          {feedback}
        </p>
      )}
    </div>
  );
}

export function LocalSubscriptionsClient({
  rows,
  canEdit,
  loadError,
}: LocalSubscriptionsClientProps) {
  const proCount = rows.filter((row) => row.tier === "pro").length;
  const freeCount = rows.length - proCount;

  return (
    <div className="space-y-8">
      <header className="space-y-4 border-b border-neutral-100 pb-6">
        <p className={localAccentLabelClass}>Abonelik</p>
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
          Abonelik & kota yönetimi
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-neutral-600">
          Kayıtlı dükkanların katmanını (Free/Pro), kota kullanımını ve bitiş
          tarihlerini yönetin. Kullanım; cihaz ilanı, blog ve servis kayıtlarından
          türetilir.
        </p>

        <LocalAuthNotice canEdit={canEdit} nextPath="/local-yonetim/abonelikler" />

        {loadError && <p className={localAlertErrorClass}>Veritabanı hatası: {loadError}</p>}

        <div className="grid gap-3 sm:grid-cols-3">
          <div className={cn(localWorkspaceSectionClass, "bg-emerald-50/40 border-emerald-100 py-4")}>
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Toplam</p>
            <p className="mt-1 text-2xl font-bold text-emerald-900">{rows.length}</p>
          </div>
          <div className={localWorkspaceSectionClass}>
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Pro</p>
            <p className="mt-1 text-2xl font-bold text-neutral-900">{proCount}</p>
          </div>
          <div className={localWorkspaceSectionClass}>
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Free</p>
            <p className="mt-1 text-2xl font-bold text-neutral-900">{freeCount}</p>
          </div>
        </div>
      </header>

      <section className={localWorkspaceSectionClass}>
        <div className="overflow-x-auto rounded-2xl border border-neutral-100">
          <table className="min-w-full divide-y divide-neutral-100 text-sm">
            <thead className="bg-neutral-50/80">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-neutral-700">Dükkan</th>
                <th className="px-4 py-3 text-left font-semibold text-neutral-700">Katman</th>
                <th className="px-4 py-3 text-left font-semibold text-neutral-700">Kota</th>
                <th className="hidden px-4 py-3 text-left font-semibold text-neutral-700 lg:table-cell">
                  Kullanım
                </th>
                <th className="px-4 py-3 text-left font-semibold text-neutral-700">Bitiş</th>
                <th className="px-4 py-3 text-left font-semibold text-neutral-700">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 bg-white">
              {rows.map((row) => (
                <tr key={row.dukkan_id} className="align-top hover:bg-emerald-50/30">
                  <td className="px-4 py-4">
                    <p className="font-medium text-neutral-900">{row.dukkan_adi}</p>
                    <Link
                      href={`/${row.slug}`}
                      target="_blank"
                      className="mt-0.5 font-mono text-xs text-emerald-700 hover:underline"
                    >
                      /{row.slug}
                    </Link>
                    {!row.isPersisted && (
                      <span className="mt-2 block text-[10px] text-neutral-400">
                        Abonelik kaydı yok — varsayılan Free
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <TierBadge tier={row.tier} />
                  </td>
                  <td className="px-4 py-4 tabular-nums text-neutral-700">
                    {row.actions_used}/{row.actions_limit}
                  </td>
                  <td className="hidden px-4 py-4 text-xs text-neutral-600 lg:table-cell">
                    <p>Cihaz: {row.usage_devices}</p>
                    <p>Blog: {row.usage_blog}</p>
                    <p>Servis: {row.usage_servis}</p>
                    <p className="mt-1 font-medium text-neutral-800">Toplam: {row.usage_total}</p>
                  </td>
                  <td className="px-4 py-4 text-neutral-700">{formatDate(row.expires_at)}</td>
                  <td className="px-4 py-4">
                    <SubscriptionRowActions row={row} canEdit={canEdit} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {rows.length === 0 && (
          <p className={cn("mt-4", localAlertInfoClass)}>Henüz kayıtlı dükkan bulunmuyor.</p>
        )}
      </section>
    </div>
  );
}
