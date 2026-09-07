"use client";

import { useMemo, useState } from "react";
import { ScrollReveal } from "@/components/motion/scroll-reveal";
import { SecondHandDeviceCard } from "@/components/dukkan/vitrin/second-hand-device-card";
import { VitrinDotGrid } from "@/components/dukkan/vitrin/vitrin-open-section";
import { MarketplaceListingToolbar } from "@/components/marketplace/marketplace-listing-toolbar";
import { filterPublicDevices } from "@/lib/marketplace/marketplace-filters";
import type {
  MarketplaceCategoryId,
  MarketplaceListingTypeId,
  MarketplaceSortId,
} from "@/lib/marketplace/public-listing.types";
import type { PublicSecondHandDevice } from "@/lib/dukkan/second-hand-devices";
import { desktopContainerClass } from "@/lib/utils/layout";
import type { Dukkan } from "@/types/database.types";

export function PazaryeriPageContent({
  dukkan,
  devices,
}: {
  dukkan: Dukkan;
  devices: PublicSecondHandDevice[];
}) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<MarketplaceSortId>("newest");
  const [category, setCategory] = useState<MarketplaceCategoryId>("all");
  const [listingType, setListingType] =
    useState<MarketplaceListingTypeId>("all");

  const filteredDevices = useMemo(
    () =>
      filterPublicDevices(devices, {
        query,
        category,
        listingType,
        sort,
      }),
    [devices, query, category, listingType, sort]
  );

  return (
    <div className={`${desktopContainerClass} relative pb-10 pt-8 lg:pb-16 lg:pt-12`}>
      <VitrinDotGrid />

      <ScrollReveal>
        <header className="mb-6 lg:mb-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
            Pazaryeri
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-emerald-700 sm:text-3xl lg:text-4xl">
            Cihaz İlanları
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-500 lg:text-base">
            {dukkan.dukkan_adi} vitrininde yayınlanan sıfır ve ikinci el
            cihazları filtreleyin, inceleyin ve WhatsApp ile hızlıca bilgi alın.
          </p>
        </header>
      </ScrollReveal>

      <ScrollReveal delay={0.03}>
        <MarketplaceListingToolbar
          query={query}
          onQueryChange={setQuery}
          sort={sort}
          onSortChange={setSort}
          category={category}
          onCategoryChange={setCategory}
          listingType={listingType}
          onListingTypeChange={setListingType}
          resultCount={filteredDevices.length}
          searchPlaceholder="Marka veya model ara..."
        />
      </ScrollReveal>

      {filteredDevices.length === 0 ? (
        <ScrollReveal delay={0.06}>
          <div className="mt-8 rounded-2xl border border-dashed border-slate-200 bg-white/70 px-6 py-16 text-center">
            <p className="text-base font-medium text-slate-600">
              {devices.length === 0
                ? "Henüz yayınlanmış cihaz ilanı bulunmuyor."
                : "Aramanıza uygun ilan bulunamadı."}
            </p>
            <p className="mt-2 text-sm text-slate-400">
              Filtreleri temizleyerek tüm ilanları görebilirsiniz.
            </p>
          </div>
        </ScrollReveal>
      ) : (
        <ul className="mt-6 space-y-3 sm:grid sm:grid-cols-2 sm:gap-4 sm:space-y-0 lg:grid-cols-3 lg:gap-5 xl:grid-cols-4">
          {filteredDevices.map((device, index) => (
            <ScrollReveal
              key={device.id ?? index}
              delay={index * 0.03}
              className="min-w-0"
            >
              <li>
                <SecondHandDeviceCard
                  device={device}
                  shopSlug={dukkan.slug}
                  shopName={dukkan.dukkan_adi}
                  whatsapp={dukkan.whatsapp}
                />
              </li>
            </ScrollReveal>
          ))}
        </ul>
      )}
    </div>
  );
}
