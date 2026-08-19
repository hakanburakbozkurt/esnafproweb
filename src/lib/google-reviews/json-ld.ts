import { isShopSeoIndexable, type ShopApprovalStatus } from "@/lib/dukkan/approval-status";
import { buildGooglePublisherSchema } from "@/lib/google-reviews/place-id";
import type { GoogleReviewsBundle } from "@/lib/google-reviews/types";

function formatRatingValue(value: number): number {
  return Math.round(value * 10) / 10;
}

function buildReviewSchema(review: GoogleReviewsBundle["reviews"][number]) {
  return {
    "@type": "Review" as const,
    author: {
      "@type": "Person" as const,
      name: review.authorName,
      ...(review.authorProfileUrl ? { url: review.authorProfileUrl } : {}),
    },
    reviewRating: {
      "@type": "Rating" as const,
      ratingValue: review.rating,
      bestRating: 5,
      worstRating: 1,
    },
    ...(review.text ? { reviewBody: review.text } : {}),
    datePublished: review.publishedAt.slice(0, 10),
    publisher: buildGooglePublisherSchema(),
    url: review.review_reply_url,
  };
}

export function buildGoogleReviewsJsonLd(input: {
  localBusinessId: string;
  reviewsBundle: GoogleReviewsBundle;
  approvalStatus?: ShopApprovalStatus | null;
}) {
  if (!isShopSeoIndexable(input.approvalStatus)) {
    return null;
  }

  const visibleReviews = input.reviewsBundle.reviews;
  if (!visibleReviews.length && input.reviewsBundle.ratingValue == null) {
    return null;
  }

  const aggregateRating =
    input.reviewsBundle.ratingValue != null
      ? {
          "@type": "AggregateRating" as const,
          ratingValue: formatRatingValue(input.reviewsBundle.ratingValue),
          ...(input.reviewsBundle.ratingCount != null
            ? { ratingCount: input.reviewsBundle.ratingCount }
            : {}),
          bestRating: 5,
          worstRating: 1,
        }
      : undefined;

  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": input.localBusinessId,
    ...(aggregateRating ? { aggregateRating } : {}),
    ...(visibleReviews.length
      ? { review: visibleReviews.map(buildReviewSchema) }
      : {}),
  };
}

export function mergeGoogleReviewsIntoLocalBusiness(
  localBusinessSchema: Record<string, unknown>,
  reviewsBundle: GoogleReviewsBundle | null,
  approvalStatus?: ShopApprovalStatus | null
): Record<string, unknown> {
  if (!reviewsBundle || !isShopSeoIndexable(approvalStatus)) {
    return localBusinessSchema;
  }

  const reviewsSchema = buildGoogleReviewsJsonLd({
    localBusinessId:
      typeof localBusinessSchema["@id"] === "string"
        ? localBusinessSchema["@id"]
        : "",
    reviewsBundle,
    approvalStatus,
  });

  if (!reviewsSchema) {
    return localBusinessSchema;
  }

  return {
    ...localBusinessSchema,
    ...(reviewsSchema.aggregateRating
      ? { aggregateRating: reviewsSchema.aggregateRating }
      : {}),
    ...(reviewsSchema.review ? { review: reviewsSchema.review } : {}),
  };
}
