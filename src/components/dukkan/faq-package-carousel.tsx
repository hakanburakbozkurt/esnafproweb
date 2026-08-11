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
    align: "center",
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
  const scrollTo = (index: number) => emblaApi?.scrollTo(index);

  const showNav = packages.length > 1;

  return (
    <div className="rounded-xl border border-white bg-white/80 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-700">
            Hazır Paketler
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Ok tuşlarıyla paketler arasında gezinin; her paket havuzdan rastgele
            örneklenir.
          </p>
        </div>
        {showNav && (
          <span className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold text-emerald-700 ring-1 ring-emerald-100">
            {selectedIndex + 1} / {packages.length}
          </span>
        )}
      </div>

      <div className="relative mt-4">
        {showNav && (
          <button
            type="button"
            onClick={scrollPrev}
            aria-label="Önceki paket"
            className="absolute -left-1 top-1/2 z-10 flex size-9 -translate-y-1/2 items-center justify-center rounded-full border border-emerald-100 bg-white text-lg text-emerald-700 shadow-sm transition hover:border-emerald-200 hover:bg-emerald-50 sm:-left-3 sm:size-10"
          >
            ‹
          </button>
        )}

        <div
          className={cn("overflow-hidden", showNav && "mx-8 sm:mx-10")}
          ref={emblaRef}
        >
          <div className="flex touch-pan-y">
            {packages.map((pkg) => {
              const sampled = packageSamples[pkg.id] ?? [];

              return (
                <div
                  key={pkg.id}
                  className="min-w-0 shrink-0 grow-0 basis-full px-0.5"
                >
                  <article className="rounded-xl border border-emerald-100 bg-gradient-to-br from-emerald-50/80 to-white p-4 shadow-sm">
                    <p className="text-sm font-semibold text-slate-900">
                      {pkg.name}
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-slate-500">
                      {pkg.description}
                    </p>
                    <ul className="mt-3 space-y-1.5 text-[11px] text-slate-600">
                      {sampled.slice(0, 4).map((preset) => (
                        <li key={preset.id} className="flex gap-2">
                          <span className="mt-1 size-1 shrink-0 rounded-full bg-emerald-400" />
                          <span className="line-clamp-2">
                            {previewPresetText(preset, placeholderSource).soru}
                          </span>
                        </li>
                      ))}
                      {sampled.length > 4 && (
                        <li className="pl-3 text-slate-400">
                          +{sampled.length - 4} soru daha
                        </li>
                      )}
                    </ul>
                    <button
                      type="button"
                      disabled={disabled || !sampled.length}
                      onClick={() => onAddPackage(pkg.id)}
                      className="mt-4 inline-flex min-h-9 w-full items-center justify-center rounded-full bg-emerald-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50 sm:w-auto"
                    >
                      Paketi Ekle ({sampled.length})
                    </button>
                  </article>
                </div>
              );
            })}
          </div>
        </div>

        {showNav && (
          <button
            type="button"
            onClick={scrollNext}
            aria-label="Sonraki paket"
            className="absolute -right-1 top-1/2 z-10 flex size-9 -translate-y-1/2 items-center justify-center rounded-full border border-emerald-100 bg-white text-lg text-emerald-700 shadow-sm transition hover:border-emerald-200 hover:bg-emerald-50 sm:-right-3 sm:size-10"
          >
            ›
          </button>
        )}
      </div>

      {showNav && (
        <div className="mt-3 flex items-center justify-center gap-1.5">
          {packages.map((pkg, index) => (
            <button
              key={pkg.id}
              type="button"
              aria-label={`${pkg.name} paketine git`}
              onClick={() => scrollTo(index)}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                selectedIndex === index
                  ? "w-5 bg-emerald-600"
                  : "w-1.5 bg-emerald-200 hover:bg-emerald-300"
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}
