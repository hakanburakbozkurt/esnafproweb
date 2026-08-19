import { GoogleReviewsWidget } from "@/components/dukkan/vitrin/google-reviews-widget";
import {
  loadStoreGoogleReviews,
  shouldRenderGoogleReviewsWidget,
} from "@/lib/google-reviews/get-google-reviews";
import type { GoogleReviewsBundle } from "@/lib/google-reviews/types";
import type { Dukkan } from "@/types/database.types";
import { createClient } from "@/lib/supabase/server";

type GoogleReviewsSectionProps = {
  dukkan: Pick<
    Dukkan,
    | "id"
    | "dukkan_adi"
    | "google_place_id"
    | "google_reviews_enabled"
    | "google_reviews_cache"
    | "google_reviews_fetched_at"
    | "approval_status"
  >;
  /** Vitrin sayfası JSON-LD ile aynı bundle'ı paylaşmak için (çift fetch önlenir) */
  bundle?: GoogleReviewsBundle | null;
  className?: string;
};

/**
 * Sunucu bileşeni: Place ID ile Google puan/yorumlarını yükler ve widget render eder.
 * API anahtarı sunucuda kalır; istemciye sızmaz.
 */
export async function GoogleReviewsSection({
  dukkan,
  bundle: preloadedBundle,
  className,
}: GoogleReviewsSectionProps) {
  const bundle =
    preloadedBundle ??
    (await loadStoreGoogleReviews(await createClient(), dukkan));

  if (!shouldRenderGoogleReviewsWidget(dukkan, bundle)) {
    return null;
  }

  return (
    <GoogleReviewsWidget
      bundle={bundle}
      shopName={dukkan.dukkan_adi}
      className={className}
    />
  );
}
