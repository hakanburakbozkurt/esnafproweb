"use client";

import {
  calculateSeoGeoScore,
  type SeoGeoScoreInput,
} from "@/lib/dukkan/seo-geo-score";
import { yonetimPanelClass } from "@/lib/yonetim/gradient-panel";
import { cn } from "@/lib/utils/cn";

const RING_SIZE = 72;
const STROKE = 6;
const RADIUS = (RING_SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function SeoGeoScoreCard({
  input,
  className,
}: {
  input: SeoGeoScoreInput;
  className?: string;
}) {
  const { score, breakdown } = calculateSeoGeoScore(input);
  const offset = CIRCUMFERENCE - (score / 100) * CIRCUMFERENCE;

  const ringColor =
    score >= 80
      ? "stroke-emerald-500"
      : score >= 50
        ? "stroke-emerald-400"
        : "stroke-amber-500";

  return (
    <div className={cn(yonetimPanelClass, "p-4 sm:p-5", className)}>
      <div className="flex items-start gap-3">
        <div className="relative shrink-0" style={{ width: RING_SIZE, height: RING_SIZE }}>
          <svg
            width={RING_SIZE}
            height={RING_SIZE}
            viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}
            className="-rotate-90"
            aria-hidden
          >
            <circle
              cx={RING_SIZE / 2}
              cy={RING_SIZE / 2}
              r={RADIUS}
              fill="none"
              strokeWidth={STROKE}
              className="stroke-slate-100"
            />
            <circle
              cx={RING_SIZE / 2}
              cy={RING_SIZE / 2}
              r={RADIUS}
              fill="none"
              strokeWidth={STROKE}
              strokeLinecap="round"
              className={cn("transition-all duration-500", ringColor)}
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={offset}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-lg font-bold tabular-nums text-slate-900">{score}</span>
            <span className="text-[9px] font-medium text-slate-400">/100</span>
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald-600">
            SEO & GEO Görünürlük Skoru
          </p>
          <ul className="mt-2 space-y-1">
            {breakdown.map((item) => (
              <li
                key={item.label}
                className="flex items-center justify-between gap-2 text-[10px] leading-tight"
              >
                <span className="truncate text-slate-600">{item.label}</span>
                <span
                  className={cn(
                    "shrink-0 tabular-nums font-semibold",
                    item.filled ? "text-emerald-600" : "text-slate-400"
                  )}
                >
                  {item.points}/{item.max}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
