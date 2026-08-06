import type { FaqItem } from "@/types/database.types";

/** SEO için ideal aralık; aşıldığında yumuşak uyarı gösterilir */
export const FAQ_SOFT_WARN_THRESHOLD = 8;

export function getVisibleFaqItems(
  items: FaqItem[] | null | undefined
): FaqItem[] {
  return (items ?? []).filter(
    (item) => item.soru.trim().length > 0 && item.cevap.trim().length > 0
  );
}

export function countVisibleFaqItems(
  items: FaqItem[] | null | undefined
): number {
  return getVisibleFaqItems(items).length;
}

export function hasVisibleFaqItems(
  items: FaqItem[] | null | undefined
): boolean {
  return countVisibleFaqItems(items) > 0;
}

export function shouldShowFaqSoftWarning(
  items: FaqItem[] | null | undefined
): boolean {
  return countVisibleFaqItems(items) > FAQ_SOFT_WARN_THRESHOLD;
}

export function appendFaqPreset(
  items: FaqItem[],
  preset: FaqItem,
  maxItems: number
): FaqItem[] {
  const visible = getVisibleFaqItems(items);
  if (visible.some((item) => item.soru.trim() === preset.soru.trim())) {
    return items;
  }

  const emptyIndex = items.findIndex(
    (item) => !item.soru.trim() && !item.cevap.trim()
  );

  if (emptyIndex >= 0) {
    const next = [...items];
    next[emptyIndex] = { soru: preset.soru, cevap: preset.cevap };
    return next;
  }

  if (items.length >= maxItems) return items;

  return [...items, { soru: preset.soru, cevap: preset.cevap }];
}
