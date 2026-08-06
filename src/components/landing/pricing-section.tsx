"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { getSignupHref } from "@/lib/auth/roles";
import { formatPlanPrice } from "@/lib/pricing/format-price";
import type { BillingPeriod, PricingPlan, PricingSegment } from "@/lib/pricing/types";
import { PRICING_SEGMENT_LABELS } from "@/lib/pricing/types";
import { cn } from "@/lib/utils/cn";

function CheckIcon() {
  return (
    <svg className="h-4 w-4 shrink-0 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
    </svg>
  );
}

function planCtaHref(plan: PricingPlan): string {
  if (plan.cta_href && plan.cta_href !== "/giris") {
    return plan.cta_href;
  }
  return getSignupHref(plan.segment);
}

function PricingCard({
  plan,
  billing,
}: {
  plan: PricingPlan;
  billing: BillingPeriod;
}) {
  const price = billing === "monthly" ? plan.price_monthly : plan.price_yearly;
  const periodLabel = billing === "monthly" ? "/ ay" : "/ yıl";

  if (plan.is_popular) {
    return (
      <div className="relative overflow-hidden rounded-[1.75rem]">
        <div
          aria-hidden
          className="pointer-events-none absolute -inset-1 rounded-[1.75rem] bg-gradient-to-br from-emerald-400 via-teal-400 to-cyan-400 opacity-80 blur-md"
        />
        <article className="relative flex h-full flex-col overflow-hidden rounded-3xl border border-emerald-300/60 bg-gradient-to-b from-emerald-50 via-white to-white p-6 shadow-[0_0_48px_rgba(16,185,129,0.28)] sm:p-7">
          <div className="absolute right-5 top-5 rounded-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-white shadow-[0_0_16px_rgba(16,185,129,0.5)]">
            En Popüler
          </div>

          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-600">
            {PRICING_SEGMENT_LABELS[plan.segment]}
          </p>
          <h3 className="mt-2 text-2xl font-bold text-slate-900">{plan.name}</h3>
          {plan.description && (
            <p className="mt-2 text-sm leading-relaxed text-slate-500">{plan.description}</p>
          )}

          <div className="mt-6 flex items-end gap-1">
            <span className="bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-500 bg-clip-text text-4xl font-black tabular-nums text-transparent">
              {formatPlanPrice(price, plan.currency)}
            </span>
            <span className="mb-1 text-sm font-medium text-slate-400">{periodLabel}</span>
          </div>

          <ul className="mt-6 flex-1 space-y-3">
            {plan.features.map((feature) => (
              <li key={feature} className="flex items-start gap-2.5 text-sm text-slate-600">
                <CheckIcon />
                <span>{feature}</span>
              </li>
            ))}
          </ul>

          <Link
            href={planCtaHref(plan)}
            className="mt-8 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 px-6 text-sm font-bold text-white shadow-[0_0_24px_rgba(16,185,129,0.45)] transition hover:shadow-[0_0_32px_rgba(16,185,129,0.6)] sm:w-auto md:hover:scale-[1.02]"
          >
            {plan.cta_label ?? "Hemen Başla"}
          </Link>
        </article>
      </div>
    );
  }

  return (
    <article className="flex h-full flex-col rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-emerald-200 hover:shadow-md sm:p-7">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
        {PRICING_SEGMENT_LABELS[plan.segment]}
      </p>
      <h3 className="mt-2 text-2xl font-bold text-slate-900">{plan.name}</h3>
      {plan.description && (
        <p className="mt-2 text-sm leading-relaxed text-slate-500">{plan.description}</p>
      )}

      <div className="mt-6 flex items-end gap-1">
        <span className="text-4xl font-black tabular-nums text-slate-900">
          {formatPlanPrice(price, plan.currency)}
        </span>
        <span className="mb-1 text-sm font-medium text-slate-400">{periodLabel}</span>
      </div>

      <ul className="mt-6 flex-1 space-y-3">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2.5 text-sm text-slate-600">
            <CheckIcon />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <Link
        href={planCtaHref(plan)}
        className="mt-8 inline-flex min-h-12 items-center justify-center rounded-full border border-slate-200 bg-white px-6 text-sm font-semibold text-slate-800 transition hover:border-emerald-300 hover:text-emerald-700"
      >
        {plan.cta_label ?? "Hemen Başla"}
      </Link>
    </article>
  );
}

export function PricingSection({ plans }: { plans: PricingPlan[] }) {
  const [segment, setSegment] = useState<PricingSegment>("esnaf");
  const [billing, setBilling] = useState<BillingPeriod>("monthly");

  const visiblePlans = useMemo(
    () =>
      plans
        .filter((plan) => plan.segment === segment && plan.is_active)
        .sort((a, b) => a.sort_order - b.sort_order),
    [plans, segment]
  );

  return (
    <section id="fiyatlandirma" className="overflow-x-hidden px-4 py-20 sm:px-6 md:py-28">
      <div className="mx-auto w-full min-w-0 max-w-6xl">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Şeffaf{" "}
            <span className="bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-500 bg-clip-text text-transparent">
              fiyatlandırma
            </span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-slate-500">
            Esnaf ve toptancı için ayrı paketler. Aylık veya yıllık ödeyin; yıllık
            planda 2 ay bedava.
          </p>
        </div>

        <div className="mt-10 flex flex-col items-center gap-5 sm:flex-row sm:justify-center">
          <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 p-1">
            {(["esnaf", "toptanci"] as const).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setSegment(key)}
                className={cn(
                  "rounded-full px-5 py-2.5 text-sm font-semibold transition",
                  segment === key
                    ? "bg-gradient-to-r from-emerald-500 to-teal-400 text-white shadow-[0_0_20px_rgba(16,185,129,0.35)]"
                    : "text-slate-600 hover:text-emerald-600"
                )}
              >
                {PRICING_SEGMENT_LABELS[key]}
              </button>
            ))}
          </div>

          <div className="inline-flex items-center gap-3 rounded-full border border-slate-200 bg-white px-2 py-1.5">
            <button
              type="button"
              onClick={() => setBilling("monthly")}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-semibold transition",
                billing === "monthly" ? "bg-slate-900 text-white" : "text-slate-500"
              )}
            >
              Aylık
            </button>
            <button
              type="button"
              onClick={() => setBilling("yearly")}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-semibold transition",
                billing === "yearly"
                  ? "bg-gradient-to-r from-emerald-500 to-teal-400 text-white shadow-[0_0_16px_rgba(16,185,129,0.3)]"
                  : "text-slate-500"
              )}
            >
              Yıllık
            </button>
            <span className="hidden rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-700 sm:inline">
              2 ay bedava
            </span>
          </div>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          {visiblePlans.map((plan) => (
            <PricingCard key={plan.id} plan={plan} billing={billing} />
          ))}
        </div>
      </div>
    </section>
  );
}
