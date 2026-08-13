import type {
  MarketplaceCategoryId,
  MarketplaceListing,
  MarketplaceSortId,
} from "@/lib/marketplace/public-listing.types";

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
    sort: MarketplaceSortId;
  }
): MarketplaceListing[] {
  const normalizedQuery = options.query.trim().toLocaleLowerCase("tr-TR");

  let filtered = listings.filter((listing) => {
    if (!matchesMarketplaceCategory(listing, options.category)) {
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
