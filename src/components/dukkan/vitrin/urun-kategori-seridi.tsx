"use client";

import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { UrunVitrinKarti } from "@/components/dukkan/vitrin/urun-vitrin-karti";
import type { UrunAltGrubu, UrunKategoriGrubu } from "@/lib/dukkan/group-urunler";
import { cn } from "@/lib/utils/cn";
import type { DukkanUrunu } from "@/types/database.types";

type UrunKategoriSeridiProps = {
  group: UrunKategoriGrubu;
  onOpen: (urun: DukkanUrunu) => void;
};

const arrowClass =
  "inline-flex size-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-emerald-300 hover:text-emerald-700 disabled:pointer-events-none disabled:opacity-35";

const chipClass = (active: boolean) =>
  cn(
    "inline-flex min-h-9 items-center rounded-full border px-3.5 text-xs font-semibold transition sm:text-sm",
    active
      ? "border-emerald-600 bg-emerald-600 text-white"
      : "border-slate-200 bg-white text-slate-600 hover:border-emerald-300 hover:text-emerald-700"
  );

/** Ana kategori "klasörü": alt kategori varsa çipler, seçime göre ürünleri süzer. */
export function UrunKategoriSeridi({ group, onOpen }: UrunKategoriSeridiProps) {
  const [altSecim, setAltSecim] = useState<string | null>(null);
  const altliGruplar = group.altGruplar.filter((alt) => alt.title !== null);
  const hasChips = altliGruplar.length > 0;

  const secili: UrunAltGrubu | null =
    altSecim === null ? null : group.altGruplar.find((alt) => alt.title === altSecim) ?? null;
  const gosterilen = secili ? secili.urunler : group.urunler;

  return (
    <section
      id={group.id}
      aria-labelledby={group.title ? `${group.id}-baslik` : undefined}
      aria-label={group.title ? undefined : "Ürünler"}
      className="scroll-mt-36"
    >
      {group.title && (
        <h2
          id={`${group.id}-baslik`}
          className="mb-3 text-xl font-bold tracking-tight text-slate-900 sm:text-2xl"
        >
          {group.title}
          <span className="ml-2 align-middle text-sm font-medium text-slate-400">
            {group.urunler.length}
          </span>
        </h2>
      )}

      {hasChips && (
        <div role="group" aria-label={`${group.title ?? "Ürünler"} alt kategorileri`} className="mb-4 flex flex-wrap gap-2">
          <button type="button" onClick={() => setAltSecim(null)} className={chipClass(altSecim === null)} aria-pressed={altSecim === null}>
            Tümü
          </button>
          {altliGruplar.map((alt) => (
            <button
              key={alt.title ?? ""}
              type="button"
              onClick={() => setAltSecim(alt.title)}
              className={chipClass(altSecim === alt.title)}
              aria-pressed={altSecim === alt.title}
            >
              {alt.title}
              <span className="ml-1.5 text-[11px] opacity-70">{alt.urunler.length}</span>
            </button>
          ))}
        </div>
      )}

      <UrunSeritIcerigi
        key={altSecim ?? "tumu"}
        urunler={gosterilen}
        label={secili?.title ?? group.title ?? "Ürünler"}
        onOpen={onOpen}
      />
    </section>
  );
}

function UrunSeritIcerigi({
  urunler,
  label,
  onOpen,
}: {
  urunler: DukkanUrunu[];
  label: string;
  onOpen: (urun: DukkanUrunu) => void;
}) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    containScroll: "trimSnaps",
    slidesToScroll: "auto",
  });
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  useEffect(() => {
    if (!emblaApi) return;
    const update = () => {
      setCanPrev(emblaApi.canScrollPrev());
      setCanNext(emblaApi.canScrollNext());
    };
    const frame = requestAnimationFrame(update);
    emblaApi.on("select", update).on("reInit", update).on("resize", update);
    return () => {
      cancelAnimationFrame(frame);
      emblaApi.off("select", update).off("reInit", update).off("resize", update);
    };
  }, [emblaApi]);

  const showArrows = canPrev || canNext;

  return (
    <>
      {showArrows && (
        <div className="mb-3 hidden justify-end gap-2 md:flex">
          <button
            type="button"
            onClick={() => emblaApi?.scrollPrev()}
            disabled={!canPrev}
            aria-label={`${label}: önceki`}
            className={arrowClass}
          >
            <ChevronLeft className="size-5" aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => emblaApi?.scrollNext()}
            disabled={!canNext}
            aria-label={`${label}: sonraki`}
            className={arrowClass}
          >
            <ChevronRight className="size-5" aria-hidden />
          </button>
        </div>
      )}

      <div ref={emblaRef} className="-mx-4 overflow-hidden px-4 sm:mx-0 sm:px-0">
        <ul className="-ml-3 flex touch-pan-y sm:-ml-4">
          {urunler.map((urun) => (
            <li
              key={urun.id}
              className={cn(
                "min-w-0 shrink-0 grow-0 pl-3 sm:pl-4",
                "basis-[46%] min-[480px]:basis-[38%] sm:basis-1/3 lg:basis-1/4 xl:basis-1/5"
              )}
            >
              <UrunVitrinKarti urun={urun} onOpen={onOpen} />
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
