"use client";

import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { UrunVitrinKarti } from "@/components/dukkan/vitrin/urun-vitrin-karti";
import type { UrunKategoriGrubu } from "@/lib/dukkan/group-urunler";
import { cn } from "@/lib/utils/cn";
import type { DukkanUrunu } from "@/types/database.types";

type UrunKategoriSeridiProps = {
  group: UrunKategoriGrubu;
  onOpen: (urun: DukkanUrunu) => void;
};

const arrowClass =
  "inline-flex size-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-emerald-300 hover:text-emerald-700 disabled:pointer-events-none disabled:opacity-35";

export function UrunKategoriSeridi({ group, onOpen }: UrunKategoriSeridiProps) {
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

  const headingId = `${group.id}-baslik`;
  const showArrows = canPrev || canNext;

  return (
    <section
      id={group.id}
      aria-labelledby={group.title ? headingId : undefined}
      aria-label={group.title ? undefined : "Ürünler"}
      className="scroll-mt-36"
    >
      {(group.title || showArrows) && (
        <div className="mb-4 flex items-end justify-between gap-4">
          {group.title ? (
            <h2
              id={headingId}
              className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl"
            >
              {group.title}
              <span className="ml-2 align-middle text-sm font-medium text-slate-400">
                {group.urunler.length}
              </span>
            </h2>
          ) : (
            <span />
          )}
          {showArrows && (
            <div className="hidden gap-2 md:flex">
              <button
                type="button"
                onClick={() => emblaApi?.scrollPrev()}
                disabled={!canPrev}
                aria-label={`${group.title ?? "Ürünler"}: önceki`}
                className={arrowClass}
              >
                <ChevronLeft className="size-5" aria-hidden />
              </button>
              <button
                type="button"
                onClick={() => emblaApi?.scrollNext()}
                disabled={!canNext}
                aria-label={`${group.title ?? "Ürünler"}: sonraki`}
                className={arrowClass}
              >
                <ChevronRight className="size-5" aria-hidden />
              </button>
            </div>
          )}
        </div>
      )}

      <div ref={emblaRef} className="-mx-4 overflow-hidden px-4 sm:mx-0 sm:px-0">
        <ul className="-ml-3 flex touch-pan-y sm:-ml-4">
          {group.urunler.map((urun) => (
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
    </section>
  );
}
