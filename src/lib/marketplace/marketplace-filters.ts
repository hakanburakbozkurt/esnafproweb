import type {
  MarketplaceCategoryId,
  MarketplaceListing,
  MarketplaceListingTypeId,
  MarketplaceSortId,
} from "@/lib/marketplace/public-listing.types";
import type { PublicSecondHandDevice } from "@/lib/dukkan/second-hand-devices";
import { getDeviceCategoryLabel } from "@/lib/dukkan/second-hand-devices";

export const MARKETPLACE_LISTING_TYPE_OPTIONS: Array<{
  id: MarketplaceListingTypeId;
  label: string;
}> = [
  { id: "all", label: "Tüm İlanlar" },
  { id: "new", label: "Sıfır" },
  { id: "used", label: "İkinci El" },
];

export const MARKETPLACE_CATEGORIES: Array<{
  id: MarketplaceCategoryId;
  label: string;
}> = [
  { id: "all", label: "Tümü" },
  { id: "telefon", label: "Telefon" },
  { id: "tablet", label: "Tablet" },
  { id: "bilgisayar", label: "Bilgisayar" },
  { id: "akilli_saat", label: "Akıllı Saat" },
  { id: "konsol", label: "Konsol" },
];

export const MARKETPLACE_SORT_OPTIONS: Array<{
  id: MarketplaceSortId;
  label: string;
}> = [
  { id: "newest", label: "En Yeni" },
  { id: "price_asc", label: "En Düşük Fiyat" },
  { id: "price_desc", label: "En Yüksek Fiyat" },
];

const CATEGORY_DEVICE_MAP: Record<
  Exclude<MarketplaceCategoryId, "all">,
  string
> = {
  telefon: "phone",
  tablet: "tablet",
  bilgisayar: "computer",
  akilli_saat: "watch",
  konsol: "console",
};

const CATEGORY_MATCHERS: Record<
  Exclude<MarketplaceCategoryId, "all">,
  RegExp
> = {
  telefon: /telefon|phone|smartphone|iphone|android/i,
  tablet: /tablet|ipad/i,
  bilgisayar: /bilgisayar|laptop|notebook|computer|pc|macbook/i,
  akilli_saat: /saat|watch|wearable|smartwatch/i,
  konsol: /konsol|console|playstation|ps[345]|xbox|nintendo|switch/i,
};

export function matchesMarketplaceCategory(
  listing: MarketplaceListing,
  category: MarketplaceCategoryId
): boolean {
  if (category === "all") return true;

  const categoryKey = CATEGORY_DEVICE_MAP[category];
  if (listing.device.device_category?.trim() === categoryKey) {
    return true;
  }

  const haystack = [
    listing.device.device_category,
    listing.device.brand,
    listing.device.model,
    listing.device.web_title,
  ]
    .filter(Boolean)
    .join(" ");

  return CATEGORY_MATCHERS[category].test(haystack);
}

export function matchesListingType(
  listingType: string | null | undefined,
  filter: MarketplaceListingTypeId
): boolean {
  if (filter === "all") return true;
  const normalized = listingType?.trim() === "new" ? "new" : "used";
  return normalized === filter;
}

export function matchesPublicDeviceCategory(
  device: PublicSecondHandDevice,
  category: MarketplaceCategoryId
): boolean {
  if (category === "all") return true;

  const categoryKey = CATEGORY_DEVICE_MAP[category];
  if (device.device_category?.trim() === categoryKey) {
    return true;
  }

  const haystack = [
    device.device_category,
    device.brand,
    device.model,
    device.web_title,
  ]
    .filter(Boolean)
    .join(" ");

  return CATEGORY_MATCHERS[category].test(haystack);
}

export function sortPublicDevices(
  devices: PublicSecondHandDevice[],
  sort: MarketplaceSortId
): PublicSecondHandDevice[] {
  return [...devices].sort((a, b) => {
    switch (sort) {
      case "price_asc": {
        const priceA = a.sale_price ?? Number.MAX_SAFE_INTEGER;
        const priceB = b.sale_price ?? Number.MAX_SAFE_INTEGER;
        return priceA - priceB;
      }
      case "price_desc": {
        const priceA = a.sale_price ?? -1;
        const priceB = b.sale_price ?? -1;
        return priceB - priceA;
      }
      case "newest":
      default: {
        const dateA = new Date(
          a.web_published_at ?? a.created_at ?? 0
        ).getTime();
        const dateB = new Date(
          b.web_published_at ?? b.created_at ?? 0
        ).getTime();
        return dateB - dateA;
      }
    }
  });
}

