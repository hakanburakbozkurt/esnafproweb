"use client";

import { useMemo, useState } from "react";
import { MarketplaceDeviceCard } from "@/components/marketplace/marketplace-device-card";
import { MarketplaceListingToolbar } from "@/components/marketplace/marketplace-listing-toolbar";
import {
  buildLocationOptions,
  filterMarketplaceListings,
} from "@/lib/marketplace/marketplace-filters";
import { useUserGeolocation } from "@/lib/marketplace/use-user-geolocation";
import type {
  MarketplaceCategoryId,
  MarketplaceListing,
  MarketplaceListingTypeId,
  MarketplaceSortId,
} from "@/lib/marketplace/public-listing.types";

export function MarketplacePageContent({
  listings,
}: {
  listings: MarketplaceListing[];
}) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<MarketplaceSortId>("newest");
  const [category, setCategory] = useState<MarketplaceCategoryId>("all");
  const [listingType, setListingType] =
    useState<MarketplaceListingTypeId>("all");
  const [location, setLocation] = useState("");
  const { coords: userCoords } = useUserGeolocation();

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
        listingType,
        sort,
      }),
    [listings, query, category, location, listingType, sort]
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
          Esnaf Pro üyesi mağazaların yayınladığı sıfır ve ikinci el cihaz
          ilanlarını tek yerden keşfedin.
        </p>
      </header>

      <div className="mt-8">
        <MarketplaceListingToolbar
          query={query}
          onQueryChange={setQuery}
          sort={sort}
          onSortChange={setSort}
          category={category}
          onCategoryChange={setCategory}
          listingType={listingType}
          onListingTypeChange={setListingType}
          location={location}
          onLocationChange={setLocation}
          locationOptions={locationOptions}
          resultCount={filteredListings.length}
        />
      </div>

      {filteredListings.length > 0 ? (
        <ul className="mt-6 space-y-3 sm:grid sm:grid-cols-2 sm:gap-4 sm:space-y-0 lg:grid-cols-3 lg:gap-6">
          {filteredListings.map((listing) => (
            <li key={listing.device.id}>
              <MarketplaceDeviceCard
                listing={listing}
                userCoords={userCoords}
              />
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
