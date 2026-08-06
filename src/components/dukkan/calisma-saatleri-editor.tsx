"use client";

import { Input } from "@/components/ui/input";
import {
  applyDayToAll,
  applyWeekdayTemplate,
  DAY_LABELS,
  DAY_ORDER,
  normalizeTimeValue,
  serializeCalismaSaatleri,
  type DayKey,
  type WeeklySchedule,
} from "@/lib/dukkan/calisma-saatleri";
import { cn } from "@/lib/utils/cn";

type CalismaSaatleriEditorProps = {
  value: WeeklySchedule;
  onChange: (schedule: WeeklySchedule) => void;
};

export function CalismaSaatleriEditor({
  value,
  onChange,
}: CalismaSaatleriEditorProps) {
  function updateDay(day: DayKey, patch: Partial<WeeklySchedule["gunler"][DayKey]>) {
    onChange({
      ...value,
      gunler: {
        ...value.gunler,
        [day]: {
          ...value.gunler[day],
          ...patch,
        },
      },
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onChange(applyDayToAll(value))}
          className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition hover:border-emerald-300 hover:text-emerald-700"
        >
          Hepsine Uygula
        </button>
        <button
          type="button"
          onClick={() => onChange(applyWeekdayTemplate(value))}
          className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition hover:border-emerald-300 hover:text-emerald-700"
        >
          Hafta İçi Şablonu
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white">
        <div className="hidden grid-cols-[minmax(0,1.1fr)_auto_minmax(0,0.9fr)_minmax(0,0.9fr)] gap-3 border-b border-slate-100 px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400 sm:grid lg:px-5">
          <span>Gün</span>
          <span>Durum</span>
          <span>Başlangıç</span>
          <span>Bitiş</span>
        </div>

        <div className="divide-y divide-slate-100">
          {DAY_ORDER.map((day) => {
            const entry = value.gunler[day];

            return (
              <div
                key={day}
                className="grid gap-3 px-4 py-4 sm:grid-cols-[minmax(0,1.1fr)_auto_minmax(0,0.9fr)_minmax(0,0.9fr)] sm:items-center lg:px-5"
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900">
                    {DAY_LABELS[day]}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-400 sm:hidden">
                    {entry.acik === true ? "Açık" : "Kapalı"}
                  </p>
                </div>

                <button
                  type="button"
                  role="switch"
                  aria-checked={entry.acik === true}
                  aria-label={`${DAY_LABELS[day]} açık/kapalı`}
                  onClick={() => updateDay(day, { acik: entry.acik !== true })}
                  className={cn(
                    "relative inline-flex h-7 w-12 shrink-0 rounded-full transition",
                    entry.acik === true ? "bg-emerald-600" : "bg-slate-300"
                  )}
                >
                  <span
                    className={cn(
                      "absolute top-0.5 size-6 rounded-full bg-white shadow transition",
                      entry.acik === true ? "left-[22px]" : "left-0.5"
                    )}
                  />
                </button>

                <label className="block space-y-1.5">
                  <span className="text-[11px] font-medium uppercase tracking-wide text-slate-400 sm:sr-only">
                    Başlangıç
                  </span>
                  <Input
                    type="time"
                    value={entry.baslangic}
                    disabled={entry.acik !== true}
                    onChange={(event) =>
                      updateDay(day, {
                        baslangic: normalizeTimeValue(event.target.value, entry.baslangic),
                      })
                    }
                    className="w-full disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
                  />
                </label>

                <label className="block space-y-1.5">
                  <span className="text-[11px] font-medium uppercase tracking-wide text-slate-400 sm:sr-only">
                    Bitiş
                  </span>
                  <Input
                    type="time"
                    value={entry.bitis}
                    disabled={entry.acik !== true}
                    onChange={(event) =>
                      updateDay(day, {
                        bitis: normalizeTimeValue(event.target.value, entry.bitis),
                      })
                    }
                    className="w-full disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
                  />
                </label>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function CalismaSaatleriHiddenInput({
  value,
}: {
  value: WeeklySchedule;
}) {
  return (
    <input
      type="hidden"
      name="calisma_saatleri"
      value={serializeCalismaSaatleri(value)}
    />
  );
}
