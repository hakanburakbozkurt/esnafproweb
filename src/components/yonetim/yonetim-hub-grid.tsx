import Link from "next/link";
import {
  getYonetimHubAccentClass,
  getYonetimHubItems,
} from "@/lib/yonetim/nav";
import { cn } from "@/lib/utils/cn";

export function YonetimHubGrid({ shopSlug }: { shopSlug: string }) {
  const items = getYonetimHubItems(shopSlug);

  return (
    <section aria-label="Hızlı erişim">
      <div className="mb-4">
        <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-slate-500">
          Yönetim Merkezi
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Sık kullandığınız bölümlere tek dokunuşla geçin.
        </p>
      </div>

      <ul className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
        {items.map((item) => {
          const Icon = item.icon;

          return (
            <li
              key={item.id}
              className={cn(item.id === "vitrin" && "col-span-2 lg:col-span-1")}
            >
              <Link
                href={item.href}
                className="group flex h-full min-h-[7.5rem] flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm transition hover:border-emerald-200 hover:shadow-md sm:min-h-[8.5rem] sm:p-5"
              >
                <span
                  className={cn(
                    "inline-flex size-11 items-center justify-center rounded-xl transition",
                    getYonetimHubAccentClass(item.accent)
                  )}
                >
                  <Icon className="size-5" aria-hidden />
                </span>
                <span className="mt-4 block">
                  <span className="block text-sm font-bold text-slate-900 sm:text-base">
                    {item.title}
                  </span>
                  <span className="mt-0.5 block text-xs leading-snug text-slate-500">
                    {item.description}
                  </span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
