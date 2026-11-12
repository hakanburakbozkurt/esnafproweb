"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { KartGorseli } from "@/components/ui/kart-gorseli";
import type { OdakliGorsel } from "@/lib/gorsel/odak";
import { cn } from "@/lib/utils/cn";

/** Kartta en fazla bu kadar fotoğraf kaydırılır (sayfa hafif kalsın). */
const KART_GORSEL_SINIRI = 5;

export type IlanKartiProps = {
  href: string;
  baslik: string;
  fiyat: string;
  gorseller: OdakliGorsel[];
  /** "Sıfır" / "İkinci El" rozeti */
  durumRozeti: { label: string; tone: "new" | "used" };
  magazaAdi?: string;
  magazaHref?: string;
  konum?: string | null;
  /** Geniş ekranda başlığın altında gösterilen küçük etiketler (kategori, kondisyon) */
  etiketler?: string[];
  whatsappHref?: string | null;
  iletisimHref?: string | null;
  /** İlk ekrandaki kartlar için görsel öncelikli yüklenir */
  oncelikli?: boolean;
  className?: string;
};

/**
 * Pazaryeri ilan kartı. Telefonda iki sütun (kare fotoğraf, kısa bilgi, tek
 * WhatsApp butonu); geniş ekranda ayrıca "Detay" butonu ve etiketler.
 * Fotoğraf kutuyu doldurur; esnafın seçtiği odak noktası ortada kalır.
 */
export function IlanKarti({
  href,
  baslik,
  fiyat,
  gorseller,
  durumRozeti,
  magazaAdi,
  magazaHref,
  konum,
  etiketler = [],
  whatsappHref,
  iletisimHref,
  oncelikli = false,
  className,
}: IlanKartiProps) {
  return (
    <article
      className={cn(
        "flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition duration-300 hover:border-emerald-200 hover:shadow-md",
        className
      )}
    >
      <div className="relative">
        <KartGorselKaydirici
          href={href}
          baslik={baslik}
          gorseller={gorseller}
          oncelikli={oncelikli}
        />
        <span
          className={cn(
            "pointer-events-none absolute left-2 top-2 rounded-full px-2 py-0.5 text-[10px] font-bold shadow-sm sm:left-2.5 sm:top-2.5 sm:px-2.5 sm:py-1 sm:text-[11px]",
            durumRozeti.tone === "new" ? "bg-sky-600 text-white" : "bg-amber-500 text-white"
          )}
        >
          {durumRozeti.label}
        </span>
      </div>

      <div className="flex min-w-0 flex-1 flex-col px-2.5 pb-2.5 pt-2 sm:px-4 sm:pb-4 sm:pt-3">
        {magazaAdi &&
          (magazaHref ? (
            <Link
              href={magazaHref}
              className="truncate text-[9px] font-bold uppercase tracking-[0.1em] text-emerald-600 hover:text-emerald-700 sm:text-[11px]"
            >
              {magazaAdi}
            </Link>
          ) : (
            <p className="truncate text-[9px] font-bold uppercase tracking-[0.1em] text-emerald-600 sm:text-[11px]">
              {magazaAdi}
            </p>
          ))}

        <Link href={href} className="mt-0.5 block min-w-0">
          <h3 className="line-clamp-2 min-h-[2.5em] text-[13px] font-semibold leading-tight text-slate-900 transition hover:text-emerald-700 sm:text-base sm:leading-snug">
            {baslik}
          </h3>
        </Link>

        {konum && (
          <p className="mt-0.5 truncate text-[11px] text-slate-500 sm:text-xs">{konum}</p>
        )}

        {etiketler.length > 0 && (
          <div className="mt-2 hidden flex-wrap gap-1.5 sm:flex">
            {etiketler.map((etiket) => (
              <span
                key={etiket}
                className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600"
              >
                {etiket}
              </span>
            ))}
          </div>
        )}

        <p className="mt-1 text-base font-bold tracking-tight text-emerald-700 sm:mt-2 sm:text-xl">
          {fiyat}
        </p>

        <div className="mt-auto flex gap-2 pt-2 sm:pt-3">
          <Link
            href={href}
            className="hidden min-h-10 flex-1 items-center justify-center rounded-full border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:border-emerald-300 hover:text-emerald-600 sm:inline-flex"
          >
            Detay
          </Link>
          {whatsappHref ? (
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-9 flex-1 items-center justify-center gap-1.5 rounded-full bg-[#25D366] px-2 text-xs font-semibold text-white shadow-sm transition hover:bg-[#20bd5a] sm:min-h-10 sm:text-sm"
            >
              <WhatsAppIcon />
              <span className="truncate">WhatsApp</span>
            </a>
          ) : (
            <Link
              href={iletisimHref ?? href}
              className="inline-flex min-h-9 flex-1 items-center justify-center rounded-full border border-slate-200 bg-slate-50 px-2 text-xs font-semibold text-slate-600 transition hover:border-emerald-200 hover:text-emerald-700 sm:min-h-10 sm:text-sm"
            >
              İletişim
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}

/** Kart fotoğrafları: parmakla kaydırılır, alttaki noktalar kaç fotoğraf olduğunu gösterir. */
function KartGorselKaydirici({
  href,
  baslik,
  gorseller,
  oncelikli,
}: {
  href: string;
  baslik: string;
  gorseller: OdakliGorsel[];
  oncelikli: boolean;
}) {
  const liste = gorseller.slice(0, KART_GORSEL_SINIRI);
  const [aktif, setAktif] = useState(0);
  const serit = useRef<HTMLDivElement | null>(null);

  if (liste.length === 0) {
    return (
      <Link
        href={href}
        className="flex aspect-square items-center justify-center bg-slate-100 text-xs text-slate-400 sm:aspect-[4/3]"
      >
        Görsel yok
      </Link>
    );
  }

  return (
    <div className="relative aspect-square overflow-hidden bg-slate-100 sm:aspect-[4/3]">
      <div
        ref={serit}
        className="flex h-full snap-x snap-mandatory overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        onScroll={(e) => {
          const el = e.currentTarget;
          const sira = Math.round(el.scrollLeft / Math.max(1, el.clientWidth));
          if (sira !== aktif) setAktif(sira);
        }}
      >
        {liste.map((gorsel, index) => (
          <Link
            key={`${gorsel.src}-${index}`}
            href={href}
            className="relative block h-full w-full shrink-0 snap-center"
            aria-label={index === 0 ? baslik : `${baslik} fotoğraf ${index + 1}`}
            tabIndex={index === 0 ? 0 : -1}
          >
            <KartGorseli
              src={gorsel.src}
              alt={index === 0 ? baslik : ""}
              konum={gorsel.konum}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 360px"
              oncelikli={oncelikli && index === 0}
              className="object-cover"
            />
          </Link>
        ))}
      </div>

      {liste.length > 1 && (
        <div className="pointer-events-none absolute inset-x-0 bottom-2 flex justify-center gap-1">
          {liste.map((g, index) => (
            <span
              key={`nokta-${g.src}-${index}`}
              className={cn(
                "h-1.5 rounded-full bg-white/70 shadow-sm transition-all",
                index === aktif ? "w-3.5 bg-white" : "w-1.5"
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function WhatsAppIcon() {
  return (
    <svg className="size-4 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
    </svg>
  );
}
