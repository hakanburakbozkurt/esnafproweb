"use client";

import useEmblaCarousel from "embla-carousel-react";
import { motion, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

type FotoLightboxProps = {
  images: string[];
  startIndex: number;
  alt: string;
  onClose: () => void;
};

export function FotoLightbox({ images, startIndex, alt, onClose }: FotoLightboxProps) {
  const reduceMotion = useReducedMotion();
  const [emblaRef, emblaApi] = useEmblaCarousel({
    startIndex,
    loop: images.length > 1,
    duration: reduceMotion ? 0 : 25,
  });
  const [selected, setSelected] = useState(startIndex);
  const closeRef = useRef<HTMLButtonElement>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelected(emblaApi.selectedScrollSnap());
    emblaApi.on("select", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi]);

  useEffect(() => {
    closeRef.current?.focus();
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.stopPropagation();
        onCloseRef.current();
      }
      if (event.key === "ArrowLeft") emblaApi?.scrollPrev();
      if (event.key === "ArrowRight") emblaApi?.scrollNext();
    }
    window.addEventListener("keydown", onKeyDown, true);
    return () => window.removeEventListener("keydown", onKeyDown, true);
  }, [emblaApi]);

  return createPortal(
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label={`${alt} fotoğrafları`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: reduceMotion ? 0 : 0.2 }}
      className="fixed inset-0 z-[80] flex flex-col bg-slate-950/95"
    >
      <div className="flex items-center justify-between px-4 pt-[max(0.75rem,env(safe-area-inset-top))] text-white">
        <p className="text-sm font-medium tabular-nums text-white/80" aria-live="polite">
          {selected + 1} / {images.length}
        </p>
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Büyük görünümü kapat"
          className="inline-flex size-11 items-center justify-center rounded-full bg-white/10 transition hover:bg-white/20"
        >
          <X className="size-5" aria-hidden />
        </button>
      </div>

      <div ref={emblaRef} className="min-h-0 flex-1 overflow-hidden">
        <div className="flex h-full touch-pan-y">
          {images.map((src, index) => (
            <div key={`${src}-${index}`} className="flex min-w-0 shrink-0 grow-0 basis-full items-center justify-center p-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={`${alt} — fotoğraf ${index + 1}`}
                className="max-h-full max-w-full select-none object-contain"
                draggable={false}
              />
            </div>
          ))}
        </div>
      </div>

      {images.length > 1 && (
        <div className="flex items-center justify-center gap-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-2">
          <button
            type="button"
            onClick={() => emblaApi?.scrollPrev()}
            aria-label="Önceki fotoğraf"
            className="inline-flex size-12 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
          >
            <ChevronLeft className="size-6" aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => emblaApi?.scrollNext()}
            aria-label="Sonraki fotoğraf"
            className="inline-flex size-12 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
          >
            <ChevronRight className="size-6" aria-hidden />
          </button>
        </div>
      )}
    </motion.div>,
    document.body
  );
}
