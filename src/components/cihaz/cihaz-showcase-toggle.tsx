"use client";

import { Loader2, Store } from "lucide-react";
import { useState, useTransition } from "react";
import { updatePazaryeriVitrinActive } from "@/lib/cihaz/actions";
import { cn } from "@/lib/utils/cn";

type CihazShowcaseToggleProps = {
  initialActive: boolean;
  shopSlug: string;
  publishedDeviceCount: number;
};

export function CihazShowcaseToggle({
  initialActive,
  shopSlug,
  publishedDeviceCount,
}: CihazShowcaseToggleProps) {
  const [active, setActive] = useState(initialActive);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <div
      className={cn(
        "rounded-2xl border px-4 py-3 sm:px-5",
        active
          ? "border-emerald-200 bg-emerald-50/80"
          : "border-slate-200 bg-slate-50/80"
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <span
            className={cn(
              "inline-flex size-9 shrink-0 items-center justify-center rounded-xl",
              active ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-500"
            )}
          >
            <Store className="size-4" aria-hidden />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-900">
              Vitrin {active ? "Açık" : "Kapalı"}
            </p>
            <p className="mt-0.5 text-xs leading-relaxed text-slate-600">
              {active
                ? `Mağaza pazaryeri sayfanız ve ${publishedDeviceCount} yayında ilan görünür.`
                : "Public vitrin ve pazaryeri sayfanız ziyaretçilere kapalı; ilan ayarları korunur."}
            </p>
            {shopSlug && active && (
              <a
                href={`/${shopSlug}/pazaryeri`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 inline-block text-xs font-medium text-emerald-700 underline"
              >
                Vitrini önizle
              </a>
            )}
          </div>
        </div>

        <label className="inline-flex min-h-10 shrink-0 cursor-pointer items-center gap-2.5">
          <span className="text-xs font-semibold text-slate-600">
            {active ? "Kapat" : "Aç"}
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={active}
            aria-label="Pazaryeri vitrini aç/kapat"
            disabled={pending}
            onClick={() => {
              setError(null);
              const next = !active;
              startTransition(async () => {
                const result = await updatePazaryeriVitrinActive(next);
                if (!result.ok) {
                  setError(result.error);
                  return;
                }
                setActive(next);
              });
            }}
            className={cn(
              "relative inline-flex h-7 w-12 shrink-0 rounded-full transition",
              active ? "bg-emerald-500" : "bg-slate-300",
              pending && "opacity-60"
            )}
          >
            <span
              className={cn(
                "absolute top-0.5 size-6 rounded-full bg-white shadow transition",
                active ? "left-[22px]" : "left-0.5"
              )}
            />
          </button>
          {pending && (
            <Loader2 className="size-4 animate-spin text-slate-400" aria-hidden />
          )}
        </label>
      </div>

      {error && (
        <p role="alert" className="mt-2 text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
