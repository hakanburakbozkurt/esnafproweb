"use client";

import useEmblaCarousel from "embla-carousel-react";
import { motion, useReducedMotion } from "framer-motion";
import { Check, Expand, ImageOff, Phone, Share2, X } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { WhatsAppIcon } from "@/components/icons/whatsapp-icon";
import { FotoLightbox } from "@/components/dukkan/vitrin/foto-lightbox";
import { buildUrunPublicUrl, buildUrunWhatsAppUrl } from "@/lib/dukkan/group-urunler";
import { logDukkanAction } from "@/lib/dukkan/logger";
import { getUrunPhotoUrls } from "@/lib/dukkan/urun-photos";
import { getUrunStokBadge, URUN_STOK_BADGE_CLASSES } from "@/lib/dukkan/urun-stok";
import { cn } from "@/lib/utils/cn";
import type { Dukkan, DukkanUrunu } from "@/types/database.types";

type UrunDetayModalProps = {
  urun: DukkanUrunu;
  dukkan: Pick<Dukkan, "slug" | "dukkan_adi" | "whatsapp" | "telefon">;
  onClose: () => void;
};

export function UrunDetayModal({ urun, dukkan, onClose }: UrunDetayModalProps) {
  const reduceMotion = useReducedMotion();
  const titleId = useId();
  const photos = getUrunPhotoUrls(urun);
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: photos.length > 1,
    duration: reduceMotion ? 0 : 25,
  });
  const [selected, setSelected] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [shareState, setShareState] = useState<"idle" | "copied" | "error">("idle");
  const closeRef = useRef<HTMLButtonElement>(null);
  const onCloseRef = useRef(onClose);

  const stokBadge = getUrunStokBadge(urun.stok_adedi);
  const fiyat = urun.fiyat?.trim();
  const whatsapp = dukkan.whatsapp?.trim();
  const telefon = dukkan.telefon?.trim();

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
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus({ preventScroll: true });

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onCloseRef.current();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  async function handleShare() {
    const url = buildUrunPublicUrl(dukkan.slug, urun.id);
    try {
      if (typeof navigator.share === "function") {
        await navigator.share({ title: urun.urun_adi, text: `${dukkan.dukkan_adi} — ${urun.urun_adi}`, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setShareState("copied");
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      logDukkanAction("urunPaylas", "share failed", { err, urunId: urun.id });
      setShareState("error");
    }
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center sm:p-6">
      <motion.button
        type="button"
        aria-label="Ürün detayını kapat"
        tabIndex={-1}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, transition: { duration: reduceMotion ? 0 : 0.18 } }}
        transition={{ duration: reduceMotion ? 0 : 0.2 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm"
      />

      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: reduceMotion ? 0 : 40, transition: { duration: reduceMotion ? 0 : 0.18 } }}
        transition={reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 360, damping: 34 }}
        className="relative flex max-h-[94dvh] w-full flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:max-h-[88vh] sm:max-w-4xl sm:rounded-3xl md:grid md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]"
      >
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Kapat"
          className="absolute right-3 top-3 z-10 inline-flex size-11 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow-sm backdrop-blur transition hover:bg-white"
        >
          <X className="size-5" aria-hidden />
        </button>

        <div className="min-h-0 overflow-y-auto overscroll-contain md:contents">
          <div className="relative bg-slate-50 md:min-h-0 md:overflow-hidden">
            {photos.length ? (
              <>
                <div ref={emblaRef} className="overflow-hidden">
                  <div className="flex touch-pan-y">
                    {photos.map((src, index) => (
                      <button
                        key={`${src}-${index}`}
                        type="button"
                        onClick={() => setLightboxIndex(index)}
                        aria-label={`Fotoğraf ${index + 1}: büyüt`}
                        className="relative aspect-square min-w-0 shrink-0 grow-0 basis-full"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={src}
                          alt={`${urun.urun_adi} — fotoğraf ${index + 1}`}
                          className="h-full w-full object-cover"
                          draggable={false}
                        />
                      </button>
                    ))}
                  </div>
                </div>
                <span className="pointer-events-none absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-slate-900/60 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur">
                  <Expand className="size-3" aria-hidden />
                  Büyütmek için dokunun
                </span>
                {photos.length > 1 && (
                  <div className="absolute inset-x-0 bottom-3 flex justify-center gap-1.5">
                    {photos.map((_, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => emblaApi?.scrollTo(index)}
                        aria-label={`Fotoğraf ${index + 1}`}
                        aria-current={selected === index ? "true" : undefined}
                        className="flex size-6 items-center justify-center"
                      >
                        <span
                          className={cn(
                            "h-1.5 rounded-full bg-white shadow transition-all",
                            selected === index ? "w-5" : "w-1.5 opacity-60"
                          )}
                        />
                      </button>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="flex aspect-square items-center justify-center text-slate-300">
                <ImageOff className="size-10" aria-hidden />
              </div>
            )}
          </div>

          <div className="flex flex-col gap-4 p-5 sm:p-7 md:min-h-0 md:overflow-y-auto">
            <div className="flex flex-wrap items-center gap-2 pr-10">
              {urun.urun_kategorisi && (
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                  {urun.urun_kategorisi}
                </span>
              )}
              {stokBadge && (
                <span
                  className={cn(
                    "rounded-full px-2.5 py-1 text-xs font-semibold ring-1",
                    URUN_STOK_BADGE_CLASSES[stokBadge.tone]
                  )}
                >
                  {stokBadge.label}
                </span>
              )}
            </div>

            <h2 id={titleId} className="text-2xl font-bold leading-tight tracking-tight text-slate-900 sm:text-3xl">
              {urun.urun_adi}
            </h2>

            {fiyat && <p className="text-2xl font-extrabold tracking-tight text-emerald-700">{fiyat}</p>}

            {urun.urun_aciklama && (
              <p className="whitespace-pre-line text-sm leading-relaxed text-slate-600 sm:text-base">
                {urun.urun_aciklama}
              </p>
            )}

            <div className="mt-auto space-y-2 pt-2">
              {whatsapp && (
                <a
                  href={buildUrunWhatsAppUrl(whatsapp, dukkan.slug, urun)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#25D366] px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-[#20bd5a]"
                >
                  <WhatsAppIcon className="size-5" />
                  WhatsApp&apos;tan sor
                </a>
              )}
              <div className="grid grid-cols-2 gap-2">
                {telefon ? (
                  <a
                    href={`tel:${telefon.replace(/\s/g, "")}`}
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:border-emerald-200 hover:text-emerald-700"
                  >
                    <Phone className="size-4" aria-hidden />
                    Ara
                  </a>
                ) : (
                  <span />
                )}
                <button
                  type="button"
                  onClick={() => void handleShare()}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:border-emerald-200 hover:text-emerald-700"
                >
                  {shareState === "copied" ? (
                    <Check className="size-4 text-emerald-600" aria-hidden />
                  ) : (
                    <Share2 className="size-4" aria-hidden />
                  )}
                  {shareState === "copied" ? "Kopyalandı" : "Paylaş"}
                </button>
              </div>
              {shareState === "error" && (
                <p role="alert" className="text-center text-xs text-red-600">
                  Bağlantı paylaşılamadı. Adres çubuğundaki bağlantıyı kopyalayabilirsiniz.
                </p>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {lightboxIndex !== null && (
        <FotoLightbox
          images={photos}
          startIndex={lightboxIndex}
          alt={urun.urun_adi}
          onClose={() => {
            setLightboxIndex(null);
            emblaApi?.scrollTo(lightboxIndex, true);
          }}
        />
      )}
    </div>
  );
}
