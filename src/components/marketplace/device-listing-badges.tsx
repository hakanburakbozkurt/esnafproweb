import {
  getDeviceCategoryLabel,
  getListingTypeBadge,
} from "@/lib/dukkan/second-hand-devices";
import { cn } from "@/lib/utils/cn";

type DeviceListingBadgesProps = {
  condition: string;
  deviceCategory?: string | null;
  listingType?: string | null;
  locationBadge?: string | null;
  className?: string;
};

export function DeviceListingBadges({
  condition,
  deviceCategory,
  listingType,
  locationBadge,
  className,
}: DeviceListingBadgesProps) {
  const listingBadge = getListingTypeBadge(listingType);
  const categoryLabel = getDeviceCategoryLabel(deviceCategory);

  return (
    <div className={cn("flex max-w-[calc(100%-0.5rem)] flex-wrap gap-1.5", className)}>
      <span
        className={cn(
          "inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-bold shadow-md backdrop-blur-sm sm:px-3.5 sm:py-1.5 sm:text-xs",
          listingBadge.tone === "new"
            ? "bg-blue-600/95 text-white ring-1 ring-blue-400/50"
            : "bg-amber-600/95 text-white ring-1 ring-amber-400/50"
        )}
      >
        <span>{listingBadge.tone === "new" ? "✨" : "♻️"}</span>
        {listingBadge.label}
      </span>
      {categoryLabel && (
        <span className="rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-semibold text-slate-700 shadow-sm backdrop-blur-sm sm:px-2.5 sm:py-1 sm:text-[11px]">
          {categoryLabel}
        </span>
      )}
      <span className="rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 shadow-sm backdrop-blur-sm sm:px-2.5 sm:py-1 sm:text-[11px]">
        {condition}
      </span>
      {locationBadge && (
        <span className="max-w-full truncate rounded-full bg-slate-900/75 px-2 py-0.5 text-[10px] font-semibold text-white shadow-sm backdrop-blur-sm sm:px-2.5 sm:py-1 sm:text-[11px]">
          {locationBadge}
        </span>
      )}
    </div>
  );
}
