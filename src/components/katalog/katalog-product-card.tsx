"use client";

import { useTransition } from "react";
import {
  formatKatalogPrice,
  getKatalogProductTitle,
} from "@/lib/katalog/katalog-display";
import { markKatalogItemSold } from "@/lib/katalog/katalog-actions";
import type { KatalogWebItem } from "@/types/database.types";
import { cn } from "@/lib/utils/cn";

export function KatalogProductCard({
  item,
  shopSlug,
  isOwner,
  onSold,
  className,
}: {
  item: KatalogWebItem;
  shopSlug: string;
  isOwner: boolean;
  onSold: (itemId: string) => void;
  className?: string;
}) {
  const [isPending, startTransition] = useTransition();
  const title = getKatalogProductTitle(item);
  const brandModel = [item.brand, item.model_name].filter(Boolean).join(" · ");
  const price = formatKatalogPrice(item.price);

  function handleMarkSold() {
    if (!isOwner || isPending) return;

    startTransition(async () => {
      const result = await markKatalogItemSold(item.id, shopSlug);
      if (result.success) {
        onSold(item.id);
      }
    });
  }

  return (
    <article
      className={cn(
        "group flex h-full min-w-0 flex-col overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md sm:rounded-2xl",
        className
      )}
    >
      <div className="relative aspect-square overflow-hidden bg-slate-100">
        {item.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.image_url}
            alt={title}
            className="h-full w-full object-cover object-center transition duration-500 group-hover:scale-[1.02]"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center px-4 text-center text-xs text-slate-400 sm:text-sm">
            Görsel yok
          </div>
        )}
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-2 p-3 sm:gap-3 sm:p-4">
        {brandModel && (
          <p className="truncate text-[11px] font-semibold uppercase tracking-wide text-emerald-700 sm:text-xs">
            {brandModel}
          </p>
        )}

        <h3 className="line-clamp-2 text-sm font-bold leading-snug text-slate-900 sm:text-base">
          {title}
        </h3>

        <p className="mt-auto text-lg font-extrabold tracking-tight text-slate-900 sm:text-xl">
          {price}
        </p>

        {isOwner && (
          <button
            type="button"
            onClick={handleMarkSold}
            disabled={isPending}
            className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-emerald-600 px-4 text-sm font-extrabold tracking-wide text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60 sm:min-h-12 sm:rounded-2xl sm:text-base"
          >
            {isPending ? "İşleniyor…" : "[SAT]"}
          </button>
        )}
      </div>
    </article>
  );
}
