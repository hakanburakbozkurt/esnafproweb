"use client";

import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FaqPresetPicker } from "@/components/dukkan/faq-preset-picker";
import {
  appendFaqPreset,
  countVisibleFaqItems,
  shouldShowFaqSoftWarning,
} from "@/lib/dukkan/faq";
import type { FaqPageContext } from "@/lib/dukkan/faq-presets";
import { MAX_FAQ_ITEMS } from "@/lib/dukkan/form-data";
import type { FaqItem } from "@/types/database.types";

export function FaqEditor({
  items,
  onChange,
  fieldPrefix = "faq",
  title = "Sık Sorulan Sorular",
  description,
  pageContext,
}: {
  items: FaqItem[];
  onChange: (items: FaqItem[]) => void;
  fieldPrefix?: string;
  title?: string;
  description?: string;
  pageContext?: FaqPageContext;
}) {
  const visibleCount = countVisibleFaqItems(items);
  const showSoftWarning = shouldShowFaqSoftWarning(items);

  function updateItem(index: number, field: keyof FaqItem, value: string) {
    const next = items.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    );
    onChange(next);
  }

  function addItem() {
    if (items.length >= MAX_FAQ_ITEMS) return;
    onChange([...items, { soru: "", cevap: "" }]);
  }

  function removeItem(index: number) {
    if (items.length <= 1) {
      onChange([{ soru: "", cevap: "" }]);
      return;
    }
    onChange(items.filter((_, i) => i !== index));
  }

  function moveItem(index: number, direction: -1 | 1) {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= items.length) return;

    const next = [...items];
    [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
    onChange(next);
  }

  function handlePresetSelect(preset: FaqItem) {
    onChange(appendFaqPreset(items, preset, MAX_FAQ_ITEMS));
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 lg:text-base">
            {title}
          </h3>
          <p className="mt-1 text-xs text-slate-500 lg:text-sm">
            {description ??
              `En fazla ${MAX_FAQ_ITEMS} soru-cevap ekleyebilirsiniz.`}
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Aktif SSS: {visibleCount}
          </p>
        </div>
        {items.length < MAX_FAQ_ITEMS && (
          <button
            type="button"
            onClick={addItem}
            className="text-sm font-medium text-emerald-600 hover:text-emerald-700"
          >
            + Özel Soru Ekle
          </button>
        )}
      </div>

      {pageContext && (
        <FaqPresetPicker
          pageContext={pageContext}
          onSelect={handlePresetSelect}
          disabled={items.length >= MAX_FAQ_ITEMS}
        />
      )}

      {showSoftWarning && (
        <p className="rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          💡 SSS sayısı 8&apos;i aştı. Sayfa okunabilirliği ve Google SEO
          algoritmaları için ideal SSS sayısı 5-8 arasıdır.
        </p>
      )}

      <div className="space-y-4">
        {items.map((item, index) => (
          <div
            key={index}
            className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4"
          >
            <div className="mb-3 flex items-center justify-between gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Soru {index + 1}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => moveItem(index, -1)}
                  disabled={index === 0}
                  className="rounded-md px-2 py-1 text-xs text-slate-400 transition hover:bg-white hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label={`Soru ${index + 1} yukarı taşı`}
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => moveItem(index, 1)}
                  disabled={index === items.length - 1}
                  className="rounded-md px-2 py-1 text-xs text-slate-400 transition hover:bg-white hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label={`Soru ${index + 1} aşağı taşı`}
                >
                  ↓
                </button>
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  className="text-xs text-slate-400 hover:text-red-600"
                >
                  Kaldır
                </button>
              </div>
            </div>
            <div className="space-y-4">
              <Field label="Soru">
                <Input
                  name={`${fieldPrefix}_soru_${index}`}
                  value={item.soru}
                  onChange={(e) => updateItem(index, "soru", e.target.value)}
                  placeholder="Örn: Çalışma saatleriniz nedir?"
                />
              </Field>
              <Field label="Cevap">
                <Textarea
                  name={`${fieldPrefix}_cevap_${index}`}
                  value={item.cevap}
                  onChange={(e) => updateItem(index, "cevap", e.target.value)}
                  placeholder="Kısa ve net bir yanıt yazın"
                  rows={3}
                />
              </Field>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
