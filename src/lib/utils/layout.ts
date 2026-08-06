/** Desktop-first geniş ekran layout sabitleri */
export const desktopContainerClass =
  "mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8";

/** Dar form sayfaları (giriş, kayıt, toptancı profili) için ortalanmış içerik genişliği */
export const subPageContentWidthClass = {
  md: "max-w-md",
  "2xl": "max-w-2xl",
  "5xl": "max-w-5xl",
} as const;

export type SubPageContentWidth = keyof typeof subPageContentWidthClass;

export function centeredPageContentClass(width: SubPageContentWidth): string {
  return `mx-auto w-full ${subPageContentWidthClass[width]}`;
}

/** Hakkımızda / İletişim gibi vitrin alt sayfaları için ortak geniş container */
export const vitrinSubpageContainerClass = desktopContainerClass;

export const desktopGridGapClass = "gap-6 lg:gap-8";

export const bentoCardClass =
  "rounded-3xl border border-slate-200/80 bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] lg:p-8";

export const bentoSectionTitleClass =
  "mb-6 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500";
