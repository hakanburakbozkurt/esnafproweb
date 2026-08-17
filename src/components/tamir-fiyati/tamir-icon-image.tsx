"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils/cn";

type TamirIconImageProps = {
  sources: string[];
  label: string;
  className?: string;
  imageClassName?: string;
};

export function TamirIconImage({
  sources,
  label,
  className,
  imageClassName,
}: TamirIconImageProps) {
  const uniqueSources = useMemo(
    () => [...new Set(sources.filter(Boolean))],
    [sources]
  );
  const [sourceIndex, setSourceIndex] = useState(0);
  const currentSource = uniqueSources[sourceIndex];
  const showPlaceholder = !currentSource || sourceIndex >= uniqueSources.length;

  function handleError() {
    setSourceIndex((prev) => prev + 1);
  }

  return (
    <span
      className={cn(
        "flex items-center justify-center overflow-hidden bg-gradient-to-b from-slate-50 to-slate-100/80",
        className
      )}
    >
      {!showPlaceholder ? (
        <img
          key={currentSource}
          src={currentSource}
          alt=""
          className={cn("h-full w-full object-contain p-2", imageClassName)}
          loading="lazy"
          decoding="async"
          onError={handleError}
        />
      ) : (
        <span
          aria-hidden
          className="text-xl font-bold text-slate-300 sm:text-2xl"
        >
          {label.trim().charAt(0).toUpperCase() || "?"}
        </span>
      )}
    </span>
  );
}
