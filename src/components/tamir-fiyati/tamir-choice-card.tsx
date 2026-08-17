"use client";

import { TamirIconImage } from "@/components/tamir-fiyati/tamir-icon-image";
import { cn } from "@/lib/utils/cn";

type TamirChoiceCardProps = {
  label: string;
  sources: string[];
  showLabel?: boolean;
  disabled?: boolean;
  onClick: () => void;
};

export function TamirChoiceCard({
  label,
  sources,
  showLabel = true,
  disabled,
  onClick,
}: TamirChoiceCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "group flex min-h-[9.5rem] w-full flex-col items-center justify-center gap-3 rounded-2xl border border-slate-200/90 bg-white/90 px-3 py-4 text-center shadow-[0_1px_2px_rgba(15,23,42,0.04)] backdrop-blur-sm transition duration-300 ease-out",
        "hover:-translate-y-0.5 hover:border-emerald-200 hover:bg-white hover:shadow-[0_12px_28px_rgba(16,185,129,0.08)]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/60 focus-visible:ring-offset-2",
        "active:scale-[0.98]",
        !showLabel && "min-h-[8rem]",
        disabled && "cursor-not-allowed opacity-60 hover:translate-y-0 hover:shadow-none"
      )}
    >
      <TamirIconImage
        sources={sources}
        label={label}
        className={cn(
          "transition duration-300",
          showLabel
            ? "h-[4.5rem] w-[4.5rem] sm:h-20 sm:w-20"
            : "h-[5.5rem] w-[5.5rem] sm:h-24 sm:w-24"
        )}
      />
      {showLabel && (
        <span className="line-clamp-2 px-1 text-xs font-semibold leading-snug text-slate-800 transition group-hover:text-emerald-800 sm:text-sm">
          {label}
        </span>
      )}
    </button>
  );
}
