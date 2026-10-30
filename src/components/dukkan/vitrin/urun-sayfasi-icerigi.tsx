"use client";

import useEmblaCarousel from "embla-carousel-react";
import { useReducedMotion } from "framer-motion";
import { Check, Expand, ImageOff, Phone, Share2 } from "lucide-react";
import { useEffect, useState } from "react";
import { WhatsAppIcon } from "@/components/icons/whatsapp-icon";
import { FotoLightbox } from "@/components/dukkan/vitrin/foto-lightbox";
import { buildWhatsAppUrl } from "@/lib/dukkan/contact";
import { logDukkanAction } from "@/lib/dukkan/logger";
import { getUrunStokBadge, URUN_STOK_BADGE_CLASSES } from "@/lib/dukkan/urun-stok";
import { cn } from "@/lib/utils/cn";

export type UrunSayfasiVerisi = {
  urunAdi: string;
  aciklama: string | null;
  fiyat: string | null;
  stokAdedi: number | null;
  fotograflar: string[];
  /** Kategori etiketi, ör. "Kılıf › Silikon Kılıf" gösterimi için "Silikon Kılıf" */
  kategoriEtiketi: string | null;
  /** Ürün sayfasının mutlak adresi (paylaşım ve WhatsApp mesajı için) */
  sayfaUrl: string;
};

export function UrunSayfasiIcerigi({
  urun,
  shopName,
  whatsapp,
  telefon,
}: {
  urun: UrunSayfasiVerisi;
  shopName: string;
  whatsapp: string | null;
  telefon: string | null;
}) {
  const reduceMotion = useReducedMotion();
  const photos = urun.fotograflar;
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: photos.length > 1,
    duration: reduceMotion ? 0 : 25,
  });
  const [selected, setSelected] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [shareState, setShareState] = useState<"idle" | "copied" | "error">("idle");

  const stokBadge = getUrunStokBadge(urun.stokAdedi);
  const fiyat = urun.fiyat?.trim();
  const whatsappNo = whatsapp?.trim();
  const telefonNo = telefon?.trim();

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelected(emblaApi.selectedScrollSnap());
    emblaApi.on("select", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi]);

  async function handleShare() {
    try {
      if (typeof navigator.share === "function") {
        await navigator.share({ title: urun.urunAdi, text: `${shopName} — ${urun.urunAdi}`, url: urun.sayfaUrl });
        return;
      }
      await navigator.clipboard.writeText(urun.sayfaUrl);
      setShareState("copied");
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      logDukkanAction("urunPaylas", "share failed", { err, url: urun.sayfaUrl });
      setShareState("error");
    }
  }

  return (
    <div className="grid gap-6 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] md:gap-10">
      <div className="relative overflow-hidden rounded-3xl border border-slate-200/70 bg-slate-50">
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
                      alt={`${urun.urunAdi} — fotoğraf ${index + 1}`}
                      loading={index === 0 ? "eager" : "lazy"}
                      fetchPriority={index === 0 ? "high" : undefined}
                      className="h-full w-full object-cover"
                      draggable={false}
                    />
                  </button>
                ))}
              </div>
            </div>
            <span className="pointer-events-none absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-slate-900/60 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur">
              <Expand className="size-3" aria-hidden />
              Büyütmek için dokunun
            </span>
            {photos.length > 1 && (
              <div className="absolute inset-x-0 bottom-2 flex justify-center gap-1">
                {photos.map((_, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => emblaApi?.scrollTo(index)}
                    aria-label={`Fotoğraf ${index + 1}`}
                    aria-current={selected === index ? "true" : undefined}
                    className="flex size-11 items-center justify-center"
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

      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {urun.kategoriEtiketi && (
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
              {urun.kategoriEtiketi}
            </span>
          )}
          {stokBadge && (
            <span
              className={cn("rounded-full px-2.5 py-1 text-xs font-semibold ring-1", URUN_STOK_BADGE_CLASSES[stokBadge.tone])}
            >
              {stokBadge.label}
            </span>
          )}
        </div>

        <h1 className="text-2xl font-bold leading-tight tracking-tight text-slate-900 sm:text-3xl">{urun.urunAdi}</h1>

        {fiyat ? (
          <p className="text-2xl font-extrabold tracking-tight text-emerald-700">{fiyat}</p>
        ) : (
          <p className="text-base font-medium text-slate-500">Fiyat için mağazaya sorun</p>
        )}

        {urun.aciklama && (
          <p className="whitespace-pre-line text-base leading-relaxed text-slate-600">{urun.aciklama}</p>
        )}

        <div className="space-y-2 pt-2">
          {whatsappNo && (
            <a
              href={buildWhatsAppUrl(
                whatsappNo,
                `Merhaba, ${urun.urunAdi} ürününüzle ilgileniyorum. Detaylar: ${urun.sayfaUrl}`
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#25D366] px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-[#20bd5a]"
            >
              <WhatsAppIcon className="size-5" />
              WhatsApp&apos;tan sor
            </a>
          )}
          <div className="grid grid-cols-2 gap-2">
            {telefonNo ? (
              <a
                href={`tel:${telefonNo.replace(/\s/g, "")}`}
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

      {lightboxIndex !== null && (
        <FotoLightbox
          images={photos}
          startIndex={lightboxIndex}
          alt={urun.urunAdi}
          onClose={() => {
            setLightboxIndex(null);
            emblaApi?.scrollTo(lightboxIndex, true);
          }}
        />
      )}
    </div>
  );
}
