import type { PlatformPageSeo } from "@/lib/seo/platform-page-seo.types";

/** Admin kataloğu ve public fallback — DB kaydı yoksa kullanılır. */
export const PLATFORM_PAGE_SEO_DEFAULTS: PlatformPageSeo[] = [
  {
    page_path: "/",
    label: "Ana Sayfa",
    meta_title: "EsnafPRO | Dijital Vitrin ve İşletme Yönetimi",
    meta_description:
      "Telefon ve teknik servis esnafı için dijital vitrin, servis takibi, 2. el pazaryeri ve işletme yönetimi platformu. Kod bilmeden dakikalar içinde profesyonel mağaza sayfanızı açın.",
    meta_keywords:
      "esnafpro, dijital vitrin, telefon esnafı, teknik servis, yerel seo, ikinci el telefon",
    robots_index: true,
    robots_follow: true,
    sort_order: 0,
  },
  {
    page_path: "/fiyatlandirma",
    label: "Fiyatlandırma",
    meta_title: "Fiyatlandırma | EsnafPRO",
    meta_description:
      "Esnaf ve toptancı için şeffaf paket fiyatları. Aylık veya yıllık planlarla EsnafPRO'ya başlayın.",
    meta_keywords: "esnafpro fiyat, paket, abonelik, toptancı planı",
    robots_index: true,
    robots_follow: true,
    sort_order: 1,
  },
  {
    page_path: "/pazaryeri",
    label: "Pazaryeri",
    meta_title: "İkinci El Pazaryeri | EsnafPRO",
    meta_description:
      "Esnaf Pro üyesi mağazaların yayınladığı ikinci el telefon, tablet ve cihaz ilanlarını keşfedin.",
    meta_keywords: "ikinci el telefon, pazaryeri, esnaf ilanları, tablet",
    robots_index: true,
    robots_follow: true,
    sort_order: 2,
  },
  {
    page_path: "/blog",
    label: "Blog",
    meta_title: "Esnaf Rehberi | EsnafPRO Blog",
    meta_description:
      "EsnafPRO mağazalarından yerel SEO yazıları, sektör rehberleri ve duyurular.",
    meta_keywords: "esnaf blog, yerel seo, telefon tamiri rehberi",
    robots_index: true,
    robots_follow: true,
    sort_order: 3,
  },
  {
    page_path: "/hakkimizda",
    label: "Hakkımızda",
    meta_title: "Hakkımızda | EsnafPRO",
    meta_description:
      "EsnafPRO; esnaf ve küçük işletmeler için dijital vitrin ve işletme yönetim platformudur.",
    meta_keywords: "esnafpro hakkında, dijital dönüşüm, esnaf platformu",
    robots_index: true,
    robots_follow: true,
    sort_order: 4,
  },
  {
    page_path: "/iletisim",
    label: "İletişim",
    meta_title: "İletişim | EsnafPRO",
    meta_description:
      "EsnafPRO hakkında sorularınız, iş birliği teklifleriniz ve destek talepleriniz için bizimle iletişime geçin.",
    meta_keywords: "esnafpro iletişim, destek, iş birliği",
    robots_index: true,
    robots_follow: true,
    sort_order: 5,
  },
  {
    page_path: "/esnaflar",
    label: "Esnaflar",
    meta_title: "Dijital Dükkanını Açan Esnaflar | EsnafPRO",
    meta_description:
      "EsnafPRO ile dijital vitrinini açan esnaf ve işletmelerin listesi.",
    meta_keywords: "esnaf listesi, dijital dükkan, yerel esnaf",
    robots_index: true,
    robots_follow: true,
    sort_order: 6,
  },
];

export function getDefaultPlatformPageSeo(pagePath: string): PlatformPageSeo | undefined {
  return PLATFORM_PAGE_SEO_DEFAULTS.find((item) => item.page_path === pagePath);
}

export function getDefaultPlatformPageSeoOrThrow(pagePath: string): PlatformPageSeo {
  const found = getDefaultPlatformPageSeo(pagePath);
  if (!found) {
    throw new Error(`Tanımsız platform sayfası: ${pagePath}`);
  }
  return found;
}
