import type { SupabaseClient } from "@supabase/supabase-js";
import { GOOGLE_REVIEWS_CACHE_TTL_MS } from "@/lib/google-reviews/constants";
import { fetchGooglePlaceReviews } from "@/lib/google-reviews/fetch-place-reviews";
import {
  parseGoogleReviewsCache,
  toGoogleReviewsCacheRow,
} from "@/lib/google-reviews/parse-cache";
import { normalizeGooglePlaceId } from "@/lib/google-reviews/place-id";
import type {
  DukkanGoogleReviewsSource,
  GoogleReviewsBundle,
} from "@/lib/google-reviews/types";
import type { Database } from "@/types/database.types";

type SupabaseDbClient = SupabaseClient<Database>;

function isCacheStale(fetchedAt: string | null | undefined): boolean {
  if (!fetchedAt) return true;
  const fetchedMs = new Date(fetchedAt).getTime();
  if (Number.isNaN(fetchedMs)) return true;
  return Date.now() - fetchedMs > GOOGLE_REVIEWS_CACHE_TTL_MS;
}

async function persistGoogleReviewsCache(
  supabase: SupabaseDbClient,
  dukkanId: string,
  bundle: GoogleReviewsBundle
) {
  const { error } = await supabase
    .from("dukkanlar")
    .update({
      google_reviews_cache: toGoogleReviewsCacheRow(bundle),
      google_reviews_fetched_at: bundle.fetchedAt,
      updated_at: new Date().toISOString(),
    })
    .eq("id", dukkanId);

  if (error) {
    console.error("[persistGoogleReviewsCache]", error.message);
  }
}

export async function refreshGoogleReviewsCache(
  supabase: SupabaseDbClient,
  dukkanId: string,
  placeId: string
): Promise<GoogleReviewsBundle | null> {
  const normalizedPlaceId = normalizeGooglePlaceId(placeId);
  if (!normalizedPlaceId) {
    return null;
  }

  const fresh = await fetchGooglePlaceReviews(normalizedPlaceId);
  if (!fresh) {
    return null;
  }

  await persistGoogleReviewsCache(supabase, dukkanId, fresh);
  return fresh;
}

export async function getGoogleReviewsForDukkan(
  supabase: SupabaseDbClient,
  dukkan: DukkanGoogleReviewsSource
): Promise<GoogleReviewsBundle | null> {
  try {
    if (!dukkan.google_reviews_enabled) {
      return null;
    }

    const placeId = normalizeGooglePlaceId(dukkan.google_place_id);
    if (!placeId) {
      return null;
    }

    const cached = parseGoogleReviewsCache(
      dukkan.google_reviews_cache,
      dukkan.google_reviews_fetched_at
    );

    if (
      cached &&
      cached.placeId === placeId &&
      !isCacheStale(dukkan.google_reviews_fetched_at)
    ) {
      return cached;
    }

    const fresh = await refreshGoogleReviewsCache(supabase, dukkan.id, placeId);
    if (fresh) {
      return fresh;
    }

    if (cached && cached.placeId === placeId) {
      return cached;
    }

    return null;
  } catch (error) {
    console.error("[getGoogleReviewsForDukkan] fail-safe hide", error);
    return null;
  }
}

/** Vitrin sayfası: Place ID yoksa veya hata olursa sessizce null döner */
export async function loadStoreGoogleReviews(
  supabase: SupabaseDbClient,
  dukkan: DukkanGoogleReviewsSource
): Promise<GoogleReviewsBundle | null> {
  if (!normalizeGooglePlaceId(dukkan.google_place_id)) {
    return null;
  }

  return getGoogleReviewsForDukkan(supabase, dukkan);
}

export function shouldRenderGoogleReviewsWidget(
  dukkan: DukkanGoogleReviewsSource,
  bundle: GoogleReviewsBundle | null
): bundle is GoogleReviewsBundle {
  if (!normalizeGooglePlaceId(dukkan.google_place_id)) {
    return false;
  }

  if (!dukkan.google_reviews_enabled || !bundle) {
    return false;
  }

  return bundle.reviews.length > 0 || bundle.ratingValue != null;
}

export async function invalidateGoogleReviewsCache(
  supabase: SupabaseDbClient,
  dukkanId: string
) {
  await supabase
    .from("dukkanlar")
    .update({
      google_reviews_cache: null,
      google_reviews_fetched_at: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", dukkanId);
}
