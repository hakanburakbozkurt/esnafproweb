import Link from "next/link";
import {
  GOOGLE_BUSINESS_PROFILE_LABEL,
  GOOGLE_REVIEWS_VIEW_ALL_LABEL,
  GOOGLE_REVIEWS_WIDGET_ID,
  GOOGLE_REVIEW_SOURCE_LINK_LABEL,
  GOOGLE_REVIEW_SYNDICATION_NOTE,
} from "@/lib/google-reviews/constants";
import type { GoogleReviewsBundle } from "@/lib/google-reviews/types";
import { cn } from "@/lib/utils/cn";

function StarRating({ rating }: { rating: number }) {
  const fullStars = Math.max(0, Math.min(5, Math.round(rating)));

  return (
    <span
      className="inline-flex items-center gap-0.5 text-amber-500"
      aria-label={`${rating} / 5`}
    >
      {Array.from({ length: 5 }).map((_, index) => (
        <span
          key={index}
          aria-hidden
          className={index < fullStars ? "opacity-100" : "opacity-25"}
        >
          ★
        </span>
      ))}
    </span>
  );
}

function formatReviewDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return new Intl.DateTimeFormat("tr-TR", { dateStyle: "medium" }).format(date);
}

type GoogleReviewsWidgetProps = {
  bundle: GoogleReviewsBundle;
  shopName: string;
  className?: string;
};

/** SSR widget — harici script yok; content-visibility ile CLS optimize */
export function GoogleReviewsWidget({
  bundle,
  shopName,
  className,
}: GoogleReviewsWidgetProps) {
  const hasAggregate =
    bundle.ratingValue != null &&
    bundle.ratingCount != null &&
    bundle.ratingCount > 0;

  return (
    <section
      id={GOOGLE_REVIEWS_WIDGET_ID}
      aria-labelledby="google-reviews-heading"
      className={cn(
        "rounded-3xl border border-slate-200/70 bg-white/90 p-5 shadow-sm sm:p-6 lg:p-8",
        "[content-visibility:auto] [contain-intrinsic-size:1px_520px]",
        className
      )}
    >
      <header className="flex flex-col gap-3 border-b border-slate-200/70 pb-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            Kaynak: {GOOGLE_BUSINESS_PROFILE_LABEL}
          </p>
          <h2
            id="google-reviews-heading"
            className="mt-2 text-xl font-semibold text-slate-900 lg:text-2xl"
          >
            {shopName} — Google yorumları
          </h2>
          {hasAggregate && (
            <p className="mt-2 flex flex-wrap items-center gap-2 text-sm text-slate-600">
              <StarRating rating={bundle.ratingValue!} />
              <span className="font-semibold text-slate-800">
                {bundle.ratingValue!.toFixed(1)}
              </span>
              <span aria-hidden>·</span>
              <span>{bundle.ratingCount} Google yorumu</span>
            </p>
          )}
        </div>

        <Link
          href={bundle.mapsReviewsUrl}
          target="_blank"
          rel="nofollow noopener noreferrer"
          className="inline-flex min-h-10 items-center justify-center rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-white"
        >
          {GOOGLE_REVIEWS_VIEW_ALL_LABEL}
        </Link>
      </header>

      <ul className="mt-5 space-y-4">
        {bundle.reviews.map((review) => {
          const formattedDate =
            formatReviewDate(review.publishedAt) ?? review.relativeTime;

          return (
            <li
              key={review.id}
              className="rounded-2xl border border-slate-200/70 bg-slate-50/70 p-4 lg:p-5"
            >
              <div className="flex items-start gap-3">
                {review.authorPhotoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={review.authorPhotoUrl}
                    alt=""
                    width={40}
                    height={40}
                    loading="lazy"
                    decoding="async"
                    className="size-10 shrink-0 rounded-full object-cover"
                  />
                ) : (
                  <span
                    aria-hidden
                    className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white text-sm font-semibold text-slate-500 ring-1 ring-slate-200"
                  >
                    {review.authorName.charAt(0).toUpperCase()}
                  </span>
                )}

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <p className="font-semibold text-slate-900">{review.authorName}</p>
                    <StarRating rating={review.rating} />
                    {formattedDate && (
                      <time
                        dateTime={review.publishedAt}
                        className="text-xs text-slate-500"
                      >
                        {formattedDate}
                      </time>
                    )}
                  </div>

                  {review.text && (
                    <p className="mt-2 text-sm leading-relaxed text-slate-700">
                      {review.text}
                    </p>
                  )}

                  <p className="mt-3 text-xs text-slate-500">
                    {GOOGLE_REVIEW_SYNDICATION_NOTE}{" "}
                    <Link
                      href={review.review_reply_url}
                      target="_blank"
                      rel="nofollow noopener noreferrer"
                      className="font-medium text-slate-700 underline underline-offset-2 hover:text-slate-900"
                    >
                      {GOOGLE_REVIEW_SOURCE_LINK_LABEL}
                    </Link>
                  </p>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <footer className="mt-5 border-t border-slate-200/70 pt-4">
        <p className="text-xs leading-relaxed text-slate-500">
          {bundle.attribution.licenseNote}{" "}
          <Link
            href={bundle.attribution.profileUrl}
            target="_blank"
            rel="nofollow noopener noreferrer"
            className="font-medium text-slate-700 underline underline-offset-2 hover:text-slate-900"
          >
            {GOOGLE_BUSINESS_PROFILE_LABEL}
          </Link>
        </p>
      </footer>
    </section>
  );
}
