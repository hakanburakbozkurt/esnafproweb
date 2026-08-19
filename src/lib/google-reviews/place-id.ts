import {
  GOOGLE_BUSINESS_PROFILE_LABEL,
  GOOGLE_ORGANIZATION_SAME_AS,
  GOOGLE_REVIEWS_ATTRIBUTION_NOTE,
} from "@/lib/google-reviews/constants";
import type { GoogleReviewsAttribution } from "@/lib/google-reviews/types";

const PLACE_ID_PATTERN = /^[A-Za-z0-9_-]+$/;

export function normalizeGooglePlaceId(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  if (!trimmed) return null;

  const withoutPrefix = trimmed.replace(/^places\//i, "");
  if (!PLACE_ID_PATTERN.test(withoutPrefix)) {
    return null;
  }

  return withoutPrefix;
}

export function buildGoogleMapsPlaceUrl(placeId: string): string {
  return `https://www.google.com/maps/search/?api=1&query=Google&query_place_id=${encodeURIComponent(placeId)}`;
}

export function buildGoogleMapsReviewsUrl(
  placeId: string,
  mapsUri?: string | null
): string {
  if (mapsUri?.trim()) {
    return mapsUri.trim();
  }

  return buildGoogleMapsPlaceUrl(placeId);
}

export function resolveGoogleReviewSourceUrl(input: {
  placeId: string;
  mapsReviewsUrl: string;
  authorProfileUrl?: string | null;
  reviewResourceName?: string | null;
}): string {
  if (input.authorProfileUrl?.trim()) {
    return input.authorProfileUrl.trim();
  }

  return input.mapsReviewsUrl;
}

export function buildGoogleReviewsAttribution(
  mapsReviewsUrl: string
): GoogleReviewsAttribution {
  return {
    sourceLabel: GOOGLE_BUSINESS_PROFILE_LABEL,
    sourceOrganization: "Google",
    profileUrl: mapsReviewsUrl,
    licenseNote: GOOGLE_REVIEWS_ATTRIBUTION_NOTE,
  };
}

export function buildGooglePublisherSchema() {
  return {
    "@type": "Organization" as const,
    name: "Google",
    sameAs: GOOGLE_ORGANIZATION_SAME_AS,
  };
}

export function validateGooglePlaceIdInput(value: string): string | null {
  const normalized = normalizeGooglePlaceId(value);
  if (!normalized) {
    return "Geçerli bir Google Place ID girin (Google İşletme Profili → Paylaş → Place ID).";
  }
  return null;
}
