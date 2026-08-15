"use client";

import { useMemo, useState, type ReactNode } from "react";
import { KatalogProductCard } from "@/components/katalog/katalog-product-card";
import { useKatalogDeviceFilters } from "@/lib/katalog/use-katalog-device-filters";
import { desktopContainerClass } from "@/lib/utils/layout";
import type { KatalogWebItem } from "@/types/database.types";
import { cn } from "@/lib/utils/cn";

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
  const {
    brand,
    model,
    brands,
    models,
    brandsLoading,
    modelsLoading,
    filteredItems,
    setBrand,
    setModel,
    resetFilters,
  } = useKatalogDeviceFilters(items);

  function handleSold(itemId: string) {
    setItems((current) => current.filter((item) => item.id !== itemId));
  }

  return (
    <div className="py-8 lg:py-12">
      <div className={desktopContainerClass}>
        <header className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600 sm:text-sm">
            Mağaza Kataloğu
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl lg:text-4xl">
            {shopName} Katalog
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base">
            Marka ve modele göre filtreleyin; vitrindeki güncel ürünleri inceleyin.
          </p>
        </header>

        <div className="mt-8 rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-sm backdrop-blur-sm sm:mt-10 sm:p-5 lg:p-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_auto] lg:items-end">
            <FilterField label="Marka">
              <select
                value={brand}
                onChange={(event) => setBrand(event.target.value)}
                disabled={brandsLoading}
                className={cn(selectClassName, brandsLoading && "opacity-70")}
              >
                <option value="">
                  {brandsLoading ? "Markalar yükleniyor…" : "Tüm markalar"}
                </option>
                {brands.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </FilterField>

            <FilterField label="Model">
              <select
                value={model}
                onChange={(event) => setModel(event.target.value)}
                disabled={!brand || modelsLoading}
                className={cn(
                  selectClassName,
                  (!brand || modelsLoading) && "cursor-not-allowed opacity-60"
                )}
              >
                <option value="">
                  {!brand
                    ? "Önce marka seçin"
                    : modelsLoading
                      ? "Modeller yükleniyor…"
                      : models.length === 0
                        ? "Bu marka için model yok"
                        : "Tüm modeller"}
                </option>
                {models.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </FilterField>

            <button
              type="button"
              onClick={resetFilters}
              disabled={!brand && !model}
              className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-700 transition hover:border-emerald-300 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-50 sm:min-h-12"
            >
              Filtreleri temizle
            </button>
          </div>
        </div>

        {filteredItems.length > 0 ? (
          <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 lg:mt-10 lg:grid-cols-4 lg:gap-5">
            {filteredItems.map((item) => (
              <KatalogProductCard
                key={item.id}
                item={item}
                shopSlug={shopSlug}
                isOwner={isOwner}
                onSold={handleSold}
              />
            ))}
          </div>
        ) : (
          <div className="mt-10 rounded-2xl border border-dashed border-slate-200 bg-white/70 px-6 py-14 text-center">
            <p className="text-base font-semibold text-slate-800">
              {items.length === 0
                ? "Katalogda henüz ürün yok."
                : "Seçilen filtreye uygun ürün bulunamadı."}
            </p>
            <p className="mt-2 text-sm text-slate-500">
              {items.length === 0
                ? "Yeni ürünler eklendiğinde burada listelenecek."
                : "Farklı bir marka veya model deneyin."}
            </p>
          </div>
        )}

        {isOwner && filteredItems.length > 0 && (
          <p className="mt-6 text-center text-xs text-slate-500 sm:text-sm">
            [SAT] butonu yalnızca mağaza sahibine görünür; satılan ürün anında listeden kaldırılır.
          </p>
        )}
      </div>
    </div>
  );
}

function FilterField({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block min-w-0">
      <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </span>
      {children}
    </label>
  );
}

const selectClassName =
  "h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-800 shadow-sm outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 sm:h-12 sm:px-4";
