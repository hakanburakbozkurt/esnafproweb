"use client";

import { ArrowRight, Package } from "lucide-react";
import Link from "next/link";
import {
  getUrunItemPhotoUrls,
  UrunHiddenFields,
  type UrunFormItem,
} from "@/components/dukkan/product-photo-editor";
import { MAX_PRODUCT_PHOTOS } from "@/lib/supabase/storage.constants";

type UrunlerSummaryCardProps = {
  items: UrunFormItem[];
  href: string;
  /** Kaydedilmemiş değişiklik varken sayfadan ayrılmadan önce onay ister */
  confirmLeave: boolean;
};

export function UrunlerSummaryCard({ items, href, confirmLeave }: UrunlerSummaryCardProps) {
  const categories = new Set(
    items.map((item) => item.urun_kategorisi.trim()).filter(Boolean)
  );
  const previews = items
    .map((item) => getUrunItemPhotoUrls(item)[0])
    .filter((url): url is string => Boolean(url))
    .slice(0, 4);

  return (
    <div className="space-y-5">
      {items.map((item, index) => (
        <UrunHiddenFields key={item.id ?? `urun-${index}`} index={index} item={item} />
      ))}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          {previews.length ? (
            <div className="flex -space-x-3">
              {previews.map((url, index) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={`${url}-${index}`}
                  src={url}
                  alt=""
                  className="size-12 rounded-2xl border-2 border-white object-cover shadow-sm"
                />
              ))}
            </div>
          ) : (
            <span className="flex size-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              <Package className="size-5" aria-hidden />
            </span>
          )}
          <div>
            <p className="text-base font-semibold text-slate-900">
              {items.length
                ? `${items.length} / ${MAX_PRODUCT_PHOTOS} ürün`
                : "Henüz ürün eklenmedi"}
            </p>
            <p className="text-sm text-slate-500">
              {categories.size
                ? `${categories.size} kategori`
                : "Ürünlerinizi kategori, fiyat ve stokla yönetin"}
            </p>
          </div>
        </div>

        <Link
          href={href}
          onClick={(event) => {
            if (
              confirmLeave &&
              !window.confirm(
                "Mağaza ayarlarında kaydedilmemiş değişiklikler var. Sayfadan ayrılırsanız kaybolacak. Devam edilsin mi?"
              )
            ) {
              event.preventDefault();
            }
          }}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-emerald-600 px-6 text-sm font-semibold text-white shadow-sm shadow-emerald-600/20 transition hover:bg-emerald-700"
        >
          {items.length ? "Ürünleri yönet" : "Ürün ekle"}
          <ArrowRight className="size-4" aria-hidden />
        </Link>
      </div>
    </div>
  );
}
