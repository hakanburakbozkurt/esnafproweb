"use client";

import { useEffect, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import {
  markKatalogItemSold,
  markKatalogItemUnsold,
} from "@/lib/katalog/katalog-actions";
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
  onItemUnsold,
}: {
  items: KatalogWebItem[];
  selection: KatalogSelection | null;
  shopSlug: string;
  isOwner: boolean;
  onItemSold: (itemId: string) => void;
  onItemUnsold: (itemId: string) => void;
}) {
  const [previewItem, setPreviewItem] = useState<KatalogWebItem | null>(null);

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
            onUnsold={onItemUnsold}
            onPreview={setPreviewItem}
          />
        ))}
      </div>

      <KatalogImageLightbox
        item={previewItem}
        onClose={() => setPreviewItem(null)}
      />
    </div>
  );
}

function KatalogGalleryItem({
  item,
  shopSlug,
  isOwner,
  onSold,
  onUnsold,
  onPreview,
}: {
  item: KatalogWebItem;
  shopSlug: string;
  isOwner: boolean;
  onSold: (itemId: string) => void;
  onUnsold: (itemId: string) => void;
  onPreview: (item: KatalogWebItem) => void;
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

  function handleMarkUnsold() {
    if (!isOwner || !isSold || isPending) return;

    startTransition(async () => {
      const result = await markKatalogItemUnsold(item.id, shopSlug);
      if (result.success) {
        onUnsold(item.id);
      }
    });
  }

  return (
    <article
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition-opacity duration-300",
        isSold && "opacity-50"
      )}
    >
      <button
        type="button"
        onClick={() => item.image_url && onPreview(item)}
        disabled={!item.image_url}
        aria-label={`${title} görselini büyüt`}
        className={cn(
          "relative aspect-square w-full overflow-hidden bg-slate-100 text-left",
          item.image_url && "cursor-zoom-in"
        )}
      >
        {item.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.image_url}
            alt={title}
            className={cn(
              "h-full w-full object-cover object-center transition duration-500",
              !isSold && "group-hover:scale-[1.03]"
            )}
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center px-3 text-center text-xs text-slate-400">
            Görsel yok
          </div>
        )}

        {isSold && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-slate-900/20">
            <span className="rounded-full bg-slate-900/80 px-3 py-1 text-xs font-bold tracking-wide text-white">
              SATILDI
            </span>
          </div>
        )}
      </button>

      {isOwner && (
        <div className="p-3">
          {isSold ? (
            <button
              type="button"
              onClick={handleMarkUnsold}
              disabled={isPending}
              className="inline-flex min-h-10 w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-3 text-xs font-extrabold tracking-wide text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-60 sm:text-sm"
            >
              {isPending ? "İşleniyor…" : "GERİ AL"}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleMarkSold}
              disabled={isPending}
              className="inline-flex min-h-10 w-full items-center justify-center rounded-xl bg-emerald-600 px-3 text-xs font-extrabold tracking-wide text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60 sm:text-sm"
            >
              {isPending ? "İşleniyor…" : "SATILDI"}
            </button>
          )}
        </div>
      )}
    </article>
  );
}

function KatalogImageLightbox({
  item,
  onClose,
}: {
  item: KatalogWebItem | null;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!item) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [item, onClose]);

  if (!item?.image_url || typeof document === "undefined") {
    return null;
  }

  const title = getKatalogProductTitle(item);

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-8">
      <button
        type="button"
        aria-label="Önizlemeyi kapat"
        className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm"
        onClick={onClose}
      />

      <figure className="relative z-[201] flex max-h-[min(90vh,900px)] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3 sm:px-5">
          <figcaption className="min-w-0 truncate text-sm font-semibold text-slate-900 sm:text-base">
            {title}
          </figcaption>
          <button
            type="button"
            onClick={onClose}
            aria-label="Kapat"
            className="inline-flex size-9 shrink-0 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-800"
          >
            ✕
          </button>
        </div>

        <div className="flex min-h-0 flex-1 items-center justify-center bg-slate-50 p-4 sm:p-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={item.image_url}
            alt={title}
            className="max-h-[min(75vh,780px)] w-full object-contain"
          />
        </div>
      </figure>
    </div>,
    document.body
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
