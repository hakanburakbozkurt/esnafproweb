"use client";

import Link from "next/link";
import { FeaturedStoreCard } from "@/components/landing/featured-store-card";
import {
  LANDING_STORES_MOBILE_LIMIT,
  type PublicStoreCard,
} from "@/lib/dukkan/public-store.types";
import { cn } from "@/lib/utils/cn";

export function FeaturedStoresSection({
  stores,
  hasMore = false,
}: {
  stores: PublicStoreCard[];
  hasMore?: boolean;
}) {
  if (!stores.length) return null;

  return (
    <section
      id="esnaflar"
      className="overflow-x-hidden bg-white px-4 py-16 sm:px-6 md:py-20"
    >
      <div className="mx-auto w-full min-w-0 max-w-6xl">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Dijital Dükkanını Açan Esnaflar
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-slate-500">
            EsnafPRO ile dijital vitrinini açan işletmeleri keşfedin.
          </p>
        </div>

        <div className="relative mt-10 sm:mt-12">
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 lg:gap-5">
            {stores.map((store, index) => (
              <FeaturedStoreCard
                key={store.id}
                store={store}
                className={cn(
                  index >= LANDING_STORES_MOBILE_LIMIT && "hidden lg:flex"
                )}
              />
            ))}
          </div>

          {hasMore && (
            <div className="mt-5 flex justify-end sm:mt-6">
              <Link
                href="/esnaflar"
                className="group inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-white px-4 py-2 text-sm font-semibold text-emerald-700 shadow-sm transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800"
              >
                Tümünü Gör
                <span
                  aria-hidden
                  className="transition-transform group-hover:translate-x-0.5"
                >
                  →
                </span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
