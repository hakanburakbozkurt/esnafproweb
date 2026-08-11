"use client";

import useEmblaCarousel from "embla-carousel-react";
import { useCallback, useEffect, useState } from "react";
import {
  buildFaqPlaceholderContext,
  resolveFaqPlaceholders,
  type FaqPlaceholderSource,
} from "@/lib/dukkan/faq-placeholders";
import type { FaqPackage } from "@/lib/dukkan/faq-packages";
import type { FaqPreset } from "@/lib/dukkan/faq-presets";

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

type FaqPackageCarouselProps = {
  packages: FaqPackage[];
  packageSamples: Record<string, FaqPreset[]>;
  placeholderSource?: FaqPlaceholderSource;
  disabled?: boolean;
  onAddPackage: (packageId: string) => void;
  carouselKey?: string;
};

export function FaqPackageCarousel({
  packages,
  packageSamples,
  placeholderSource,
  disabled,
  onAddPackage,
  carouselKey,
}: FaqPackageCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: packages.length > 1,
    align: "start",
    duration: 24,
  });
  const [selectedIndex, setSelectedIndex] = useState(0);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.reInit();
    emblaApi.scrollTo(0, true);
    setSelectedIndex(0);
  }, [emblaApi, carouselKey, packages.length]);

  if (!packages.length) return null;

  const scrollPrev = () => emblaApi?.scrollPrev();
  const scrollNext = () => emblaApi?.scrollNext();
  const showNav = packages.length > 1;
  const activePackage = packages[selectedIndex];
  const sampled = activePackage
    ? (packageSamples[activePackage.id] ?? [])
    : [];

  return (
    <div className="flex justify-end">
      <div className="w-full max-w-md">
        <div className="overflow-hidden rounded-xl border border-emerald-100 bg-white shadow-sm">
          <div ref={emblaRef}>
            <div className="flex">
              {packages.map((pkg) => {
                const items = packageSamples[pkg.id] ?? [];

                return (
                  <div
                    key={pkg.id}
                    className="min-w-0 shrink-0 grow-0 basis-full"
                  >
                    <article className="p-4">
                      <p className="text-sm font-semibold text-slate-900">
                        {pkg.name}
                      </p>
                      <p className="mt-1 text-xs leading-relaxed text-slate-500">
                        {pkg.description}
                      </p>
                      <ul className="mt-3 space-y-1.5 text-[11px] text-slate-600">
                        {items.slice(0, 3).map((preset) => (
                          <li key={preset.id} className="flex gap-2">
                            <span className="mt-1 size-1 shrink-0 rounded-full bg-emerald-400" />
                            <span className="line-clamp-1">
                              {
                                previewPresetText(preset, placeholderSource)
                                  .soru
                              }
                            </span>
                          </li>
                        ))}
                        {items.length > 3 && (
                          <li className="pl-3 text-slate-400">
                            +{items.length - 3} soru daha
                          </li>
                        )}
                      </ul>
                    </article>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 border-t border-emerald-50 bg-emerald-50/30 px-4 py-3">
            <button
              type="button"
              disabled={disabled || !sampled.length}
              onClick={() => activePackage && onAddPackage(activePackage.id)}
              className="inline-flex min-h-8 items-center rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
            >
              Paketi Ekle ({sampled.length})
            </button>

            {showNav && (
              <div className="flex items-center gap-1.5">
                <span className="mr-1 text-[10px] font-medium text-slate-400">
                  {selectedIndex + 1}/{packages.length}
                </span>
                <button
                  type="button"
                  onClick={scrollPrev}
                  aria-label="Önceki paket"
                  className="flex size-8 items-center justify-center rounded-full border border-emerald-200 bg-white text-base text-emerald-700 transition hover:bg-emerald-50"
                >
                  ‹
                </button>
                <button
                  type="button"
                  onClick={scrollNext}
                  aria-label="Sonraki paket"
                  className="flex size-8 items-center justify-center rounded-full border border-emerald-200 bg-white text-base text-emerald-700 transition hover:bg-emerald-50"
                >
                  ›
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
