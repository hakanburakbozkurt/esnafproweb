"use client";

import { useMemo, useState } from "react";
import {
  buildFaqPlaceholderContext,
  resolveFaqPlaceholders,
  type FaqPlaceholderSource,
} from "@/lib/dukkan/faq-placeholders";
import { FaqPackageCarousel } from "@/components/dukkan/faq-package-carousel";
import { getPackagesForPage } from "@/lib/dukkan/faq-packages";
import { createPoolSampleKey, FAQ_POOL_SAMPLE_SIZE } from "@/lib/dukkan/faq-pool-sampling";
import {
  FAQ_PRESET_CATEGORY_LABELS,
  samplePackagePresets,
  samplePresetsByCategory,
  type FaqPageContext,
  type FaqPreset,
  type FaqPresetCategory,
} from "@/lib/dukkan/faq-presets";
import { cn } from "@/lib/utils/cn";

function previewPresetText(
  preset: FaqPreset,
  source?: FaqPlaceholderSource
): { soru: string; cevap: string } {
  if (!source) {
    return { soru: preset.soru, cevap: preset.cevap };
  }

  const context = buildFaqPlaceholderContext(source);
  return {
    soru: resolveFaqPlaceholders(preset.soru, context),
    cevap: resolveFaqPlaceholders(preset.cevap, context),
  };
}

function buildShopSampleSeed(source?: FaqPlaceholderSource, sampleKey?: string) {
  const shopPart = source?.dukkan_adi?.trim() || "shop";
  return `${shopPart}:${sampleKey ?? "default"}`;
}

export function FaqPresetPicker({
  pageContext,
  onSelect,
  onSelectMany,
  placeholderSource,
  disabled,
}: {
  pageContext: FaqPageContext;
  onSelect: (preset: FaqPreset) => void;
  onSelectMany?: (presets: FaqPreset[]) => void;
  placeholderSource?: FaqPlaceholderSource;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [sampleKey, setSampleKey] = useState(() => createPoolSampleKey());

  const shopSampleSeed = useMemo(
    () => buildShopSampleSeed(placeholderSource, sampleKey),
    [placeholderSource, sampleKey]
  );

  const grouped = useMemo(
    () => samplePresetsByCategory(pageContext, shopSampleSeed, FAQ_POOL_SAMPLE_SIZE),
    [pageContext, shopSampleSeed]
  );

  const categories = Object.keys(grouped) as FaqPresetCategory[];
  const packages = useMemo(() => getPackagesForPage(pageContext), [pageContext]);

  const packageSamples = useMemo(
    () =>
      Object.fromEntries(
        packages.map((pkg) => [
          pkg.id,
          samplePackagePresets(
            pageContext,
            pkg.categories,
            `${shopSampleSeed}:${pkg.id}`,
            pkg.sampleSize ?? FAQ_POOL_SAMPLE_SIZE
          ),
        ])
      ) as Record<string, FaqPreset[]>,
    [packages, pageContext, shopSampleSeed]
  );

  if (!categories.length) return null;

  function togglePreset(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function handlePackageAdd(packageId: string) {
    const presets = packageSamples[packageId] ?? [];
    if (!presets.length) return;

    if (onSelectMany) {
      onSelectMany(presets);
      return;
    }

    for (const preset of presets) {
      onSelect(preset);
    }
  }

  function handleSelectedAdd() {
    const visiblePresets = categories.flatMap(
      (category) => grouped[category] ?? []
    );
    const presets = visiblePresets.filter((preset) => selectedIds.has(preset.id));

    if (onSelectMany) {
      onSelectMany(presets);
    } else {
      for (const preset of presets) {
        onSelect(preset);
      }
    }
    setSelectedIds(new Set());
  }

  function refreshPool() {
    setSampleKey(createPoolSampleKey());
    setSelectedIds(new Set());
  }

  return (
    <div className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-900">Hazır SSS Havuzu</p>
          <p className="mt-1 text-xs text-slate-500">
            Her kategoriden rastgele {FAQ_POOL_SAMPLE_SIZE} soru gösterilir.
            Metinler{" "}
            <code className="rounded bg-white px-1 py-0.5 text-[10px]">
              {"{ilce}"}
            </code>
            ,{" "}
            <code className="rounded bg-white px-1 py-0.5 text-[10px]">
              {"{dukkan_adi}"}
            </code>{" "}
            ile mağazanıza göre vitrinde benzersizleşir.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={refreshPool}
            disabled={disabled}
            className="inline-flex min-h-9 items-center rounded-full border border-slate-200 bg-white px-4 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-emerald-200 hover:text-emerald-700 disabled:opacity-50"
          >
            Yeni Sorular Getir
          </button>
          <button
            type="button"
            onClick={() => setOpen((prev) => !prev)}
            disabled={disabled}
            className="inline-flex min-h-9 items-center rounded-full border border-emerald-200 bg-white px-4 py-1.5 text-xs font-semibold text-emerald-700 transition hover:border-emerald-300 disabled:opacity-50"
          >
            {open ? "Havuzu Gizle" : "Hazır Soruları Göster"}
          </button>
        </div>
      </div>

      {open && (
        <div className="mt-4 space-y-5">
          {selectedIds.size > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-white px-4 py-3">
              <p className="text-xs font-medium text-slate-600">
                {selectedIds.size} soru seçildi
              </p>
              <button
                type="button"
                disabled={disabled}
                onClick={handleSelectedAdd}
                className="inline-flex min-h-8 items-center rounded-full bg-emerald-600 px-4 py-1 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
              >
                Seçilenleri Ekle
              </button>
            </div>
          )}

          {categories.map((category) => (
            <div key={category}>
              <div className="mb-2 flex items-center justify-between gap-2">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-700">
                  {FAQ_PRESET_CATEGORY_LABELS[category]}
                </p>
                <span className="text-[10px] text-slate-400">
                  {grouped[category]?.length ?? 0} / havuz
                </span>
              </div>
              <div className="space-y-2">
                {(grouped[category] ?? []).map((preset) => {
                  const preview = previewPresetText(preset, placeholderSource);
                  const checked = selectedIds.has(preset.id);

                  return (
                    <label
                      key={preset.id}
                      className={cn(
                        "flex cursor-pointer gap-3 rounded-xl border bg-white p-3 transition",
                        checked
                          ? "border-emerald-300 ring-1 ring-emerald-100"
                          : "border-slate-200 hover:border-emerald-200"
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        disabled={disabled}
                        onChange={() => togglePreset(preset.id)}
                        className="mt-1 size-4 shrink-0 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-medium text-slate-900">
                          {preview.soru}
                        </span>
                        <span className="mt-1 block text-xs leading-relaxed text-slate-500">
                          {preview.cevap}
                        </span>
                      </span>
                      <button
                        type="button"
                        disabled={disabled}
                        onClick={(event) => {
                          event.preventDefault();
                          onSelect(preset);
                        }}
                        className="shrink-0 self-start rounded-full border border-emerald-200 px-3 py-1 text-[11px] font-semibold text-emerald-700 transition hover:bg-emerald-50 disabled:opacity-50"
                      >
                        + Ekle
                      </button>
                    </label>
                  );
                })}
              </div>
            </div>
          ))}

          {packages.length > 0 && (
            <FaqPackageCarousel
              packages={packages}
              packageSamples={packageSamples}
              placeholderSource={placeholderSource}
              disabled={disabled}
              onAddPackage={handlePackageAdd}
              carouselKey={shopSampleSeed}
            />
          )}
        </div>
      )}
    </div>
  );
}
