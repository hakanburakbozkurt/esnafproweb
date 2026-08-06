import { cn } from "@/lib/utils/cn";

/** Yönetim paneli kartları — vitrin ile uyumlu sakin pastel yeşil dil */
export const yonetimPanelClass =
  "rounded-2xl border border-slate-200/80 bg-white/95 shadow-sm shadow-slate-200/30 backdrop-blur-sm";

export const yonetimPanelPaddingClass = "p-5 sm:p-6 lg:p-7";

export const yonetimPanelAccentLabelClass =
  "text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-600";

export const yonetimPanelTitleClass =
  "text-xl font-bold tracking-tight text-slate-900 sm:text-2xl";

export const yonetimPanelBodyClass = "text-sm leading-relaxed text-slate-600 sm:text-base";

export const yonetimPanelScoreClass = "text-3xl font-bold tabular-nums text-emerald-700";

export const yonetimPanelCtaClass =
  "inline-flex w-full shrink-0 items-center justify-center rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 active:scale-[0.98] sm:w-auto";

/** Esnaf Koçu — hafif mint vurgulu, bağırmayan kart */
export const yonetimCoachPanelClass =
  "rounded-2xl border border-emerald-200/70 bg-gradient-to-br from-emerald-50/70 via-white to-white shadow-sm shadow-emerald-100/40";

export const yonetimBreakdownRowClass =
  "rounded-xl border border-slate-200/70 bg-slate-50/60 px-4 py-3";

/** @deprecated YonetimGradientGlow artık kullanılmıyor */
export function YonetimGradientGlow() {
  return null;
}

/** Geriye dönük uyumluluk — yeni panel sınıflarına yönlendirir */
export const yonetimGradientShellClass = yonetimPanelClass;
export const yonetimGradientPanelClass = cn(yonetimPanelClass, yonetimPanelPaddingClass);

export function scoreBarFillClass(filled: boolean) {
  return cn(
    "h-full rounded-full transition-all duration-500",
    filled ? "bg-emerald-500/75" : "bg-slate-200"
  );
}

export function scoreBarTrackClass() {
  return "mt-2 h-2 overflow-hidden rounded-full bg-slate-100";
}
