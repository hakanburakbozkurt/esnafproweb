"use client";

import { useActionState, type ReactNode } from "react";
import { AdminNav } from "@/components/yonetim/admin-nav";
import {
  adminBtnPrimaryClass,
  adminBtnSecondaryClass,
  adminCheckboxClass,
  adminInputClass,
  adminPanelClass,
} from "@/components/yonetim/admin-ui";
import {
  deletePricingPlanForm,
  seedDefaultPricingPlansForm,
  upsertPricingPlan,
  type PricingAdminState,
} from "@/lib/pricing/pricing-actions";
import type { PricingPlan } from "@/lib/pricing/types";
import { PRICING_SEGMENT_LABELS } from "@/lib/pricing/types";
import { cn } from "@/lib/utils/cn";

const initialState: PricingAdminState = {};

function DarkField({
  label,
  children,
  hint,
}: {
  label: string;
  children: ReactNode;
  hint?: string;
}) {
  return (
    <div>
      <label className="text-sm font-medium text-zinc-300">{label}</label>
      {children}
      {hint && <p className="mt-1.5 text-xs text-zinc-500">{hint}</p>}
    </div>
  );
}

function PlanEditorForm({ plan }: { plan: PricingPlan }) {
  const [state, formAction, isPending] = useActionState(upsertPricingPlan, initialState);
  const [deleteState, deleteAction, deletePending] = useActionState(
    deletePricingPlanForm,
    initialState
  );

  const isDefaultId = plan.id.startsWith("default-");

  return (
    <div className="space-y-3">
      <form action={formAction} className={cn(adminPanelClass, "space-y-4")}>
        <input type="hidden" name="id" value={isDefaultId ? "" : plan.id} />
        <input type="hidden" name="segment" value={plan.segment} />
        <input type="hidden" name="plan_key" value={plan.plan_key} />

        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800 pb-4">
          <p className="text-sm font-semibold text-zinc-100">
            {PRICING_SEGMENT_LABELS[plan.segment]} · {plan.plan_key}
          </p>
          <div className="flex flex-wrap gap-3 text-xs text-zinc-400 sm:gap-4">
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                name="is_popular"
                value="true"
                defaultChecked={plan.is_popular}
                className={adminCheckboxClass}
              />
              Popüler
            </label>
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                name="is_active"
                value="true"
                defaultChecked={plan.is_active}
                className={adminCheckboxClass}
              />
              Aktif
            </label>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <DarkField label="Plan adı">
            <input
              name="name"
              defaultValue={plan.name}
              required
              className={adminInputClass}
            />
          </DarkField>
          <DarkField label="Sıra">
            <input
              name="sort_order"
              type="number"
              defaultValue={plan.sort_order}
              className={adminInputClass}
            />
          </DarkField>
        </div>

        <DarkField label="Açıklama">
          <textarea
            name="description"
            rows={2}
            defaultValue={plan.description ?? ""}
            className={cn(adminInputClass, "min-h-[80px] resize-y")}
          />
        </DarkField>

        <div className="grid gap-3 sm:grid-cols-3">
          <DarkField label="Aylık fiyat">
            <input
              name="price_monthly"
              type="number"
              step="0.01"
              defaultValue={plan.price_monthly}
              className={adminInputClass}
            />
          </DarkField>
          <DarkField label="Yıllık fiyat">
            <input
              name="price_yearly"
              type="number"
              step="0.01"
              defaultValue={plan.price_yearly}
              className={adminInputClass}
            />
          </DarkField>
          <DarkField label="Para birimi">
            <input name="currency" defaultValue={plan.currency} className={adminInputClass} />
          </DarkField>
        </div>

        <DarkField label="Özellikler (her satır bir madde)">
          <textarea
            name="features"
            rows={5}
            defaultValue={plan.features.join("\n")}
            className={cn(adminInputClass, "min-h-[120px] resize-y font-mono")}
          />
        </DarkField>

        <div className="grid gap-3 sm:grid-cols-2">
          <DarkField label="CTA metni">
            <input
              name="cta_label"
              defaultValue={plan.cta_label ?? ""}
              className={adminInputClass}
            />
          </DarkField>
          <DarkField label="CTA link">
            <input
              name="cta_href"
              defaultValue={plan.cta_href ?? ""}
              className={adminInputClass}
            />
          </DarkField>
        </div>

        {state.error && (
          <p className="rounded-lg border border-red-900/50 bg-red-950/40 px-3 py-2 text-sm text-red-300">
            {state.error}
          </p>
        )}
        {state.success && (
          <p className="rounded-lg border border-emerald-900/50 bg-emerald-950/30 px-3 py-2 text-sm text-emerald-300">
            {state.success}
          </p>
        )}

        <button type="submit" disabled={isPending} className={adminBtnPrimaryClass}>
          {isPending ? "Kaydediliyor…" : "Planı Kaydet"}
        </button>
      </form>

      {!isDefaultId && (
        <form action={deleteAction} className="px-1">
          <input type="hidden" name="plan_id" value={plan.id} />
          <button
            type="submit"
            disabled={deletePending}
            className="text-xs font-medium text-red-400 transition hover:text-red-300 disabled:opacity-50"
          >
            {deletePending ? "Siliniyor…" : "Planı sil"}
          </button>
          {deleteState.error && (
            <p className="mt-1 text-xs text-red-400">{deleteState.error}</p>
          )}
        </form>
      )}
    </div>
  );
}

function SeedButton() {
  const [state, formAction, isPending] = useActionState(
    seedDefaultPricingPlansForm,
    initialState
  );

  return (
    <form action={formAction}>
      <button type="submit" disabled={isPending} className={adminBtnSecondaryClass}>
        {isPending ? "Aktarılıyor…" : "Varsayılan Planları DB'ye Aktar"}
      </button>
      {state.error && (
        <p className="mt-2 text-sm text-red-400">{state.error}</p>
      )}
      {state.success && (
        <p className="mt-2 text-sm text-emerald-400">{state.success}</p>
      )}
    </form>
  );
}

export function PricingAdminClient({ plans }: { plans: PricingPlan[] }) {
  const esnafPlans = plans.filter((p) => p.segment === "esnaf");
  const toptanciPlans = plans.filter((p) => p.segment === "toptanci");

  return (
    <div className="space-y-8">
      <section className={adminPanelClass}>
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-indigo-400">
          Super Admin
        </p>
        <h2 className="mt-2 text-xl font-bold text-zinc-100">Fiyatlandırma Yönetimi</h2>
        <p className="mt-2 text-sm leading-relaxed text-zinc-400">
          Landing sayfasındaki paketler buradan dinamik güncellenir. Tablo boşsa ana
          sayfa varsayılan statik planlarla çalışmaya devam eder.
        </p>
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <SeedButton />
          <AdminNav current="fiyatlar" />
        </div>
      </section>

      {(["esnaf", "toptanci"] as const).map((segment) => {
        const segmentPlans = segment === "esnaf" ? esnafPlans : toptanciPlans;
        return (
          <section key={segment} className={adminPanelClass}>
            <h3 className="mb-5 border-b border-zinc-800 pb-4 text-lg font-bold text-zinc-100">
              {PRICING_SEGMENT_LABELS[segment]} Planları
            </h3>
            <div className="grid gap-4 xl:grid-cols-2">
              {segmentPlans.map((plan) => (
                <PlanEditorForm key={`${plan.segment}-${plan.plan_key}`} plan={plan} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
