"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { KatalogBrandModelTree } from "@/components/katalog/katalog-brand-model-tree";
import { KatalogModelGallery } from "@/components/katalog/katalog-model-gallery";
import {
  buildKatalogTree,
  filterKatalogItemsBySelection,
  type KatalogSelection,
} from "@/lib/katalog/katalog-tree";
import { desktopContainerClass } from "@/lib/utils/layout";
import type { KatalogWebItem } from "@/types/database.types";

export function KatalogPageContent({
  shopSlug,
  shopName,
  items: initialItems,
  isOwner,
}: {
  shopSlug: string;
  shopName: string;
  items: KatalogWebItem[];
  isOwner: boolean;
}) {
  const [items, setItems] = useState(initialItems);
  const [selection, setSelection] = useState<KatalogSelection | null>(null);

  const tree = useMemo(() => buildKatalogTree(items), [items]);

  const selectedItems = useMemo(
    () => filterKatalogItemsBySelection(items, selection),
    [items, selection]
  );

  function handleItemSold(itemId: string) {
    setItems((current) =>
      current.map((item) =>
        item.id === itemId ? { ...item, is_sold: true } : item
      )
    );
  }

  function handleItemUnsold(itemId: string) {
    setItems((current) =>
      current.map((item) =>
        item.id === itemId ? { ...item, is_sold: false } : item
      )
    );
  }

  return (
    <div className="py-8 lg:py-12">
      <div className={desktopContainerClass}>
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600 sm:text-sm">
              Mağaza Kataloğu
            </p>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl lg:text-4xl">
              {shopName} Katalog
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">
              Sol menüden marka ve model seçin; sağ tarafta ilgili kılıf görselleri listelenir.
            </p>
          </div>

          {isOwner && (
            <Link
              href="/yonetim/katalog"
              className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 px-5 py-2.5 text-sm font-semibold text-emerald-700 transition hover:border-emerald-300 hover:bg-emerald-100"
            >
              Toplu Ürün Ekle
            </Link>
          )}
        </header>

        <div className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,18rem)_minmax(0,1fr)] lg:items-start">
          <KatalogBrandModelTree
            tree={tree}
            selection={selection}
            onSelect={setSelection}
            className="lg:sticky lg:top-24"
          />

          <KatalogModelGallery
            items={selectedItems}
            selection={selection}
            shopSlug={shopSlug}
            isOwner={isOwner}
            onItemSold={handleItemSold}
            onItemUnsold={handleItemUnsold}
          />
        </div>
      </div>
    </div>
  );
}
