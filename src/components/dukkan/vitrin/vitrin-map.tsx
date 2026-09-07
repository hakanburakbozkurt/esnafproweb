"use client";

import type { KeyboardEvent } from "react";
import {
  buildMapEmbedUrl,
  hasMapLocation,
  openMapNavigation,
  type MapLocation,
} from "@/lib/dukkan/map-navigation";
import {
  buildGoogleBusinessEmbedUrl,
  normalizeGoogleBusinessUrl,
} from "@/lib/dukkan/google-business-url";
import { cn } from "@/lib/utils/cn";

type VitrinMapProps = MapLocation & {
  googleBusinessUrl?: string | null;
  googlePlaceId?: string | null;
  googleMapsEmbedApiKey?: string | null;
  className?: string;
  interactive?: boolean;
};

export function VitrinMap({
  enlem,
  boylam,
  adres,
  label,
  googleBusinessUrl,
  googlePlaceId,
  googleMapsEmbedApiKey,
  className,
  interactive = true,
}: VitrinMapProps) {
  const location: MapLocation = { enlem, boylam, adres, label };
  const businessEmbedUrl = buildGoogleBusinessEmbedUrl({
    googleBusinessUrl,
    googlePlaceId,
    apiKey: googleMapsEmbedApiKey,
  });
  const businessProfileUrl = normalizeGoogleBusinessUrl(googleBusinessUrl);
  const embedUrl = businessEmbedUrl ?? buildMapEmbedUrl(location);
  const hasBusinessEmbed = Boolean(businessEmbedUrl);

  if (!hasBusinessEmbed && !hasMapLocation(location)) {
    return (
      <div
        className={cn(
          "flex aspect-[4/3] min-h-[280px] items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-6 text-center text-sm leading-relaxed text-gray-500 lg:min-h-[360px]",
          className
        )}
      >
        Harita bilgisi henüz eklenmemiş.
      </div>
    );
  }

  function handleNavigate() {
    if (!interactive) return;

    if (hasMapLocation(location)) {
      openMapNavigation(location);
      return;
    }

    if (businessProfileUrl) {
      window.open(businessProfileUrl, "_blank", "noopener,noreferrer");
    }
  }

  function handleMapClick() {
    if (hasBusinessEmbed) return;
    handleNavigate();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (!interactive || hasBusinessEmbed) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openMapNavigation(location);
    }
  }

  return (
    <div className={cn("group relative", className)}>
      <div
        role={interactive && !hasBusinessEmbed ? "button" : undefined}
        tabIndex={interactive && !hasBusinessEmbed ? 0 : undefined}
        aria-label={
          interactive && !hasBusinessEmbed
            ? "Konumu haritada aç ve yol tarifi al"
            : undefined
        }
        onClick={handleMapClick}
        onKeyDown={handleKeyDown}
        className={cn(
          "relative aspect-[4/3] min-h-[280px] overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm lg:min-h-[360px]",
          interactive &&
            !hasBusinessEmbed &&
            "cursor-pointer transition-shadow duration-300 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500"
        )}
      >
        {embedUrl && (
          <iframe
            title={
              hasBusinessEmbed
                ? `${label?.trim() || "İşletme"} Google Haritalar profili`
                : "Konum haritası önizlemesi"
            }
            className={cn(
              "absolute inset-0 h-full w-full border-0",
              !hasBusinessEmbed && "pointer-events-none"
            )}
            loading="lazy"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
            src={embedUrl}
          />
        )}

        {interactive && !hasBusinessEmbed && (
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-900/35 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-within:opacity-100" />
        )}
      </div>

      {interactive && (
        <button
          type="button"
          onClick={handleNavigate}
          className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-gray-100 bg-white px-5 py-3 text-sm font-semibold text-emerald-700 shadow-sm transition hover:border-emerald-200 hover:bg-emerald-50 sm:w-auto"
        >
          <MapPinIcon />
          Yol Tarifi Al
        </button>
      )}
    </div>
  );
}

function MapPinIcon() {
  return (
    <svg
      className="size-4 shrink-0"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
      />
    </svg>
  );
}
