"use client";

import useEmblaCarousel from "embla-carousel-react";
import { useCallback, useEffect, useState } from "react";
import { cn } from "@/lib/utils/cn";

type SecondHandDeviceGalleryProps = {
  images: string[];
  altPrefix: string;
  className?: string;
};

export function SecondHandDeviceGallery({
  images,
  altPrefix,
  className,
}: SecondHandDeviceGalleryProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: images.length > 1,
    align: "start",
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

  if (!images.length) {
    return (
      <div
        className={cn(
          "flex aspect-square items-center justify-center rounded-xl bg-slate-100 text-sm text-slate-400",
          className
        )}
      >
        Görsel yok
      </div>
    );
  }

  const scrollTo = (index: number) => emblaApi?.scrollTo(index);
  const scrollPrev = () => emblaApi?.scrollPrev();
  const scrollNext = () => emblaApi?.scrollNext();

  return (
    <div className={cn("space-y-3", className)}>
      <div className="relative overflow-hidden rounded-xl bg-slate-100">
        <div className="aspect-square overflow-hidden" ref={emblaRef}>
          <div className="flex h-full">
            {images.map((url, index) => (
              <div key={`${url}-${index}`} className="min-w-0 shrink-0 grow-0 basis-full">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={url}
                  alt={`${altPrefix} ${index + 1}`}
                  className="h-full w-full object-cover object-center"
                  draggable={false}
                />
              </div>
            ))}
          </div>
        </div>

        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={scrollPrev}
              aria-label="Önceki fotoğraf"
              className="absolute left-3 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow-sm backdrop-blur-sm transition hover:bg-white"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={scrollNext}
              aria-label="Sonraki fotoğraf"
              className="absolute right-3 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow-sm backdrop-blur-sm transition hover:bg-white"
            >
              ›
            </button>
            <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
              {images.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  aria-label={`Fotoğraf ${index + 1}`}
                  onClick={() => scrollTo(index)}
                  className={cn(
                    "size-2 rounded-full transition",
                    selectedIndex === index ? "bg-white" : "bg-white/50"
                  )}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {images.map((url, index) => (
            <button
              key={`thumb-${url}-${index}`}
              type="button"
              onClick={() => scrollTo(index)}
              aria-label={`${altPrefix} küçük görsel ${index + 1}`}
              className={cn(
                "relative size-16 shrink-0 overflow-hidden rounded-xl ring-2 transition sm:size-20",
                selectedIndex === index
                  ? "ring-emerald-500"
                  : "ring-transparent hover:ring-slate-200"
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt=""
                className="h-full w-full object-cover"
                draggable={false}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
