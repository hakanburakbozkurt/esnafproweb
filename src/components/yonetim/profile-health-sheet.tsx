"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Check, ChevronRight, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useId, useRef } from "react";
import {
  calculateProfileHealthScore,
  type ProfileHealthInput,
} from "@/lib/dukkan/profile-health-score";
import {
  scoreBarFillClass,
  scoreBarProgressPercent,
  scoreBarTrackClass,
} from "@/lib/yonetim/gradient-panel";
import { getBreakdownHref } from "@/lib/yonetim/profile-health-links";

export function ProfileHealthSheet({
  input,
  onClose,
}: {
  input: ProfileHealthInput;
  onClose: () => void;
}) {
  const reduceMotion = useReducedMotion();
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);
  const onCloseRef = useRef(onClose);
  const { score, message, breakdown } = calculateProfileHealthScore(input);
  const missing = breakdown.filter((item) => item.points < item.max);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const previousFocus = document.activeElement as HTMLElement | null;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onCloseRef.current();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
      previousFocus?.focus?.();
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[60]">
      <motion.button
        type="button"
        tabIndex={-1}
        aria-label="Skor dökümünü kapat"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, transition: { duration: reduceMotion ? 0 : 0.18 } }}
        transition={{ duration: reduceMotion ? 0 : 0.2 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]"
      />
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: reduceMotion ? 0 : 40, transition: { duration: reduceMotion ? 0 : 0.18 } }}
        transition={reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 380, damping: 36 }}
        className="absolute inset-x-0 bottom-0 flex max-h-[88dvh] flex-col rounded-t-3xl bg-white shadow-2xl sm:inset-y-0 sm:left-auto sm:right-0 sm:max-h-none sm:w-[26rem] sm:rounded-l-3xl sm:rounded-tr-none"
      >
        <div className="mx-auto mt-2.5 h-1.5 w-10 rounded-full bg-slate-200 sm:hidden" aria-hidden />
        <header className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-600">
              Profil & SEO Skoru
            </p>
            <h2 id={titleId} className="mt-1 text-2xl font-bold tabular-nums text-slate-900">
              {score}
              <span className="text-base font-semibold text-slate-400">/100</span>
            </h2>
            <p className="mt-1 text-xs leading-relaxed text-slate-500">{message}</p>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Kapat"
            className="inline-flex size-11 shrink-0 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:bg-slate-50"
          >
            <X className="size-5" aria-hidden />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          {missing.length === 0 && (
            <p className="mb-4 rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
              Tüm maddeler tamamlandı. Harika iş!
            </p>
          )}
          <ul className="space-y-2.5">
            {breakdown.map((item) => {
              const complete = item.points >= item.max;
              const percent = scoreBarProgressPercent(item.points, item.max);
              const content = (
                <>
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="flex min-w-0 items-center gap-2 font-medium text-slate-800">
                      {complete && (
                        <Check className="size-4 shrink-0 text-emerald-600" aria-label="Tamamlandı" />
                      )}
                      <span className="truncate">{item.label}</span>
                    </span>
                    <span className="flex shrink-0 items-center gap-1 text-xs font-semibold tabular-nums text-emerald-700">
                      {item.points}/{item.max}
                      {!complete && <ChevronRight className="size-4 text-slate-400" aria-hidden />}
                    </span>
                  </div>
                  <div
                    className={scoreBarTrackClass()}
                    role="progressbar"
                    aria-valuemin={0}
                    aria-valuemax={item.max}
                    aria-valuenow={item.points}
                    aria-label={`${item.label}: ${item.points} / ${item.max}`}
                  >
                    <div className={scoreBarFillClass(percent)} style={{ width: `${percent}%` }} />
                  </div>
                </>
              );

              return (
                <li key={item.label}>
                  {complete ? (
                    <div className="rounded-2xl border border-slate-100 bg-slate-50/60 px-4 py-3">
                      {content}
                    </div>
                  ) : (
                    <Link
                      href={getBreakdownHref(item.label)}
                      onClick={onClose}
                      className="block min-h-11 rounded-2xl border border-slate-200 bg-white px-4 py-3 transition hover:border-emerald-200 hover:bg-emerald-50/40"
                    >
                      {content}
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </motion.div>
    </div>
  );
}
