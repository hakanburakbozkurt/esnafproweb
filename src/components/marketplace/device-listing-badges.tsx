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
  stockStatus?: "available" | "unavailable";
  className?: string;
};

export function DeviceListingBadges({
  condition,
  deviceCategory,
  listingType,
  locationBadge,
  stockStatus,
  className,
}: DeviceListingBadgesProps) {
  const listingBadge = getListingTypeBadge(listingType);
  const categoryLabel = getDeviceCategoryLabel(deviceCategory);

  return (
    <div className={cn("flex max-w-[calc(100%-0.5rem)] flex-wrap gap-1.5", className)}>
      <span
        className={cn(
          "rounded-full px-2 py-0.5 text-[10px] font-bold shadow-sm backdrop-blur-sm sm:px-2.5 sm:py-1 sm:text-[11px]",
          listingBadge.tone === "new"
            ? "bg-sky-600/90 text-white"
            : "bg-amber-500/90 text-white"
        )}
      >
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
      {stockStatus && (
        <span
          className={cn(
            "rounded-full px-2 py-0.5 text-[10px] font-bold shadow-sm backdrop-blur-sm sm:px-2.5 sm:py-1 sm:text-[11px]",
            stockStatus === "available"
              ? "bg-green-600/90 text-white"
              : "bg-red-500/90 text-white"
          )}
        >
          {stockStatus === "available" ? "Stoğu Var" : "Tükendi"}
        </span>
      )}
      {locationBadge && (
        <span className="max-w-full truncate rounded-full bg-slate-900/75 px-2 py-0.5 text-[10px] font-semibold text-white shadow-sm backdrop-blur-sm sm:px-2.5 sm:py-1 sm:text-[11px]">
          {locationBadge}
        </span>
      )}
    </div>
  );
}
