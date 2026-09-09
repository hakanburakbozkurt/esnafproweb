"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CreditCard,
  Search,
  Smartphone,
  Wand2,
} from "@/components/local-yonetim/local-admin-ui";
import { cn } from "@/lib/utils/cn";

const navLinks = [
  { href: "/local-yonetim", label: "Genel Bakış", exact: true as const },
  { href: "/local-yonetim/fiyatlar", label: "Fiyatlar" },
  { href: "/local-yonetim/sss", label: "SSS" },
  { href: "/local-yonetim/dukkan-onay", label: "Dükkan Onay" },
  { href: "/local-yonetim/seo", label: "SEO Yönetimi", icon: Search },
  { href: "/local-yonetim/abonelikler", label: "Abonelikler", icon: CreditCard },
  { href: "/local-yonetim/fiyat-sihirbazi", label: "Fiyat Sihirbazı", icon: Wand2 },
  { href: "/local-yonetim/urunler-gorseller", label: "Ürünler & Görseller" },
  { href: "/local-yonetim/stok", label: "Stok Yönetimi" },
  { href: "/local-yonetim/katalog", label: "Cihaz Kataloğu", icon: Smartphone },
  { href: "/local-yonetim/ayarlar", label: "Ayarlar" },
] as const;

function isLinkActive(pathname: string, href: string, exact?: boolean) {
  if (exact) {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function LocalYonetimSidebar() {
  const pathname = usePathname() ?? "";

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-neutral-200/80 bg-white shadow-sm">
      <div className="border-b border-neutral-100 px-6 py-7">
        <p className="text-xl font-bold tracking-tight text-black">Admin</p>
        <p className="mt-0.5 text-xl font-bold tracking-tight text-emerald-500">
          EsnafPro
        </p>
        <p className="mt-3 text-xs font-medium text-neutral-400">
          Yerel komuta merkezi
        </p>
      </div>

      <nav className="flex-1 px-3 py-5" aria-label="Local yönetim menüsü">
        <ul className="space-y-1">
          {navLinks.map((link) => {
            const active = isLinkActive(
              pathname,
              link.href,
              "exact" in link ? link.exact : false
            );
            const Icon = "icon" in link ? link.icon : null;

            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-neutral-600 transition-colors",
                    "hover:bg-emerald-50 hover:text-emerald-700",
                    active && "bg-emerald-50 text-emerald-700"
                  )}
                >
                  {Icon && <Icon className="size-4 shrink-0" aria-hidden />}
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
