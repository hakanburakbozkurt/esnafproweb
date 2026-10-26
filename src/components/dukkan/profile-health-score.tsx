"use client";

import {
  calculateProfileHealthScore,
  type ProfileHealthInput,
} from "@/lib/dukkan/profile-health-score";
import { cn } from "@/lib/utils/cn";

const RING_SIZE = 88;
const STROKE = 7;
const RADIUS = (RING_SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function ProfileHealthScore({
  input,
  className,
  onOpenDetails,
}: {
  input: ProfileHealthInput;
  className?: string;
  /** Verilirse kart tıklanabilir olur ve skor dökümünü açar */
  onOpenDetails?: () => void;
}) {
  const { score, message } = calculateProfileHealthScore(input);
  const offset = CIRCUMFERENCE - (score / 100) * CIRCUMFERENCE;

  const ringColor =
    score >= 100
      ? "stroke-emerald-500"
      : score >= 80
        ? "stroke-emerald-500"
        : score >= 50
          ? "stroke-amber-500"
          : "stroke-red-500";

  const Wrapper = onOpenDetails ? "button" : "div";

  return (
    <Wrapper
      {...(onOpenDetails
        ? {
            type: "button" as const,
            onClick: onOpenDetails,
            "aria-haspopup": "dialog" as const,
            "aria-label": `Profil ve SEO skoru ${score}/100. Dökümü göster`,
          }
        : {})}
      className={cn(
        "block w-full rounded-2xl border border-slate-200/80 bg-white/95 p-4 text-left shadow-sm shadow-slate-200/30 backdrop-blur-sm",
        onOpenDetails &&
          "transition hover:border-emerald-200 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40",
        className
      )}
    >
      <div className="flex items-start gap-4">
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
            <span className="text-xl font-bold tabular-nums text-slate-900">
              {score}
            </span>
            <span className="text-[10px] font-medium text-slate-400">/100</span>
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-600">
            Profil & SEO Skoru
          </p>
          <p className="mt-2 text-xs leading-relaxed text-slate-600">{message}</p>
          {onOpenDetails && (
            <span className="mt-2 inline-flex text-xs font-semibold text-emerald-700">
              Dökümü gör →
            </span>
          )}
        </div>
      </div>
    </Wrapper>
  );
}
