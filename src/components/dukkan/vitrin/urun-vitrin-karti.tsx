"use client";

import { ImageOff } from "lucide-react";
import { getUrunPhotoUrls } from "@/lib/dukkan/urun-photos";
import { getUrunStokBadge, URUN_STOK_BADGE_CLASSES } from "@/lib/dukkan/urun-stok";
import { cn } from "@/lib/utils/cn";
import type { DukkanUrunu } from "@/types/database.types";

type UrunVitrinKartiProps = {
  urun: DukkanUrunu;
  onOpen: (urun: DukkanUrunu) => void;
};

export function UrunVitrinKarti({ urun, onOpen }: UrunVitrinKartiProps) {
  const photos = getUrunPhotoUrls(urun);
  const [cover, hoverPhoto] = photos;
  const stokBadge = getUrunStokBadge(urun.stok_adedi);
  const soldOut = urun.stok_adedi === 0;
  const fiyat = urun.fiyat?.trim();

  return (
    <button
      type="button"
      onClick={() => onOpen(urun)}
      aria-label={`${urun.urun_adi} — detayları gör`}
      className="group flex h-full w-full flex-col overflow-hidden rounded-3xl border border-slate-200/70 bg-white text-left shadow-[0_1px_2px_rgb(15_23_42/0.04)] transition duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-[0_18px_40px_-18px_rgb(15_23_42/0.25)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
    >
      <div className="relative aspect-square w-full overflow-hidden bg-slate-50">
        {cover ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={cover}
              alt={urun.urun_adi}
              loading="lazy"
              className={cn(
                "absolute inset-0 h-full w-full object-cover transition duration-500 motion-reduce:transition-none",
                hoverPhoto ? "group-hover:opacity-0" : "group-hover:scale-[1.04]",
                soldOut && "grayscale-[60%]"
              )}
            />
            {hoverPhoto && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={hoverPhoto}
                alt=""
                aria-hidden
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover opacity-0 transition duration-500 group-hover:opacity-100 motion-reduce:transition-none"
              />
            )}
          </>
        ) : (
          <span className="flex h-full items-center justify-center text-slate-300">
            <ImageOff className="size-8" aria-hidden />
          </span>
        )}

        {stokBadge && (
          <span
            className={cn(
              "absolute left-2.5 top-2.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 backdrop-blur",
              URUN_STOK_BADGE_CLASSES[stokBadge.tone]
            )}
          >
            {stokBadge.label}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-3.5 sm:p-4">
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-slate-900 sm:text-[15px]">
          {urun.urun_adi}
        </h3>
        <div className="mt-auto flex items-end justify-between gap-2 pt-1">
          {fiyat ? (
            <p className={cn("text-base font-bold tracking-tight", soldOut ? "text-slate-400 line-through" : "text-emerald-700")}>
              {fiyat}
            </p>
          ) : (
            <p className="text-xs font-medium text-slate-500">Fiyat için sorun</p>
          )}
          <span className="shrink-0 text-xs font-semibold text-emerald-700 opacity-0 transition group-hover:opacity-100 max-sm:hidden">
            İncele →
          </span>
        </div>
      </div>
    </button>
  );
}
