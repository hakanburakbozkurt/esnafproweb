"use client";

import { CircleAlert, ImageOff, Images, Pencil } from "lucide-react";
import {
  getUrunItemPhotoUrls,
  type UrunFormItem,
} from "@/components/dukkan/product-photo-editor";
import { getUrunStokBadge, URUN_STOK_BADGE_CLASSES } from "@/lib/dukkan/urun-stok";
import { cn } from "@/lib/utils/cn";

type UrunCardProps = {
  item: UrunFormItem;
  position: number;
  onEdit: () => void;
};

export function UrunCard({ item, position, onEdit }: UrunCardProps) {
  const photos = getUrunItemPhotoUrls(item);
  const cover = photos[0];
  const stokBadge = getUrunStokBadge(item.stok_adedi);
  const title = item.urun_adi.trim() || `Ürün ${position}`;
  const kategori = item.urun_kategorisi.trim();
  const fiyat = item.fiyat.trim();

  return (
    <button
      type="button"
      onClick={onEdit}
      aria-label={`${title} ürününü düzenle`}
      className="group flex w-full flex-col overflow-hidden rounded-3xl border border-slate-200/80 bg-white text-left shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
    >
      <div className="relative aspect-square w-full overflow-hidden bg-slate-100">
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={cover}
            alt=""
            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          />
        ) : (
          <span className="flex h-full w-full flex-col items-center justify-center gap-2 text-slate-400">
            <ImageOff className="size-7" aria-hidden />
            <span className="text-xs font-medium">Fotoğraf yok</span>
          </span>
        )}

        {photos.length > 1 && (
          <span className="absolute bottom-2 right-2 inline-flex items-center gap-1 rounded-full bg-slate-900/70 px-2 py-1 text-[11px] font-semibold text-white backdrop-blur">
            <Images className="size-3" aria-hidden />
            {photos.length}
          </span>
        )}

        {stokBadge && (
          <span
            className={cn(
              "absolute left-2 top-2 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1",
              URUN_STOK_BADGE_CLASSES[stokBadge.tone]
            )}
          >
            {stokBadge.label}
          </span>
        )}

        <span
          aria-hidden
          className="absolute right-2 top-2 flex size-9 items-center justify-center rounded-full bg-white/90 text-slate-600 opacity-0 shadow-sm transition group-hover:opacity-100 group-focus-visible:opacity-100"
        >
          <Pencil className="size-4" />
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-3.5">
        {kategori && (
          <span className="w-fit max-w-full truncate rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-600">
            {kategori}
          </span>
        )}
        <p className="line-clamp-2 text-sm font-semibold leading-snug text-slate-900">
          {title}
        </p>
        {fiyat ? (
          <p className="mt-auto text-sm font-bold text-emerald-700">{fiyat}</p>
        ) : (
          <p className="mt-auto text-xs text-slate-400">Fiyat girilmedi</p>
        )}
        {!cover && (
          <p className="flex items-center gap-1 text-[11px] font-medium text-amber-700">
            <CircleAlert className="size-3.5 shrink-0" aria-hidden />
            Fotoğraf eklenmezse kaydedilmez
          </p>
        )}
      </div>
    </button>
  );
}
