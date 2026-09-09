"use client";

import { useActionState, type ReactNode } from "react";
import {
  localAccentLabelClass,
  localBtnPrimaryClass,
  localBtnSecondaryClass,
  localCheckboxClass,
  localHintClass,
  localInputClass,
  localLabelClass,
  localPanelClass,
  localSectionTitleClass,
  localTextareaClass,
} from "@/components/local-yonetim/local-admin-ui";
import { LocalAuthNotice } from "@/components/local-yonetim/local-auth-notice";
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

type LocalPricingClientProps = {
  plans: PricingPlan[];
  canEdit: boolean;
};

function LocalField({
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
      <label className={localLabelClass}>{label}</label>
      {children}
      {hint && <p className={localHintClass}>{hint}</p>}
    </div>
  );
}

function PlanEditorForm({
  plan,
  canEdit,
}: {
  plan: PricingPlan;
  canEdit: boolean;
}) {
  const [state, formAction, isPending] = useActionState(upsertPricingPlan, initialState);
  const [deleteState, deleteAction, deletePending] = useActionState(
    deletePricingPlanForm,
    initialState
  );

  const isDefaultId = plan.id.startsWith("default-");

  return (
    <div className="space-y-3">
      <form
        action={formAction}
        className={cn(localPanelClass, "space-y-4 bg-white")}
      >
        <input type="hidden" name="id" value={isDefaultId ? "" : plan.id} />
        <input type="hidden" name="segment" value={plan.segment} />
        <input type="hidden" name="plan_key" value={plan.plan_key} />

        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-100 pb-4">
          <div>
            <p className={localAccentLabelClass}>
              {PRICING_SEGMENT_LABELS[plan.segment]}
            </p>
            <p className="mt-1 text-base font-semibold text-neutral-900">
              {plan.plan_key}
            </p>
          </div>

          <div className="flex flex-wrap gap-4 text-xs text-neutral-600">
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                name="is_popular"
                value="true"
                defaultChecked={plan.is_popular}
                disabled={!canEdit}
                className={localCheckboxClass}
              />
              Popüler
            </label>
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                name="is_active"
                value="true"
                defaultChecked={plan.is_active}
                disabled={!canEdit}
                className={localCheckboxClass}
              />
              Aktif
            </label>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <LocalField label="Plan adı">
            <input
              name="name"
              defaultValue={plan.name}
              required
              disabled={!canEdit}
              className={localInputClass}
            />
          </LocalField>
          <LocalField label="Sıra">
            <input
              name="sort_order"
              type="number"
              defaultValue={plan.sort_order}
              disabled={!canEdit}
              className={localInputClass}
            />
          </LocalField>
        </div>

        <LocalField label="Açıklama">
          <textarea
            name="description"
            rows={2}
            defaultValue={plan.description ?? ""}
            disabled={!canEdit}
            className={localTextareaClass}
          />
        </LocalField>

        <div className="grid gap-4 sm:grid-cols-3">
          <LocalField label="Aylık fiyat">
            <input
              name="price_monthly"
              type="number"
              step="0.01"
              defaultValue={plan.price_monthly}
              disabled={!canEdit}
              className={localInputClass}
            />
          </LocalField>
          <LocalField label="Yıllık fiyat">
            <input
              name="price_yearly"
              type="number"
              step="0.01"
              defaultValue={plan.price_yearly}
              disabled={!canEdit}
              className={localInputClass}
            />
          </LocalField>
          <LocalField label="Para birimi">
            <input
              name="currency"
              defaultValue={plan.currency}
              disabled={!canEdit}
              className={localInputClass}
            />
          </LocalField>
        </div>

        <LocalField
          label="Özellikler"
          hint="Her satır landing sayfasında ayrı bir madde olarak gösterilir."
        >
          <textarea
            name="features"
            rows={5}
            defaultValue={plan.features.join("\n")}
            disabled={!canEdit}
            className={cn(localTextareaClass, "min-h-[120px] font-mono text-xs")}
          />
        </LocalField>

        <div className="grid gap-4 sm:grid-cols-2">
          <LocalField label="CTA metni">
            <input
              name="cta_label"
              defaultValue={plan.cta_label ?? ""}
              disabled={!canEdit}
              className={localInputClass}
            />
          </LocalField>
          <LocalField label="CTA link">
            <input
              name="cta_href"
              defaultValue={plan.cta_href ?? ""}
              disabled={!canEdit}
              className={localInputClass}
            />
          </LocalField>
        </div>

        {state.error && (
          <p
            role="alert"
            className="rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-700"
          >
            {state.error}
          </p>
        )}
        {state.success && (
          <p className="rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
            {state.success}
          </p>
        )}

        {canEdit && (
          <button type="submit" disabled={isPending} className={localBtnPrimaryClass}>
            {isPending ? "Kaydediliyor…" : "Planı Kaydet"}
          </button>
        )}
      </form>

      {canEdit && !isDefaultId && (
        <form action={deleteAction} className="px-1">
          <input type="hidden" name="plan_id" value={plan.id} />
          <button
            type="submit"
            disabled={deletePending}
            className="text-xs font-medium text-red-600 transition hover:text-red-700 disabled:opacity-50"
          >
            {deletePending ? "Siliniyor…" : "Planı sil"}
          </button>
          {deleteState.error && (
            <p className="mt-1 text-xs text-red-600">{deleteState.error}</p>
          )}
        </form>
      )}
    </div>
  );
}

function SeedButton({ canEdit }: { canEdit: boolean }) {
  const [state, formAction, isPending] = useActionState(
    seedDefaultPricingPlansForm,
    initialState
  );

  if (!canEdit) return null;

  return (
    <form action={formAction}>
      <button type="submit" disabled={isPending} className={localBtnSecondaryClass}>
        {isPending ? "Aktarılıyor…" : "Varsayılan Planları DB'ye Aktar"}
      </button>
      {state.error && (
        <p role="alert" className="mt-2 text-sm text-red-600">
          {state.error}
        </p>
      )}
      {state.success && (
        <p className="mt-2 text-sm text-emerald-700">{state.success}</p>
      )}
    </form>
  );
}

export function LocalPricingClient({ plans, canEdit }: LocalPricingClientProps) {
  const esnafPlans = plans.filter((p) => p.segment === "esnaf");
  const toptanciPlans = plans.filter((p) => p.segment === "toptanci");

  return (
    <div className="space-y-8">
      <header className="space-y-3 border-b border-neutral-100 pb-6">
        <p className={localAccentLabelClass}>Fiyatlandırma</p>
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
          Landing paket fiyatları
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-neutral-600">
          Ana sayfadaki Esnaf ve Toptancı abonelik paketlerini buradan yönetin.
          Tablo boşsa landing varsayılan statik planlarla çalışmaya devam eder.
        </p>

        {!canEdit && (
          <LocalAuthNotice canEdit={canEdit} nextPath="/local-yonetim/fiyatlar" />
        )}

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <SeedButton canEdit={canEdit} />
        </div>
      </header>

      {(["esnaf", "toptanci"] as const).map((segment) => {
        const segmentPlans = segment === "esnaf" ? esnafPlans : toptanciPlans;

        return (
          <section key={segment} className="space-y-4">
            <h2 className={localSectionTitleClass}>
              {PRICING_SEGMENT_LABELS[segment]} planları
            </h2>
            <div className="grid gap-5 xl:grid-cols-2">
              {segmentPlans.map((plan) => (
                <PlanEditorForm
                  key={`${plan.segment}-${plan.plan_key}`}
                  plan={plan}
                  canEdit={canEdit}
                />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
