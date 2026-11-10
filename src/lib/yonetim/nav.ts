import type { LucideIcon } from "lucide-react";
import {
  ExternalLink,
  LayoutDashboard,
  MapPinned,
  Newspaper,
  Package,
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

/* --------------------------------------------------------------------------
 * Ürünler — tek rota, üç sekme
 * Vitrin ürünü, toplu katalog ve 2. el cihaz esnafın kafasında tek iş:
 * "sattığım şeyi koyayım". Üçü de /yonetim/urunler altında toplanır.
 * ----------------------------------------------------------------------- */

export const URUNLER_PATH = "/yonetim/urunler";

export const URUNLER_TABS = [
  { id: "urunler", label: "Ürünler", description: "Vitrin ürünleri" },
  { id: "katalog", label: "Toplu Katalog", description: "Modele göre toplu görsel" },
  { id: "ikinci-el", label: "2. El", description: "İkinci el cihaz ilanları" },
] as const;

export type UrunlerTabId = (typeof URUNLER_TABS)[number]["id"];

export const URUNLER_VARSAYILAN_SEKME: UrunlerTabId = "urunler";

/** Sorgu parametresini geçerli bir sekmeye çevirir; tanınmayan değer varsayılana düşer. */
export function parseUrunlerTab(value: string | string[] | undefined): UrunlerTabId {
  const raw = Array.isArray(value) ? value[0] : value;
  const match = URUNLER_TABS.find((tab) => tab.id === raw);
  return match ? match.id : URUNLER_VARSAYILAN_SEKME;
}

export function urunlerTabHref(tab: UrunlerTabId): string {
  return tab === URUNLER_VARSAYILAN_SEKME
    ? URUNLER_PATH
    : `${URUNLER_PATH}?sekme=${tab}`;
}

/** Ürünlerin birleştirme öncesi rotaları — yönlendirme ve menü vurgusu tek kaynaktan okur. */
export const URUNLER_ESKI_ROTALAR = [
  "/yonetim/katalog",
  "/yonetim/cihazlar",
  "/dukkan-ayarlari/urunler",
] as const;

function isUrunlerPath(pathname: string): boolean {
  if (pathname.startsWith(URUNLER_PATH)) return true;
  return URUNLER_ESKI_ROTALAR.some((rota) => pathname.startsWith(rota));
}

/* --------------------------------------------------------------------------
 * Üst menü
 * Kullanım sıklığına göre dört bölüm. Blog ve Harita Pazarı menüde değil:
 * blog ara sıra yazılır, Harita Pazarı ise bir bölüm değil rapordur ve
 * panelde kart olarak durur.
 * ----------------------------------------------------------------------- */

export function getYonetimNavItems(): YonetimNavItem[] {
  return [
    {
      id: "overview",
      label: "Panel",
      shortLabel: "Panel",
      href: "/yonetim",
      match: (pathname) =>
        pathname === "/yonetim" || pathname.startsWith("/yonetim/harita-pazari"),
      icon: LayoutDashboard,
    },
    {
      id: "servis",
      label: "Servis",
      shortLabel: "Servis",
      href: "/yonetim/servis",
      match: (pathname) => pathname.startsWith("/yonetim/servis"),
      icon: Wrench,
    },
    {
      id: "urunler",
      label: "Ürünler",
      shortLabel: "Ürünler",
      href: URUNLER_PATH,
      match: isUrunlerPath,
      icon: Package,
    },
    {
      id: "magaza",
      label: "Mağaza",
      shortLabel: "Mağaza",
      href: "/dukkan-ayarlari",
      match: (pathname) =>
        (pathname.startsWith("/dukkan-ayarlari") && !isUrunlerPath(pathname)) ||
        pathname.startsWith("/yonetim/blog"),
      icon: Settings,
    },
  ];
}

/** Üst menüde yer almayan bölümler — mobil "Daha fazla" sayfası için. */
export function getYonetimMoreItems(): YonetimHubItem[] {
  return [
    {
      id: "magaza",
      title: "Mağaza Ayarları",
      description: "Vitrin, iletişim, konum ve SSS",
      href: "/dukkan-ayarlari",
      icon: Settings,
      accent: "slate",
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
      id: "harita-pazari",
      title: "Harita Pazarı",
      description: "Google Haritalar sıran ve rakiplerin",
      href: "/yonetim/harita-pazari",
      icon: MapPinned,
      accent: "teal",
    },
  ];
}

/** Panelin altındaki ince kısayol satırı. Üst menüyü tekrar etmez. */
export function getPanelKisayollari(shopSlug: string): YonetimHubItem[] {
  return [
    {
      id: "blog",
      title: "Blog Yönetimi",
      description: "Yazılar ve yerel SEO",
      href: "/yonetim/blog",
      icon: Newspaper,
      accent: "sky",
    },
    {
      id: "vitrin",
      title: "Vitrini Görüntüle",
      description: `/${shopSlug}`,
      href: `/${shopSlug}`,
      icon: ExternalLink,
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
