"use client";

import { CreditCard, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  buildInstallmentPlans,
  DEFAULT_INSTALLMENT_TIERS,
  formatInstallmentCurrency,
  formatInstallmentRate,
  getLowestInstallmentPlan,
  isValidInstallmentSalePrice,
  type InstallmentEstimateConfig,
  type InstallmentPlan,
} from "@/lib/marketplace/installment-estimate";
import { cn } from "@/lib/utils/cn";

const DEFAULT_INSTALLMENT_CONFIG: InstallmentEstimateConfig = {
  tiers: DEFAULT_INSTALLMENT_TIERS,
};

type InstallmentOptionsCardProps = {
  salePrice: number | null | undefined;
  productTitle: string;
  acceptsInstallments: boolean;
  installmentConfig?: InstallmentEstimateConfig;
  className?: string;
};

export function InstallmentOptionsCard({
  salePrice,
  productTitle,
  acceptsInstallments,
  installmentConfig,
  className,
}: InstallmentOptionsCardProps) {
  const [open, setOpen] = useState(false);
  const config = installmentConfig ?? DEFAULT_INSTALLMENT_CONFIG;

  const plans = useMemo(
    () =>
      acceptsInstallments && isValidInstallmentSalePrice(salePrice)
        ? buildInstallmentPlans(salePrice, config)
        : [],
    [acceptsInstallments, salePrice, config]
  );

  const lowestPlan = useMemo(() => getLowestInstallmentPlan(plans), [plans]);

  if (
    !acceptsInstallments ||
    !isValidInstallmentSalePrice(salePrice) ||
    !plans.length ||
    !lowestPlan
  ) {
    return null;
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "inline-flex w-full items-center gap-2 rounded-2xl border border-neutral-100 bg-neutral-50/80 px-3.5 py-2.5 text-left text-sm transition-colors duration-200 hover:border-emerald-200 hover:bg-emerald-50/60",
          className
        )}
      >
        <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-600 shadow-sm ring-1 ring-emerald-100">
          <CreditCard className="size-4" aria-hidden />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-semibold text-neutral-900">
            Kredi kartına taksit imkanı
          </span>
          <span className="mt-0.5 block text-xs text-emerald-700">
            {lowestPlan.months} ay ×{" "}
            {formatInstallmentCurrency(lowestPlan.monthlyPayment)} tahmini
          </span>
        </span>
        <span className="shrink-0 text-xs font-semibold text-emerald-600">
          Hesapla
        </span>
      </button>

      <InstallmentModal
        open={open}
        onClose={() => setOpen(false)}
        productTitle={productTitle}
        plans={plans}
        defaultMonths={lowestPlan.months}
      />
    </>
  );
}

type InstallmentModalDialogProps = {
  open: boolean;
  onClose: () => void;
  productTitle: string;
  plans: InstallmentPlan[];
  defaultMonths: number;
};

