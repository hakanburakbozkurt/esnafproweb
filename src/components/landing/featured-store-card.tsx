import Link from "next/link";
import { cn } from "@/lib/utils/cn";
import type { PublicStoreCard } from "@/lib/dukkan/public-store.types";

function StoreAvatar({ store }: { store: PublicStoreCard }) {
  const initial = store.dukkan_adi.trim().charAt(0).toUpperCase() || "E";

  if (store.logo_url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={store.logo_url}
        alt=""
        className="size-full object-cover"
        loading="lazy"
      />
    );
  }

  return (
    <span className="text-lg font-bold text-emerald-700" aria-hidden>
      {initial}
    </span>
  );
}

export function FeaturedStoreCard({
  store,
  className,
}: {
  store: PublicStoreCard;
  className?: string;
}) {
  return (
    <Link
      href={`/${store.slug}`}
      className={cn(
        "group flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition duration-300",
        "hover:border-emerald-200 hover:shadow-md hover:shadow-emerald-100/50",
        className
      )}
    >
      <div className="flex aspect-[4/3] items-center justify-center overflow-hidden bg-gradient-to-br from-emerald-50/80 to-slate-50">
        <div className="flex size-16 items-center justify-center overflow-hidden rounded-2xl border border-white bg-white shadow-sm ring-1 ring-emerald-100/80 transition group-hover:ring-emerald-200 sm:size-[4.5rem]">
          <StoreAvatar store={store} />
        </div>
      </div>

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
