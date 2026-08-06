"use client";

import {
  DAY_LABELS,
  DAY_ORDER,
  formatDayHours,
  formatDayStatus,
  getLegacyCalismaSaatleriLines,
  getTodayDayKey,
  isLegacyCalismaSaatleri,
  isStoreOpenNow,
  parseCalismaSaatleri,
  type WeeklySchedule,
} from "@/lib/dukkan/calisma-saatleri";
import { cn } from "@/lib/utils/cn";
import { useMemo } from "react";

export function CalismaSaatleriDisplay({
  raw,
  className,
}: {
  raw: string | null | undefined;
  className?: string;
}) {
  const schedule = useMemo(() => parseCalismaSaatleri(raw), [raw]);
  const todayKey = useMemo(() => getTodayDayKey(), []);
  const isOpenNow = useMemo(
    () => (schedule ? isStoreOpenNow(schedule) : false),
    [schedule]
  );

  if (!raw?.trim()) return null;

  if (!schedule) {
    const lines = getLegacyCalismaSaatleriLines(raw);
    if (!lines.length) return null;

    return (
      <div
        className={cn(
          "rounded-2xl border border-gray-100 bg-white p-5 shadow-sm lg:p-6",
          className
        )}
      >
        <DisplayHeader isOpenNow={null} />
        <ul className="mt-4 space-y-2 text-sm leading-relaxed text-gray-700">
          {lines.map((line, index) => (
            <li key={`${line}-${index}`}>{line}</li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-2xl border border-gray-100 bg-white p-5 shadow-sm lg:p-6",
        className
      )}
    >
      <DisplayHeader isOpenNow={isOpenNow} />
      <ScheduleTable schedule={schedule} todayKey={todayKey} />
    </div>
  );
}

function DisplayHeader({ isOpenNow }: { isOpenNow: boolean | null }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-600">
          Çalışma Saatleri
        </p>
        <h3 className="mt-1 text-lg font-bold text-gray-900">Haftalık program</h3>
      </div>

      {isOpenNow !== null && (
        <span
          className={cn(
            "inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold",
            isOpenNow
              ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100"
              : "bg-slate-100 text-slate-600 ring-1 ring-slate-200"
          )}
        >
          <span
            className={cn(
              "size-2 rounded-full",
              isOpenNow ? "bg-emerald-500" : "bg-slate-400"
            )}
            aria-hidden
          />
          {isOpenNow ? "Şu an açık" : "Şu an kapalı"}
        </span>
      )}
    </div>
  );
}

function ScheduleTable({
  schedule,
  todayKey,
}: {
  schedule: WeeklySchedule;
  todayKey: ReturnType<typeof getTodayDayKey>;
}) {
  return (
    <div className="mt-5 divide-y divide-gray-100 border-t border-gray-100">
      {DAY_ORDER.map((day) => {
        const entry = schedule.gunler[day];
        const isToday = day === todayKey;

        return (
          <div
            key={day}
            className={cn(
              "flex items-center justify-between gap-4 py-3.5 first:pt-4",
              isToday &&
                "relative -mx-2 rounded-xl bg-emerald-50/80 px-3 ring-1 ring-emerald-100 sm:-mx-3 sm:px-4"
            )}
          >
            <div className="flex min-w-0 items-center gap-3">
              <span
                className={cn(
                  "text-sm font-medium",
                  isToday ? "text-emerald-800" : "text-gray-700"
                )}
              >
                {DAY_LABELS[day]}
              </span>
              {isToday && (
                <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                  Bugün
                </span>
              )}
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                  entry.acik === true
                    ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100"
                    : "bg-slate-100 text-slate-500 ring-1 ring-slate-200"
                )}
              >
                {formatDayStatus(entry)}
              </span>
            </div>

            <span
              className={cn(
                "shrink-0 text-sm font-semibold tabular-nums",
                entry.acik === true
                  ? isToday
                    ? "text-emerald-700"
                    : "text-gray-800"
                  : "text-gray-400"
              )}
            >
              {formatDayHours(entry)}
            </span>
          </div>
        );
      })}
    </div>
  );
}
