import {
  GOOGLE_BUSINESS_PROFILE_LABEL,
  GOOGLE_ORGANIZATION_SAME_AS,
  GOOGLE_REVIEWS_ATTRIBUTION_NOTE,
} from "@/lib/google-reviews/constants";
import type { GoogleReviewsAttribution } from "@/lib/google-reviews/types";

const PLACE_ID_PATTERN = /^ChIJ[A-Za-z0-9_-]+$/;

export function normalizeGooglePlaceId(
  value: string | null | undefined
): string | null {
  const trimmed = value?.trim();
  if (!trimmed) return null;

  const withoutPrefix = trimmed.replace(/^places\//i, "");
  if (!PLACE_ID_PATTERN.test(withoutPrefix)) {
    return null;
  }

  return withoutPrefix;
}

/** Google Maps linki veya ham Place ID metninden place_id çıkarır (API gerekmez) */
export function parseGoogleMapsInput(raw: string | null | undefined): string | null {
  const trimmed = raw?.trim();
  if (!trimmed) return null;

  const direct = normalizeGooglePlaceId(trimmed);
  if (direct) return direct;

  const chijInText = trimmed.match(/(ChIJ[A-Za-z0-9_-]+)/);
  if (chijInText) {
    return normalizeGooglePlaceId(chijInText[1]);
  }

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    try {
      const url = new URL(trimmed);

      for (const key of ["place_id", "query_place_id"] as const) {
        const param = url.searchParams.get(key);
        const parsed = normalizeGooglePlaceId(param);
        if (parsed) return parsed;
      }

      const q = url.searchParams.get("q");
      if (q) {
        const qMatch = q.match(/place_id:?(ChIJ[A-Za-z0-9_-]+)/i);
        if (qMatch) {
          return normalizeGooglePlaceId(qMatch[1]);
        }
      }
    } catch {
      // URL parse edilemedi — metin içi kalıplara düş
    }
  }

  const dataMatch = trimmed.match(/!1s(ChIJ[A-Za-z0-9_-]+)/);
  if (dataMatch) {
    return normalizeGooglePlaceId(dataMatch[1]);
  }

  const paramMatch = trimmed.match(/place_id[=:](ChIJ[A-Za-z0-9_-]+)/i);
  if (paramMatch) {
    return normalizeGooglePlaceId(paramMatch[1]);
  }

  return null;
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

export function validateGoogleMapsReferenceInput(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) {
    return "Google Maps linki veya Place ID girin.";
  }

  if (!parseGoogleMapsInput(trimmed)) {
    return "Geçerli bir Google Maps linki veya Place ID (ChIJ...) yapıştırın.";
  }

  return null;
}

/** @deprecated validateGoogleMapsReferenceInput kullanın */
export function validateGooglePlaceIdInput(value: string): string | null {
  return validateGoogleMapsReferenceInput(value);
}
