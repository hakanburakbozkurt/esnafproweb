"use client";

import { useState } from "react";
import { TamirIconImage } from "@/components/tamir-fiyati/tamir-icon-image";
import {
  formatTamirPrice,
  groupTamirFiyatlariByCategory,
} from "@/lib/tamir-fiyati/tamir-fiyati-queries";
import type { TamirFiyati, TamirMarkasi } from "@/types/database.types";
import type { TamirModelOption } from "@/lib/tamir-fiyati/tamir-fiyati-queries";
import { cn } from "@/lib/utils/cn";

type TamirPricePanelProps = {
  brand: TamirMarkasi;
  model: TamirModelOption;
  modelIconSources: string[];
  prices: TamirFiyati[];
};

export function TamirPricePanel({
  brand,
  model,
  modelIconSources,
  prices,
}: TamirPricePanelProps) {
  const groupedPrices = groupTamirFiyatlariByCategory(prices);
  const showCategoryHeaders = groupedPrices.length > 1;

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-gradient-to-br from-white via-white to-emerald-50/40 p-5 shadow-[0_8px_30px_rgba(15,23,42,0.04)] sm:p-6">
        <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
          <TamirIconImage
            sources={modelIconSources}
            label={model.name}
            className="h-24 w-24 shrink-0 sm:h-28 sm:w-28"
            imageClassName="p-2.5"
          />
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-600">
              {brand.name}
            </p>
            <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              {model.name}
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Referans tamir fiyat listesi
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-5">
        {groupedPrices.map((group) => (
          <section key={group.category}>
            {showCategoryHeaders && (
              <h3 className="mb-3 px-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                {group.category}
              </h3>
            )}
            <ul className="space-y-2">
              {group.items.map((item) => (
                <TamirPriceRow key={item.id} item={item} />
              ))}
            </ul>
          </section>
        ))}
      </div>

      <p className="rounded-2xl border border-slate-200/80 bg-slate-50/80 px-4 py-3 text-center text-xs leading-relaxed text-slate-500">
        Fiyatlar referans amaçlıdır. Kesin teklif için yetkili servis noktası
        ile iletişime geçin.
      </p>
    </div>
  );
}

function TamirPriceRow({ item }: { item: TamirFiyati }) {
  const [open, setOpen] = useState(false);
  const isQuote = item.price == null || Number(item.price) === 0;
  const hasDetail = Boolean(item.description);

  return (
    <li className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white/95 shadow-[0_1px_2px_rgba(15,23,42,0.03)] transition duration-200 hover:border-emerald-200/80 hover:shadow-[0_8px_24px_rgba(16,185,129,0.06)]">
      <button
        type="button"
        onClick={() => hasDetail && setOpen((v) => !v)}
        disabled={!hasDetail}
        className={cn(
          "flex w-full items-center justify-between gap-3 px-4 py-4 text-left sm:px-5",
          hasDetail && "cursor-pointer"
        )}
        aria-expanded={hasDetail ? open : undefined}
      >
        <span className="min-w-0 flex-1 text-base font-semibold text-slate-900 sm:text-[1.05rem]">
          {item.service_name}
        </span>

        <span className="flex shrink-0 items-center gap-2">
          <span
            className={cn(
              "text-lg font-extrabold",
              isQuote ? "text-slate-500" : "text-emerald-700"
            )}
          >
            {formatTamirPrice(item.price)}
          </span>

          {hasDetail && (
            <InfoIcon
              open={open}
              className="text-slate-400 transition-colors group-hover:text-emerald-500"
            />
          )}
        </span>
      </button>

      {hasDetail && open && (
        <div className="border-t border-slate-100 bg-slate-50/60 px-4 pb-4 pt-3 sm:px-5">
          <p className="text-sm leading-relaxed text-slate-600">
            {item.description}
          </p>
        </div>
      )}
    </li>
  );
}

function InfoIcon({ open, className }: { open: boolean; className?: string }) {
  return (
    <svg
      aria-hidden
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className={cn(
        "h-5 w-5 shrink-0 transition-transform duration-200",
        open ? "rotate-180 text-emerald-500" : "text-slate-400",
        className
      )}
    >
      <path
        fillRule="evenodd"
        d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
        clipRule="evenodd"
      />
    </svg>
  );
}
