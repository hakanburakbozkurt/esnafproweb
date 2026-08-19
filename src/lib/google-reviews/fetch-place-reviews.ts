import {
  buildGoogleMapsReviewsUrl,
  buildGoogleReviewsAttribution,
  normalizeGooglePlaceId,
  resolveGoogleReviewSourceUrl,
} from "@/lib/google-reviews/place-id";
import { getGooglePlacesApiKey } from "@/lib/google-reviews/places-api-key";
import type { GoogleReviewItem, GoogleReviewsBundle } from "@/lib/google-reviews/types";

type PlacesApiReview = {
  name?: string;
  relativePublishTimeDescription?: string;
  rating?: number;
  publishTime?: string;
  text?: { text?: string };
  authorAttribution?: {
    displayName?: string;
    uri?: string;
    photoUri?: string;
  };
};

type PlacesApiResponse = {
  id?: string;
  googleMapsUri?: string;
  rating?: number;
  userRatingCount?: number;
  reviews?: PlacesApiReview[];
};

function parseReview(
  review: PlacesApiReview,
  index: number,
  input: { placeId: string; mapsReviewsUrl: string }
): GoogleReviewItem | null {
  const authorName = review.authorAttribution?.displayName?.trim();
  const rating = review.rating;
  const text = review.text?.text?.trim() ?? "";
  const publishedAt = review.publishTime?.trim();

  if (!authorName || rating == null || !publishedAt) {
    return null;
  }

  const reviewId =
    review.name?.split("/").pop()?.trim() || `${input.placeId}-review-${index}`;

  return {
    id: reviewId,
    authorName,
    authorProfileUrl: review.authorAttribution?.uri?.trim() ?? null,
    authorPhotoUrl: review.authorAttribution?.photoUri?.trim() ?? null,
    rating,
    text,
    publishedAt,
    relativeTime: review.relativePublishTimeDescription?.trim() ?? null,
    review_reply_url: resolveGoogleReviewSourceUrl({
      placeId: input.placeId,
      mapsReviewsUrl: input.mapsReviewsUrl,
      authorProfileUrl: review.authorAttribution?.uri,
      reviewResourceName: review.name,
    }),
  };
}

export async function fetchGooglePlaceReviews(
  placeIdInput: string
): Promise<GoogleReviewsBundle | null> {
  const apiKey = getGooglePlacesApiKey();
  const placeId = normalizeGooglePlaceId(placeIdInput);

  if (!apiKey || !placeId) {
    if (!apiKey) {
      console.warn(
        "[fetchGooglePlaceReviews] API anahtarı yok — GOOGLE_PLACES_API_KEY veya NEXT_PUBLIC_GOOGLE_PLACES_API_KEY tanımlayın."
      );
    }
    return null;
  }

  const url = `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask":
          "id,googleMapsUri,rating,userRatingCount,reviews,reviews.authorAttribution,reviews.rating,reviews.text,reviews.publishTime,reviews.relativePublishTimeDescription,reviews.name",
      },
      next: { revalidate: 86400 },
    });

    if (!response.ok) {
      const errorBody = await response.text().catch(() => "");
      console.error(
        "[fetchGooglePlaceReviews] API error",
        response.status,
        errorBody.slice(0, 300)
      );
      return null;
    }

    const payload = (await response.json()) as PlacesApiResponse;
    const resolvedPlaceId = normalizeGooglePlaceId(payload.id) ?? placeId;
    const mapsReviewsUrl = buildGoogleMapsReviewsUrl(
      resolvedPlaceId,
      payload.googleMapsUri
    );

    const reviews = (payload.reviews ?? [])
      .map((review, index) =>
        parseReview(review, index, {
          placeId: resolvedPlaceId,
          mapsReviewsUrl,
        })
      )
      .filter((review): review is GoogleReviewItem => review !== null);

    if (!reviews.length && payload.rating == null) {
      return null;
    }

    const fetchedAt = new Date().toISOString();

    return {
      placeId: resolvedPlaceId,
      mapsReviewsUrl,
      ratingValue: payload.rating ?? null,
      ratingCount: payload.userRatingCount ?? null,
      reviews,
      attribution: buildGoogleReviewsAttribution(mapsReviewsUrl),
      fetchedAt,
    };
  } catch (error) {
    console.error("[fetchGooglePlaceReviews] unexpected error", error);
    return null;
  }
}
