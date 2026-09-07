"use client";

import {
  MARKETPLACE_CATEGORIES,
  MARKETPLACE_LISTING_TYPE_OPTIONS,
  MARKETPLACE_SORT_OPTIONS,
} from "@/lib/marketplace/marketplace-filters";
import type {
  MarketplaceCategoryId,
  MarketplaceListingTypeId,
  MarketplaceSortId,
} from "@/lib/marketplace/public-listing.types";
import { cn } from "@/lib/utils/cn";

type LocationOption = { value: string; label: string };

type MarketplaceListingToolbarProps = {
  query: string;
  onQueryChange: (value: string) => void;
  sort: MarketplaceSortId;
  onSortChange: (value: MarketplaceSortId) => void;
  category: MarketplaceCategoryId;
  onCategoryChange: (value: MarketplaceCategoryId) => void;
  listingType: MarketplaceListingTypeId;
  onListingTypeChange: (value: MarketplaceListingTypeId) => void;
  location?: string;
  onLocationChange?: (value: string) => void;
  locationOptions?: LocationOption[];
  resultCount: number;
  searchPlaceholder?: string;
};

export function MarketplaceListingToolbar({
  query,
  onQueryChange,
  sort,
  onSortChange,
  category,
  onCategoryChange,
  listingType,
  onListingTypeChange,
  location = "",
  onLocationChange,
  locationOptions = [],
  resultCount,
  searchPlaceholder = "Marka, model veya mağaza ara...",
}: MarketplaceListingToolbarProps) {
  return (
    <div className="space-y-4 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:rounded-3xl sm:p-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <label className="min-w-0 flex-1">
          <span className="sr-only">Ara</span>
          <input
            type="search"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder={searchPlaceholder}
            className="min-h-11 w-full rounded-xl border border-slate-200 bg-slate-50/80 px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-300 focus:bg-white focus:ring-2 focus:ring-emerald-100"
          />
        </label>

        <label className="lg:w-48">
          <span className="sr-only">Sıralama</span>
          <select
            value={sort}
            onChange={(event) =>
              onSortChange(event.target.value as MarketplaceSortId)
            }
            className="min-h-11 w-full rounded-xl border border-slate-200 bg-slate-50/80 px-4 text-sm font-medium text-slate-700 outline-none transition focus:border-emerald-300 focus:bg-white focus:ring-2 focus:ring-emerald-100"
          >
            {MARKETPLACE_SORT_OPTIONS.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <nav
          aria-label="İlan tipi"
          className="flex gap-2 overflow-x-auto pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {MARKETPLACE_LISTING_TYPE_OPTIONS.map((item) => {
            const active = listingType === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onListingTypeChange(item.id)}
                className={cn(
                  "inline-flex shrink-0 items-center rounded-full border px-3.5 py-2 text-xs font-semibold transition sm:text-sm",
                  active
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                )}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        <p className="shrink-0 text-sm text-slate-500">
          <span className="font-semibold text-slate-800">{resultCount}</span> ilan
        </p>
      </div>

      <nav
        aria-label="Kategori filtreleri"
        className="flex gap-2 overflow-x-auto pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {MARKETPLACE_CATEGORIES.map((item) => {
          const active = category === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onCategoryChange(item.id)}
              className={cn(
                "inline-flex shrink-0 items-center rounded-full border px-3.5 py-2 text-xs font-semibold transition sm:text-sm",
                active
                  ? "border-emerald-600 bg-emerald-600 text-white shadow-sm"
                  : "border-slate-200 bg-white text-slate-600 hover:border-emerald-300 hover:text-emerald-600"
              )}
            >
              {item.label}
            </button>
          );
        })}
      </nav>

      {onLocationChange && locationOptions.length > 0 && (
        <label className="block sm:max-w-xs">
          <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
            Konum
          </span>
          <select
            value={location}
            onChange={(event) => onLocationChange(event.target.value)}
            className="min-h-11 w-full rounded-xl border border-slate-200 bg-slate-50/80 px-4 text-sm font-medium text-slate-700 outline-none transition focus:border-emerald-300 focus:bg-white focus:ring-2 focus:ring-emerald-100"
          >
            <option value="">Tüm Konumlar</option>
            {locationOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      )}
    </div>
  );
}
