"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  getYonetimNavItems,
  isYonetimNavActive,
} from "@/lib/yonetim/nav";
import { cn } from "@/lib/utils/cn";

export function YonetimSubNav() {
  const pathname = usePathname() ?? "";
  const items = getYonetimNavItems();

  return (
    <nav
      aria-label="Yönetim bölümleri"
      className="sticky top-16 z-40 -mx-4 mb-8 border-b border-slate-200/80 bg-white/90 backdrop-blur-md sm:-mx-6 sm:mb-10 lg:-mx-8"
    >
      <div className="overflow-x-auto px-4 sm:px-6 lg:px-8 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <ul className="flex min-w-max gap-1 py-2">
          {items.map((item) => {
            const active = isYonetimNavActive(pathname, item);
            const Icon = item.icon;

            return (
              <li key={item.id}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "inline-flex min-h-10 items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-semibold transition sm:px-4",
                    active
                      ? "bg-emerald-600 text-white shadow-sm shadow-emerald-600/20"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  )}
                >
                  <Icon className="size-4 shrink-0" aria-hidden />
                  <span className="whitespace-nowrap sm:hidden">
                    {item.shortLabel ?? item.label}
                  </span>
                  <span className="hidden whitespace-nowrap sm:inline">
                    {item.label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