export function filterPublicDevices(
  devices: PublicSecondHandDevice[],
  options: {
    query: string;
    category: MarketplaceCategoryId;
    listingType: MarketplaceListingTypeId;
    sort: MarketplaceSortId;
  }
): PublicSecondHandDevice[] {
  const normalizedQuery = options.query.trim().toLocaleLowerCase("tr-TR");

  let filtered = devices.filter((device) => {
    if (!matchesPublicDeviceCategory(device, options.category)) {
      return false;
    }

    if (!matchesListingType(device.listing_type, options.listingType)) {
      return false;
    }

    if (!normalizedQuery) return true;

    const searchHaystack = [
      device.brand,
      device.model,
      device.web_title,
      device.web_description,
      device.color,
      getDeviceCategoryLabel(device.device_category),
    ]
      .filter(Boolean)
      .join(" ")
      .toLocaleLowerCase("tr-TR");

    return searchHaystack.includes(normalizedQuery);
  });

  return sortPublicDevices(filtered, options.sort);
}

export function buildLocationOptions(
  listings: MarketplaceListing[]
): Array<{ value: string; label: string }> {
  const locations = new Map<string, string>();

  for (const listing of listings) {
    if (listing.locationLabel) {
      locations.set(listing.locationLabel, listing.locationLabel);
    } else if (listing.il) {
      locations.set(listing.il, listing.il);
    }
  }

  return [...locations.values()]
    .sort((a, b) => a.localeCompare(b, "tr"))
    .map((label) => ({ value: label, label }));
}

export function filterMarketplaceListings(
  listings: MarketplaceListing[],
  options: {
    query: string;
    category: MarketplaceCategoryId;
    location: string;
    listingType: MarketplaceListingTypeId;
    sort: MarketplaceSortId;
  }
): MarketplaceListing[] {
  const normalizedQuery = options.query.trim().toLocaleLowerCase("tr-TR");

  let filtered = listings.filter((listing) => {
    if (!matchesMarketplaceCategory(listing, options.category)) {
      return false;
    }

    if (!matchesListingType(listing.device.listing_type, options.listingType)) {
      return false;
    }

    if (options.location) {
      const locationHaystack = [
        listing.locationLabel,
        listing.il,
        listing.ilce,
        listing.shop.adres,
      ]
        .filter(Boolean)
        .join(" ")
        .toLocaleLowerCase("tr-TR");

      if (!locationHaystack.includes(options.location.toLocaleLowerCase("tr-TR"))) {
        return false;
      }
    }

    if (!normalizedQuery) return true;

    const searchHaystack = [
      listing.device.brand,
      listing.device.model,
      listing.device.web_title,
      listing.device.web_description,
      listing.shop.dukkan_adi,
      listing.locationLabel,
    ]
      .filter(Boolean)
      .join(" ")
      .toLocaleLowerCase("tr-TR");

    return searchHaystack.includes(normalizedQuery);
  });

  filtered = [...filtered].sort((a, b) => {
    switch (options.sort) {
      case "price_asc": {
        const priceA = a.device.sale_price ?? Number.MAX_SAFE_INTEGER;
        const priceB = b.device.sale_price ?? Number.MAX_SAFE_INTEGER;
        return priceA - priceB;
      }
      case "price_desc": {
        const priceA = a.device.sale_price ?? -1;
        const priceB = b.device.sale_price ?? -1;
        return priceB - priceA;
      }
      case "newest":
      default: {
        const dateA = new Date(
          a.device.web_published_at ?? a.device.created_at ?? 0
        ).getTime();
        const dateB = new Date(
          b.device.web_published_at ?? b.device.created_at ?? 0
        ).getTime();
        return dateB - dateA;
      }
    }
  });

  return filtered;
}
