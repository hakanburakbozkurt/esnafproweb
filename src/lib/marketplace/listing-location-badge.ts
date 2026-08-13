import {
  formatDistanceLabel,
  haversineDistanceKm,
  hasValidCoordinates,
  type GeoCoordinates,
} from "@/lib/geo/haversine";
import type { MarketplaceListing } from "@/lib/marketplace/public-listing.types";

export function getListingLocationBadgeLabel(
  listing: MarketplaceListing,
  userCoords: GeoCoordinates | null
): string | null {
  const { shop, locationLabel } = listing;

  if (
    hasValidCoordinates(shop.enlem, shop.boylam) &&
    userCoords
  ) {
    const km = haversineDistanceKm(userCoords, {
      lat: shop.enlem,
      lng: shop.boylam!,
    });

    const label = formatDistanceLabel(km);
    return label || null;
  }

  return locationLabel;
}

/** Rozet konum etiketi gösteriyorsa kart altındaki tekrarı gizle */
export function shouldShowLocationSubtitle(
  listing: MarketplaceListing,
  userCoords: GeoCoordinates | null
): boolean {
  const badge = getListingLocationBadgeLabel(listing, userCoords);
  if (!badge || !listing.locationLabel) return Boolean(listing.locationLabel);

  if (
    hasValidCoordinates(listing.shop.enlem, listing.shop.boylam) &&
    userCoords
  ) {
    return true;
  }

  return badge !== listing.locationLabel;
}
