export type GoogleReviewItem = {
  id: string;
  authorName: string;
  authorProfileUrl: string | null;
  authorPhotoUrl: string | null;
  rating: number;
  text: string;
  publishedAt: string;
  relativeTime: string | null;
  /** Orijinal yorum URL'si (Google İşletme Profili) */
  review_reply_url: string;
};

export type GoogleReviewsAttribution = {
  sourceLabel: string;
  sourceOrganization: "Google";
  profileUrl: string;
  licenseNote: string;
};

export type GoogleReviewsBundle = {
  placeId: string;
  mapsReviewsUrl: string;
  ratingValue: number | null;
  ratingCount: number | null;
  reviews: GoogleReviewItem[];
  attribution: GoogleReviewsAttribution;
  fetchedAt: string;
};

export type GoogleReviewsCacheRow = {
  placeId: string;
  mapsReviewsUrl: string;
  ratingValue: number | null;
  ratingCount: number | null;
  reviews: GoogleReviewItem[];
  attribution: GoogleReviewsAttribution;
};

export type DukkanGoogleReviewsSource = {
  id: string;
  google_place_id: string | null;
  google_reviews_enabled: boolean;
  google_reviews_cache: unknown;
  google_reviews_fetched_at: string | null;
  approval_status?: string | null;
};
