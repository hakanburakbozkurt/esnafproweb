import Link from "next/link";
import { cn } from "@/lib/utils/cn";
import type { PublicStoreCard } from "@/lib/dukkan/public-store.types";

function StorePlaceholder() {
  return (
    <div
      className="flex aspect-[2/1] items-center justify-center border-b border-dashed border-slate-200/80 bg-slate-50/80"
      aria-hidden
    >
      <div className="size-10 rounded-xl bg-slate-100 ring-1 ring-slate-200/80" />
    </div>
  );
}

export function FeaturedStoreCard({
  store,
  className,
}: {
  store: PublicStoreCard;
  className?: string;
}) {
  const hasLogo = Boolean(store.logo_url?.trim());

  return (
    <Link
      href={`/${store.slug}`}
      className={cn(
        "group flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition duration-300",
        "hover:border-emerald-200 hover:shadow-md hover:shadow-emerald-100/50",
        className
      )}
    >
      {hasLogo ? (
        <div className="relative aspect-[4/3] overflow-hidden bg-slate-50">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={store.logo_url!}
            alt={`${store.dukkan_adi} logosu`}
            className="size-full object-cover transition duration-300 group-hover:scale-[1.02]"
            loading="lazy"
          />
        </div>
      ) : (
        <StorePlaceholder />
      )}

      <div className="flex flex-1 flex-col p-3 sm:p-4">
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-slate-900 transition group-hover:text-emerald-700 sm:text-[15px]">
          {store.dukkan_adi}
        </h3>
        {store.aciklama?.trim() ? (
          <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-slate-500">
            {store.aciklama.trim()}
          </p>
        ) : (
          <p className="mt-1.5 text-xs text-slate-400">Dijital vitrin</p>
        )}
      </div>
    </Link>
  );
}
