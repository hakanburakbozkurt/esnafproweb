import {
  buildFaqPlaceholderContext,
  resolveFaqPlaceholders,
  type FaqPlaceholderContext,
  type FaqPlaceholderSource,
} from "@/lib/dukkan/faq-placeholders";
import type { Dukkan, FaqItem } from "@/types/database.types";

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

function isDuplicateFaq(items: FaqItem[], preset: FaqItem): boolean {
  const presetQuestion = preset.soru.trim();
  return getVisibleFaqItems(items).some(
    (item) => item.soru.trim() === presetQuestion
  );
}

export function appendFaqPreset(
  items: FaqItem[],
  preset: FaqItem,
  maxItems: number
): FaqItem[] {
  if (isDuplicateFaq(items, preset)) {
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

export function appendFaqPresets(
  items: FaqItem[],
  presets: FaqItem[],
  maxItems: number
): FaqItem[] {
  return presets.reduce(
    (current, preset) => appendFaqPreset(current, preset, maxItems),
    items
  );
}

export function resolveFaqItem(
  item: FaqItem,
  context: FaqPlaceholderContext
): FaqItem {
  return {
    soru: resolveFaqPlaceholders(item.soru, context),
    cevap: resolveFaqPlaceholders(item.cevap, context),
  };
}

export function resolveFaqItems(
  items: FaqItem[] | null | undefined,
  context: FaqPlaceholderContext
): FaqItem[] {
  return getVisibleFaqItems(items).map((item) => resolveFaqItem(item, context));
}

export function resolveFaqItemsForDukkan(
  items: FaqItem[] | null | undefined,
  dukkan: Pick<
    Dukkan,
    "dukkan_adi" | "adres" | "calisma_saatleri" | "telefon" | "whatsapp"
  >
): FaqItem[] {
  return resolveFaqItems(items, buildFaqPlaceholderContext(dukkan));
}

export function resolveFaqItemsForSource(
  items: FaqItem[] | null | undefined,
  source: FaqPlaceholderSource
): FaqItem[] {
  return resolveFaqItems(items, buildFaqPlaceholderContext(source));
}
