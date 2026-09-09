"use client";

import useEmblaCarousel from "embla-carousel-react";
import { Maximize2, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
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
  const [lightboxOpen, setLightboxOpen] = useState(false);

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

  const scrollTo = (index: number) => emblaApi?.scrollTo(index);
  const scrollPrev = () => emblaApi?.scrollPrev();
  const scrollNext = () => emblaApi?.scrollNext();

  const openLightbox = (index: number) => {
    setSelectedIndex(index);
    scrollTo(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => setLightboxOpen(false);

  if (!images.length) {
    return (
      <div
        className={cn(
          "flex aspect-[4/3] items-center justify-center rounded-3xl border border-neutral-100 bg-neutral-50 text-sm text-neutral-400",
          className
        )}
      >
        Görsel yok
      </div>
    );
  }

  return (
    <>
      <div className={cn("space-y-3", className)}>
        <div className="relative overflow-hidden rounded-3xl border border-neutral-100 bg-neutral-50 shadow-sm">
          <div className="aspect-[4/3] overflow-hidden" ref={emblaRef}>
            <div className="flex h-full">
              {images.map((url, index) => (
                <div
                  key={`${url}-${index}`}
                  className="flex min-w-0 shrink-0 grow-0 basis-full items-center justify-center bg-neutral-50 p-3 sm:p-4"
                >
                  <button
                    type="button"
                    onClick={() => openLightbox(index)}
                    className="group relative flex h-full w-full cursor-zoom-in items-center justify-center"
                    aria-label={`${altPrefix} fotoğraf ${index + 1} — tam ekran aç`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={url}
                      alt={`${altPrefix} ${index + 1}`}
                      className="max-h-full max-w-full object-contain transition duration-300 group-hover:scale-[1.01]"
                      draggable={false}
                    />
                    <span className="pointer-events-none absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-neutral-600 opacity-0 shadow-sm ring-1 ring-neutral-100 transition group-hover:opacity-100">
                      <Maximize2 className="size-3.5" aria-hidden />
                      Büyüt
                    </span>
                  </button>
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
                className="absolute left-3 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-neutral-700 shadow-sm ring-1 ring-neutral-100 backdrop-blur-sm transition hover:bg-white"
              >
                ‹
              </button>
              <button
                type="button"
                onClick={scrollNext}
                aria-label="Sonraki fotoğraf"
                className="absolute right-3 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-neutral-700 shadow-sm ring-1 ring-neutral-100 backdrop-blur-sm transition hover:bg-white"
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
                      selectedIndex === index ? "bg-emerald-600" : "bg-white/70"
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
                  "relative flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-neutral-50 ring-2 transition sm:size-20",
                  selectedIndex === index
                    ? "ring-emerald-500"
                    : "ring-transparent hover:ring-neutral-200"
                )}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={url}
                  alt=""
                  className="max-h-full max-w-full object-contain p-1"
                  draggable={false}
                />
              </button>
            ))}
          </div>
        )}
      </div>

      <DeviceGalleryLightbox
        open={lightboxOpen}
        images={images}
        altPrefix={altPrefix}
        initialIndex={selectedIndex}
        onClose={closeLightbox}
        onIndexChange={(index) => {
          setSelectedIndex(index);
          scrollTo(index);
        }}
      />
    </>
  );
}

function DeviceGalleryLightbox({
  open,
  images,
  altPrefix,
  initialIndex,
  onClose,
  onIndexChange,
}: {
  open: boolean;
  images: string[];
  altPrefix: string;
  initialIndex: number;
  onClose: () => void;
  onIndexChange: (index: number) => void;
}) {
  const [activeIndex, setActiveIndex] = useState(initialIndex);

  useEffect(() => {
    if (open) setActiveIndex(initialIndex);
  }, [open, initialIndex]);

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowLeft" && images.length > 1) {
        const next = (activeIndex - 1 + images.length) % images.length;
        setActiveIndex(next);
        onIndexChange(next);
      }
      if (event.key === "ArrowRight" && images.length > 1) {
        const next = (activeIndex + 1) % images.length;
        setActiveIndex(next);
        onIndexChange(next);
      }
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, activeIndex, images.length, onClose, onIndexChange]);

  if (!open || typeof document === "undefined") return null;

  const currentUrl = images[activeIndex];
  if (!currentUrl) return null;

  const showPrev = () => {
    const next = (activeIndex - 1 + images.length) % images.length;
    setActiveIndex(next);
    onIndexChange(next);
  };

  const showNext = () => {
    const next = (activeIndex + 1) % images.length;
    setActiveIndex(next);
    onIndexChange(next);
  };

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-8">
      <button
        type="button"
        aria-label="Galeriyi kapat"
        className="absolute inset-0 bg-neutral-900/85 backdrop-blur-sm"
        onClick={onClose}
      />

      <figure className="relative z-[201] flex max-h-[min(92vh,920px)] w-full max-w-5xl flex-col overflow-hidden rounded-3xl border border-neutral-100 bg-white shadow-2xl">
        <div className="flex items-center justify-between gap-3 border-b border-neutral-100 px-4 py-3 sm:px-5">
          <figcaption className="min-w-0 truncate text-sm font-semibold text-neutral-900 sm:text-base">
            {altPrefix}
            {images.length > 1 && (
              <span className="ml-2 text-neutral-400">
                {activeIndex + 1}/{images.length}
              </span>
            )}
          </figcaption>
          <button
            type="button"
            onClick={onClose}
            aria-label="Kapat"
            className="inline-flex size-9 shrink-0 items-center justify-center rounded-full border border-neutral-200 text-neutral-500 transition hover:border-neutral-300 hover:bg-neutral-50 hover:text-neutral-800"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="relative flex min-h-0 flex-1 items-center justify-center bg-neutral-50 p-4 sm:p-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={currentUrl}
            alt={`${altPrefix} ${activeIndex + 1}`}
            className="max-h-[min(78vh,820px)] w-full object-contain"
          />

          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={showPrev}
                aria-label="Önceki fotoğraf"
                className="absolute left-3 top-1/2 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-lg text-neutral-700 shadow-sm ring-1 ring-neutral-100 transition hover:bg-white sm:left-5"
              >
                ‹
              </button>
              <button
                type="button"
                onClick={showNext}
                aria-label="Sonraki fotoğraf"
                className="absolute right-3 top-1/2 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-lg text-neutral-700 shadow-sm ring-1 ring-neutral-100 transition hover:bg-white sm:right-5"
              >
                ›
              </button>
            </>
          )}
        </div>
      </figure>
    </div>,
    document.body
  );
}
