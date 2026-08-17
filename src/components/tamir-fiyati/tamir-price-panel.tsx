"use client";

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
            className="h-24 w-24 shrink-0 rounded-2xl ring-1 ring-slate-200/80 sm:h-28 sm:w-28"
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
            <ul className="space-y-3">
              {group.items.map((item) => (
                <TamirPriceRow key={item.id} item={item} />
              ))}
            </ul>
          </section>
        ))}
      </div>

      <p className="rounded-2xl border border-slate-200/80 bg-slate-50/80 px-4 py-3 text-center text-xs leading-relaxed text-slate-500">
        Fiyatlar referans amaçlıdır. Kesin teklif için yetkili servis noktası ile
        iletişime geçin.
      </p>
    </div>
  );
}

function TamirPriceRow({ item }: { item: TamirFiyati }) {
  const isQuote = item.price == null || Number(item.price) === 0;

  return (
    <li className="rounded-2xl border border-slate-200/80 bg-white/95 px-4 py-4 shadow-[0_1px_2px_rgba(15,23,42,0.03)] transition duration-200 hover:border-emerald-200/80 hover:shadow-[0_8px_24px_rgba(16,185,129,0.06)] sm:px-5 sm:py-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
        <div className="min-w-0 flex-1">
          <p className="text-base font-semibold text-slate-900 sm:text-[1.05rem]">
            {item.service_name}
          </p>
          {item.description && (
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              {item.description}
            </p>
          )}
        </div>
        <p
          className={cn(
            "shrink-0 text-lg font-extrabold sm:text-right",
            isQuote ? "text-slate-500" : "text-emerald-700"
          )}
        >
          {formatTamirPrice(item.price)}
        </p>
      </div>
    </li>
  );
}
