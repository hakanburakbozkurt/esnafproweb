import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  LayoutGrid,
  Newspaper,
  Settings,
  Wrench,
} from "lucide-react";

export type YonetimNavItem = {
  id: string;
  label: string;
  shortLabel?: string;
  description?: string;
  href: string;
  match: (pathname: string) => boolean;
  icon: LucideIcon;
};

export type YonetimHubItem = {
  id: string;
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  accent: "emerald" | "teal" | "sky" | "amber" | "slate";
};

const accentClasses: Record<YonetimHubItem["accent"], string> = {
  emerald: "bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100",
  teal: "bg-teal-50 text-teal-600 group-hover:bg-teal-100",
  sky: "bg-sky-50 text-sky-600 group-hover:bg-sky-100",
  amber: "bg-amber-50 text-amber-600 group-hover:bg-amber-100",
  slate: "bg-slate-100 text-slate-600 group-hover:bg-slate-200",
};

export function getYonetimHubAccentClass(accent: YonetimHubItem["accent"]) {
  return accentClasses[accent];
}

export function getYonetimNavItems(): YonetimNavItem[] {
  return [
    {
      id: "overview",
      label: "Genel Bakış",
      shortLabel: "Panel",
      href: "/yonetim",
      match: (pathname) => pathname === "/yonetim",
      icon: LayoutDashboard,
    },
    {
      id: "servis",
      label: "Servis Yönetimi",
      shortLabel: "Servis",
      href: "/yonetim/servis",
      match: (pathname) => pathname.startsWith("/yonetim/servis"),
      icon: Wrench,
    },
    {
      id: "blog",
      label: "Blog Yönetimi",
      shortLabel: "Blog",
      href: "/yonetim/blog",
      match: (pathname) => pathname.startsWith("/yonetim/blog"),
      icon: Newspaper,
    },
    {
      id: "katalog",
      label: "Katalog Yönetimi",
      shortLabel: "Katalog",
      href: "/yonetim/katalog",
      match: (pathname) => pathname.startsWith("/yonetim/katalog"),
      icon: LayoutGrid,
    },
    {
      id: "settings",
      label: "Mağaza Ayarları",
      shortLabel: "Ayarlar",
      href: "/dukkan-ayarlari",
      match: (pathname) => pathname.startsWith("/dukkan-ayarlari"),
      icon: Settings,
    },
  ];
}

export function getYonetimHubItems(shopSlug: string): YonetimHubItem[] {
  return [
    {
      id: "servis",
      title: "Servis Yönetimi",
      description: "Kayıtlar, arama ve detay",
      href: "/yonetim/servis",
      icon: Wrench,
      accent: "emerald",
    },
    {
      id: "settings",
      title: "Mağaza Ayarları",
      description: "Logo, vitrin ve iletişim",
      href: "/dukkan-ayarlari",
      icon: Settings,
      accent: "teal",
    },
    {
      id: "blog",
      title: "Blog Yönetimi",
      description: "Yazılar ve yerel SEO",
      href: "/yonetim/blog",
      icon: Newspaper,
      accent: "sky",
    },
    {
      id: "katalog",
      title: "Katalog Yönetimi",
      description: "Toplu kılıf görselleri",
      href: "/yonetim/katalog",
      icon: LayoutGrid,
      accent: "amber",
    },
    {
      id: "vitrin",
      title: "Vitrini Görüntüle",
      description: `/${shopSlug}`,
      href: `/${shopSlug}`,
      icon: LayoutDashboard,
      accent: "slate",
    },
  ];
}

export function isYonetimNavActive(
  pathname: string,
  item: YonetimNavItem
): boolean {
  return item.match(pathname);
}
