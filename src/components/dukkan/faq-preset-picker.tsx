"use client";

import { useMemo, useState } from "react";
import {
  FAQ_PRESET_CATEGORY_LABELS,
  getPresetsByCategory,
  type FaqPageContext,
  type FaqPreset,
} from "@/lib/dukkan/faq-presets";
import { cn } from "@/lib/utils/cn";

export function FaqPresetPicker({
  pageContext,
  onSelect,
  disabled,
}: {
  pageContext: FaqPageContext;
  onSelect: (preset: FaqPreset) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const grouped = useMemo(() => getPresetsByCategory(pageContext), [pageContext]);
  const categories = Object.keys(grouped) as Array<keyof typeof grouped>;

  if (!categories.length) return null;

  return (
    <div className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-900">Hazır SSS Havuzu</p>
          <p className="mt-1 text-xs text-slate-500">
            Sektöre uygun şablonları tek tıkla sayfanıza ekleyin.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          disabled={disabled}
          className="inline-flex min-h-9 items-center rounded-full border border-emerald-200 bg-white px-4 py-1.5 text-xs font-semibold text-emerald-700 transition hover:border-emerald-300 disabled:opacity-50"
        >
          {open ? "Havuzu Gizle" : "Hazır Soruları Göster"}
        </button>
      </div>

      {open && (
        <div className="mt-4 space-y-4">
          {categories.map((category) => (
            <div key={category}>
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-emerald-700">
                {FAQ_PRESET_CATEGORY_LABELS[category]}
              </p>
              <div className="flex flex-wrap gap-2">
                {grouped[category].map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    disabled={disabled}
                    onClick={() => onSelect(preset)}
                    className={cn(
                      "max-w-full rounded-full border border-white bg-white px-3 py-1.5 text-left text-xs font-medium text-slate-700 shadow-sm transition hover:border-emerald-200 hover:text-emerald-700 disabled:opacity-50",
                      "truncate sm:max-w-xs"
                    )}
                    title={preset.soru}
                  >
                    + {preset.soru}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
