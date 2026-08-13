"use client";

import { useMemo, useState } from "react";
import { MarketplaceDeviceCard } from "@/components/marketplace/marketplace-device-card";
import {
  buildLocationOptions,
  filterMarketplaceListings,
  MARKETPLACE_CATEGORIES,
  MARKETPLACE_SORT_OPTIONS,
} from "@/lib/marketplace/marketplace-filters";
import type {
  MarketplaceCategoryId,
  MarketplaceListing,
  MarketplaceSortId,
} from "@/lib/marketplace/public-listing.types";
import { cn } from "@/lib/utils/cn";

export function MarketplacePageContent({
  listings,
}: {
  listings: MarketplaceListing[];
}) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<MarketplaceSortId>("newest");
  const [category, setCategory] = useState<MarketplaceCategoryId>("all");
  const [location, setLocation] = useState("");

  const locationOptions = useMemo(
    () => buildLocationOptions(listings),
    [listings]
  );

  const filteredListings = useMemo(
    () =>
      filterMarketplaceListings(listings, {
        query,
        category,
        location,
        sort,
      }),
    [listings, query, category, location, sort]
  );

  return (
    <div className="mx-auto w-full min-w-0 max-w-6xl">
      <header className="max-w-3xl">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-600">
          İkinci El Pazaryeri
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Esnaf Pro Pazaryeri
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base">
          Esnaf Pro üyesi mağazaların yayınladığı ikinci el telefon ve cihaz
          ilanlarını tek yerden keşfedin.
        </p>
      </header>

      <div className="mt-8 space-y-4 rounded-3xl border border-slate-200/80 bg-slate-50/60 p-4 sm:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <label className="min-w-0 flex-1">
            <span className="sr-only">Marka veya model ara</span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Marka, model veya mağaza ara..."
              className="min-h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100"
            />
          </label>

          <label className="lg:w-52">
            <span className="sr-only">Sıralama</span>
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value as MarketplaceSortId)}
              className="min-h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 outline-none transition focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100"
            >
              {MARKETPLACE_SORT_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <nav
          aria-label="Kategori filtreleri"
          className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {MARKETPLACE_CATEGORIES.map((item) => {
            const active = category === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setCategory(item.id)}
                className={cn(
                  "inline-flex shrink-0 items-center rounded-full border px-4 py-2 text-xs font-semibold transition sm:text-sm",
                  active
                    ? "border-emerald-600 bg-emerald-600 text-white shadow-sm"
                    : "border-slate-200/80 bg-white text-slate-600 hover:border-emerald-300 hover:text-emerald-600"
                )}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <label className="sm:min-w-[14rem] sm:max-w-xs">
            <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
              Konum
            </span>
            <select
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              className="min-h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 outline-none transition focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100"
            >
              <option value="">Tüm Konumlar</option>
              {locationOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <p className="text-sm text-slate-500">
            <span className="font-semibold text-slate-700">
              {filteredListings.length}
            </span>{" "}
            ilan listeleniyor
          </p>
        </div>
      </div>

      {filteredListings.length > 0 ? (
        <ul className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-6">
          {filteredListings.map((listing) => (
            <li key={listing.device.id}>
              <MarketplaceDeviceCard listing={listing} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-10 rounded-3xl border border-dashed border-slate-200 bg-white px-6 py-12 text-center">
          <p className="text-base font-semibold text-slate-900">
            Aramanıza uygun ilan bulunamadı
          </p>
          <p className="mt-2 text-sm text-slate-500">
            Filtreleri temizleyerek tüm yayınlanmış ilanları görebilirsiniz.
          </p>
        </div>
      )}
    </div>
  );
}
