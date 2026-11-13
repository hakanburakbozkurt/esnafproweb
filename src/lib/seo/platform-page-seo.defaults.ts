import type { PlatformPageSeo } from "@/lib/seo/platform-page-seo.types";

/** Admin kataloğu ve public fallback — DB kaydı yoksa kullanılır. */
export const PLATFORM_PAGE_SEO_DEFAULTS: PlatformPageSeo[] = [
  {
    page_path: "/",
    label: "Ana Sayfa",
    meta_title: "EsnafPRO | Telefoncular İçin Ücretsiz Dijital Mağaza",
    meta_description:
      "Cep telefoncusu ve teknik servisler için ücretsiz dijital mağaza. Ürün, 2. el cihaz ve servis takibi tek panelde; müşterin seni Google'da bulsun.",
    meta_keywords:
      "esnafpro, telefoncu web sitesi, ücretsiz dijital mağaza, telefon dükkanı, teknik servis takibi, ikinci el telefon",
    robots_index: true,
    robots_follow: true,
    sort_order: 0,
  },
  {
    page_path: "/fiyatlandirma",
    label: "Fiyatlandırma",
    meta_title: "Fiyatlandırma: Mağaza Sayfası Ücretsiz | EsnafPRO",
    meta_description:
      "EsnafPRO paket fiyatları: mağaza sayfası ücretsiz. Stok, kasa, servis takibi ve yapay zeka asistanı için Büyüme ve Pro paketlerini karşılaştırın.",
    meta_keywords: "esnafpro fiyat, paket, abonelik, toptancı planı",
    robots_index: true,
    robots_follow: true,
    sort_order: 1,
  },
  {
    page_path: "/pazaryeri",
    label: "Pazaryeri",
    meta_title: "İkinci El ve Sıfır Telefon İlanları | EsnafPRO",
    meta_description:
      "Telefoncu mağazalarının ikinci el ve sıfır telefon, tablet ve cihaz ilanları. Fiyatı ve mağaza adresini görün, satıcıya WhatsApp'tan sorun.",
    meta_keywords: "ikinci el telefon, pazaryeri, esnaf ilanları, tablet",
    robots_index: true,
    robots_follow: true,
    sort_order: 2,
  },
  {
    page_path: "/blog",
    label: "Blog",
    meta_title: "Telefoncu ve Esnaf Rehberi | EsnafPRO Blog",
    meta_description:
      "Telefon tamiri, ikinci el cihaz ve yerel SEO üzerine rehberler. Telefoncuların dükkanını internete taşıması ve Google'da öne çıkması için ipuçları.",
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
      "EsnafPRO, cep telefoncuları ve teknik servisler için dijital mağaza, servis takibi ve işletme yönetimi platformudur. Amacımızı ve iletişim bilgilerimizi görün.",
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
      "EsnafPRO'ya telefon, WhatsApp veya e-postayla ulaşın. Mağaza kurulumu, paketler, destek ve iş birliği sorularınızı yanıtlıyoruz.",
    meta_keywords: "esnafpro iletişim, destek, iş birliği",
    robots_index: true,
    robots_follow: true,
    sort_order: 5,
  },
  {
    page_path: "/esnaflar",
    label: "Esnaflar",
    meta_title: "Telefoncu ve Teknik Servis Mağazaları | EsnafPRO",
    meta_description:
      "EsnafPRO'da dijital mağazasını açan telefoncu ve teknik servisler. Mağazaları inceleyin, ürünlere bakın, doğrudan WhatsApp'tan ulaşın.",
    meta_keywords: "esnaf listesi, dijital dükkan, yerel esnaf",
    robots_index: true,
    robots_follow: true,
    sort_order: 6,
  },
  {
    page_path: "/tamir-fiyati",
    label: "Tamir Fiyatı Al",
    meta_title: "Telefon Tamir Fiyatları: Ekran ve Pil | EsnafPRO",
    meta_description:
      "Telefonunun marka ve modelini seç, ekran ve pil değişimi fiyatlarını anında gör. EsnafPRO referans listesiyle güncel teknik servis ücretleri.",
    meta_keywords: "telefon tamir fiyatı, ekran değişimi fiyatı, pil değişimi fiyatı, iphone ekran fiyatı",
    robots_index: true,
    robots_follow: true,
    sort_order: 7,
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
