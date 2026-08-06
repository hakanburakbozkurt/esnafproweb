export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export const inputClassName =
  "mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20";

export const labelClassName = "text-sm font-medium text-slate-900";

export const buttonPrimaryClassName =
  "inline-flex items-center justify-center rounded-full bg-slate-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50";

export const cardClassName =
  "rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)]";

export const premiumPanelClassName =
  "rounded-3xl border border-slate-200/70 bg-white p-5 shadow-[0_12px_40px_rgb(0,0,0,0.06)] sm:p-7";

export const premiumSectionClassName =
  "rounded-3xl border border-slate-200/60 bg-gradient-to-b from-white to-slate-50/80 p-5 shadow-[0_8px_32px_rgb(0,0,0,0.04)] sm:p-6";

export const adminSectionClassName =
  "rounded-3xl border border-slate-200/60 bg-white/95 p-6 shadow-[0_8px_32px_rgb(0,0,0,0.04)] lg:p-8";
