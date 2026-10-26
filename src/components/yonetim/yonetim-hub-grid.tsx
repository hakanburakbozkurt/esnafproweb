import { ChevronRight } from "lucide-react";
import Link from "next/link";
import {
  getYonetimHubAccentClass,
  getYonetimHubItems,
} from "@/lib/yonetim/nav";
import { cn } from "@/lib/utils/cn";

export function YonetimHubGrid({ shopSlug }: { shopSlug: string }) {
  const items = getYonetimHubItems(shopSlug);

  return (
    <section aria-labelledby="tum-moduller-baslik">
      <h2
        id="tum-moduller-baslik"
        className="mb-3 text-sm font-bold uppercase tracking-[0.14em] text-slate-500"
      >
        Tüm modüller
      </h2>

      <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => {
          const Icon = item.icon;

          return (
            <li key={item.id}>
              <Link
                href={item.href}
                className="group flex min-h-14 items-center gap-3 rounded-2xl border border-slate-200/80 bg-white px-3 py-2.5 shadow-sm transition hover:border-emerald-200 hover:shadow-md"
              >
                <span
                  className={cn(
                    "inline-flex size-10 shrink-0 items-center justify-center rounded-xl transition",
                    getYonetimHubAccentClass(item.accent)
                  )}
                >
                  <Icon className="size-5" aria-hidden />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-bold text-slate-900">
                    {item.title}
                  </span>
                  <span className="block truncate text-xs text-slate-500">
                    {item.description}
                  </span>
                </span>
                <ChevronRight
                  className="size-4 shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-emerald-600 motion-reduce:transition-none"
                  aria-hidden
                />
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
