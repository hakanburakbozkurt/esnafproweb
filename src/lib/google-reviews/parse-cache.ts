import type {
  GoogleReviewItem,
  GoogleReviewsBundle,
  GoogleReviewsCacheRow,
} from "@/lib/google-reviews/types";

function isReviewItem(value: unknown): value is GoogleReviewItem {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<GoogleReviewItem> & { sourceUrl?: string };
  const replyUrl = item.review_reply_url ?? item.sourceUrl;
  return (
    typeof item.id === "string" &&
    typeof item.authorName === "string" &&
    typeof item.rating === "number" &&
    typeof item.text === "string" &&
    typeof item.publishedAt === "string" &&
    typeof replyUrl === "string"
  );
}

function normalizeReviewItem(raw: unknown): GoogleReviewItem | null {
  if (!raw || typeof raw !== "object") return null;
  const item = raw as Partial<GoogleReviewItem> & { sourceUrl?: string };
  const review_reply_url = item.review_reply_url ?? item.sourceUrl;
  if (
    !item.id ||
    !item.authorName ||
    item.rating == null ||
    !item.publishedAt ||
    !review_reply_url
  ) {
    return null;
  }

  return {
    id: item.id,
    authorName: item.authorName,
    authorProfileUrl: item.authorProfileUrl ?? null,
    authorPhotoUrl: item.authorPhotoUrl ?? null,
    rating: item.rating,
    text: item.text ?? "",
    publishedAt: item.publishedAt,
    relativeTime: item.relativeTime ?? null,
    review_reply_url,
  };
}

function isCacheRow(value: unknown): value is GoogleReviewsCacheRow {
  if (!value || typeof value !== "object") return false;
  const row = value as Partial<GoogleReviewsCacheRow>;
  return (
    typeof row.placeId === "string" &&
    typeof row.mapsReviewsUrl === "string" &&
    Array.isArray(row.reviews) &&
    row.reviews.every(isReviewItem) &&
    row.attribution != null &&
    typeof row.attribution === "object"
  );
}

export function parseGoogleReviewsCache(
  raw: unknown,
  fetchedAt?: string | null
): GoogleReviewsBundle | null {
  if (!isCacheRow(raw)) {
    return null;
  }

  return {
    ...raw,
    reviews: raw.reviews
      .map(normalizeReviewItem)
      .filter((review): review is GoogleReviewItem => review !== null),
    fetchedAt: fetchedAt ?? new Date().toISOString(),
  };
}

export function toGoogleReviewsCacheRow(
  bundle: Omit<GoogleReviewsBundle, "fetchedAt">
): GoogleReviewsCacheRow {
  return {
    placeId: bundle.placeId,
    mapsReviewsUrl: bundle.mapsReviewsUrl,
    ratingValue: bundle.ratingValue,
    ratingCount: bundle.ratingCount,
    reviews: bundle.reviews,
    attribution: bundle.attribution,
  };
}