function InstallmentModal({
  open,
  onClose,
  productTitle,
  plans,
  defaultMonths,
}: InstallmentModalDialogProps) {
  const [selectedMonths, setSelectedMonths] = useState(defaultMonths);
  const [entered, setEntered] = useState(false);

  const selectedPlan =
    plans.find((plan) => plan.months === selectedMonths) ?? plans[0] ?? null;

  useEffect(() => {
    if (open) {
      setSelectedMonths(defaultMonths);
      const frame = requestAnimationFrame(() => setEntered(true));
      return () => cancelAnimationFrame(frame);
    }

    setEntered(false);
  }, [open, defaultMonths]);

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  if (!open || typeof document === "undefined" || !plans.length || !selectedPlan) {
    return null;
  }

  return createPortal(
    <div
      className={cn(
        "fixed inset-0 z-[200] flex items-end justify-center p-4 transition-opacity duration-200 sm:items-center",
        entered ? "bg-neutral-900/45 opacity-100" : "bg-neutral-900/0 opacity-0"
      )}
    >
      <button
        type="button"
        aria-label="Taksit hesaplayıcıyı kapat"
        className="absolute inset-0"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="installment-modal-title"
        className={cn(
          "relative z-[201] max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-neutral-100 bg-white p-6 shadow-xl transition-all duration-200 ease-out sm:p-7",
          entered
            ? "translate-y-0 scale-100 opacity-100"
            : "translate-y-2 scale-[0.98] opacity-0 sm:translate-y-0"
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b border-neutral-100 pb-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-600">
              Taksit Önizleme
            </p>
            <h2
              id="installment-modal-title"
              className="mt-1 text-lg font-bold text-neutral-900"
            >
              Tahmini Aylık Ödeme
            </h2>
            <p className="mt-1 line-clamp-2 text-sm text-neutral-500">
              {productTitle}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Kapat"
            className="inline-flex size-9 shrink-0 items-center justify-center rounded-full border border-neutral-200 text-neutral-500 transition hover:bg-neutral-50"
          >
            <X className="size-4" />
          </button>
        </div>

        <div
          role="tablist"
          aria-label="Taksit vadesi seçimi"
          className="mt-4 grid grid-cols-4 gap-2"
        >
          {plans.map((plan) => {
            const active = plan.months === selectedPlan.months;
            return (
              <button
                key={plan.months}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setSelectedMonths(plan.months)}
                className={cn(
                  "rounded-2xl border px-2 py-2.5 text-center text-xs font-semibold transition-colors duration-200 sm:text-sm",
                  active
                    ? "border-emerald-300 bg-emerald-50 text-emerald-800 shadow-sm"
                    : "border-neutral-100 bg-neutral-50/80 text-neutral-600 hover:border-emerald-200 hover:text-emerald-700"
                )}
              >
                {plan.months} ay
              </button>
            );
          })}
        </div>

        <div className="mt-4 space-y-2 rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4">
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="text-neutral-600">Peşin fiyat</span>
            <span className="font-semibold text-neutral-900">
              {formatInstallmentCurrency(selectedPlan.cashPrice)}
            </span>
          </div>
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="text-neutral-600">Vade farkı (tahmini)</span>
            <span className="font-semibold text-amber-800">
              +{formatInstallmentCurrency(selectedPlan.vadeFarki)}
            </span>
          </div>
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="text-neutral-600">Toplam geri ödeme</span>
            <span className="font-semibold text-neutral-900">
              {formatInstallmentCurrency(selectedPlan.totalPayment)}
            </span>
          </div>
          <div className="border-t border-emerald-100/80 pt-3">
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.12em] text-emerald-700/80">
                  Aylık taksit
                </p>
                <p className="mt-0.5 text-xs text-neutral-500">
                  Oran: {formatInstallmentRate(selectedPlan.monthlyRate)}
                </p>
              </div>
              <p className="text-2xl font-bold text-emerald-700">
                {formatInstallmentCurrency(selectedPlan.monthlyPayment)}
              </p>
            </div>
          </div>
        </div>

        <ul className="mt-4 space-y-2">
          {plans.map((plan) => (
            <li
              key={`summary-${plan.months}`}
              className={cn(
                "flex items-center justify-between rounded-2xl border px-4 py-3 text-sm transition-colors duration-200",
                plan.months === selectedPlan.months
                  ? "border-emerald-200 bg-white"
                  : "border-neutral-100 bg-neutral-50/70"
              )}
            >
              <div>
                <p className="font-semibold text-neutral-900">{plan.months} ay</p>
                <p className="mt-0.5 text-xs text-neutral-500">
                  Vade farkı +{formatInstallmentCurrency(plan.vadeFarki)}
                </p>
              </div>
              <p className="font-bold text-emerald-700">
                {formatInstallmentCurrency(plan.monthlyPayment)}
                <span className="text-xs font-medium text-neutral-500"> / ay</span>
              </p>
            </li>
          ))}
        </ul>

        <p className="mt-4 text-xs leading-relaxed text-neutral-500">
          Tutarlar örnek hesaplamadır; banka, kart tipi ve mağaza anlaşmalarına
          göre değişebilir. Kesin taksit bilgisi için mağaza ile iletişime geçin.
        </p>
      </div>
    </div>,
    document.body
  );
}

/** @deprecated Use InstallmentOptionsCard */
export const InstallmentPreview = InstallmentOptionsCard;
