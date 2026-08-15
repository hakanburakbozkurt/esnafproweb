"use client";

import { useTransition } from "react";
import { markKatalogItemSold } from "@/lib/katalog/katalog-actions";
import { getKatalogProductTitle } from "@/lib/katalog/katalog-display";
import type { KatalogSelection } from "@/lib/katalog/katalog-tree";
import type { KatalogWebItem } from "@/types/database.types";
import { cn } from "@/lib/utils/cn";

export function KatalogModelGallery({
  items,
  selection,
  shopSlug,
  isOwner,
  onItemSold,
}: {
  items: KatalogWebItem[];
  selection: KatalogSelection | null;
  shopSlug: string;
  isOwner: boolean;
  onItemSold: (itemId: string) => void;
}) {
  if (!selection) {
    return <KatalogGalleryEmptyState />;
  }

  if (!items.length) {
    return (
      <KatalogGalleryEmptyState
        title="Bu model için görsel yok"
        description="Seçilen marka ve modelde listelenecek kılıf görseli bulunamadı."
      />
    );
  }

  return (
    <div className="min-w-0">
      <header className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">
          {selection.brand}
        </p>
        <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
          {selection.modelName}
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          {items.filter((item) => !item.is_sold).length} aktif · {items.length} toplam görsel
        </p>
      </header>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
        {items.map((item) => (
          <KatalogGalleryItem
            key={item.id}
            item={item}
            shopSlug={shopSlug}
            isOwner={isOwner}
            onSold={onItemSold}
          />
        ))}
      </div>
    </div>
  );
}

function KatalogGalleryItem({
  item,
  shopSlug,
  isOwner,
  onSold,
}: {
  item: KatalogWebItem;
  shopSlug: string;
  isOwner: boolean;
  onSold: (itemId: string) => void;
}) {
  const [isPending, startTransition] = useTransition();
  const isSold = item.is_sold;
  const title = getKatalogProductTitle(item);

  function handleMarkSold() {
    if (!isOwner || isSold || isPending) return;

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
        "group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition",
        isSold && "opacity-50"
      )}
    >
      <div className="relative aspect-square overflow-hidden bg-slate-100">
        {item.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.image_url}
            alt={title}
            className={cn(
              "h-full w-full object-cover object-center transition duration-500",
              !isSold && "group-hover:scale-[1.02]"
            )}
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center px-3 text-center text-xs text-slate-400">
            Görsel yok
          </div>
        )}

        {isSold && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900/20">
            <span className="rounded-full bg-slate-900/80 px-3 py-1 text-xs font-bold tracking-wide text-white">
              SATILDI
            </span>
          </div>
        )}
      </div>

      {isOwner && (
        <div className="p-3">
          <button
            type="button"
            onClick={handleMarkSold}
            disabled={isSold || isPending}
            className={cn(
              "inline-flex min-h-10 w-full items-center justify-center rounded-xl px-3 text-xs font-extrabold tracking-wide transition sm:text-sm",
              isSold
                ? "cursor-default bg-slate-100 text-slate-500"
                : "bg-emerald-600 text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            )}
          >
            {isSold ? "SATILDI" : isPending ? "İşleniyor…" : "SATILDI"}
          </button>
        </div>
      )}
    </article>
  );
}

function KatalogGalleryEmptyState({
  title = "Model seçin",
  description = "Sol taraftan bir marka ve model seçtiğinizde kılıf görselleri burada listelenecek.",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div className="flex min-h-[min(60vh,520px)] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white/70 px-6 py-14 text-center">
      <div className="mb-4 flex size-16 items-center justify-center rounded-2xl bg-emerald-50 text-2xl">
        📱
      </div>
      <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-slate-500">
        {description}
      </p>
    </div>
  );
}
