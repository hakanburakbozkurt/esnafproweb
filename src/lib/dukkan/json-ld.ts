import { getPublicSiteUrl } from "@/lib/auth/site-url";
import {
  parseCalismaSaatleri,
  toSchemaOrgOpeningHours,
} from "@/lib/dukkan/calisma-saatleri";
import {
  getVisibleFaqItems,
  resolveFaqItemsForSource,
} from "@/lib/dukkan/faq";
import { parseLocationFromAdres } from "@/lib/dukkan/faq-placeholders";
import type { FaqPlaceholderSource } from "@/lib/dukkan/faq-placeholders";
import type { Dukkan, DukkanBlogYazisi, FaqItem } from "@/types/database.types";
import type { SecondHandDevicePublic } from "@/types/database.types";

function absoluteStorePath(slug: string, path = ""): string {
  const normalizedPath = path.startsWith("/") ? path : path ? `/${path}` : "";
  return `${getPublicSiteUrl()}/${slug}${normalizedPath}`;
}

export function buildLocalBusinessJsonLd(dukkan: Dukkan) {
  const pageUrl = absoluteStorePath(dukkan.slug);
  const { il, ilce } = parseLocationFromAdres(dukkan.adres);

  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${pageUrl}#localbusiness`,
    name: dukkan.dukkan_adi,
    url: pageUrl,
  };

  if (dukkan.aciklama) schema.description = dukkan.aciklama;
  if (dukkan.whatsapp || dukkan.telefon) {
    schema.telephone = dukkan.whatsapp ?? dukkan.telefon;
  }
  if (dukkan.logo_url) schema.logo = dukkan.logo_url;

  const sameAs = [
    dukkan.instagram_url,
    dukkan.tiktok_url,
    dukkan.facebook_url,
  ].filter(Boolean);

  if (sameAs.length) schema.sameAs = sameAs;

  const schedule = parseCalismaSaatleri(dukkan.calisma_saatleri);
  if (schedule) {
    const openingHours = toSchemaOrgOpeningHours(schedule);
    if (openingHours.length) schema.openingHours = openingHours;
  } else if (dukkan.calisma_saatleri) {
    schema.openingHours = dukkan.calisma_saatleri;
  }

  const images = [
    dukkan.banner_url,
    dukkan.logo_url,
    ...(dukkan.dukkan_fotograflari ?? []),
  ].filter(Boolean);

  if (images.length) schema.image = images;

  if (dukkan.adres) {
    schema.address = {
      "@type": "PostalAddress",
      streetAddress: dukkan.adres,
      ...(ilce ? { addressLocality: ilce } : {}),
      ...(il ? { addressRegion: il } : {}),
      addressCountry: "TR",
    };
  }

  if (dukkan.enlem != null && dukkan.boylam != null) {
    schema.geo = {
      "@type": "GeoCoordinates",
      latitude: dukkan.enlem,
      longitude: dukkan.boylam,
    };
  }

  if (il || ilce) {
    schema.areaServed = {
      "@type": "AdministrativeArea",
      name: ilce && il ? `${ilce}, ${il}` : il ?? ilce,
    };
  }

  return schema;
}

export function buildFaqPageJsonLd(
  faqItems: FaqItem[],
  placeholderSource?: FaqPlaceholderSource
) {
  const visibleItems = placeholderSource
    ? resolveFaqItemsForSource(faqItems, placeholderSource)
    : getVisibleFaqItems(faqItems);

  if (!visibleItems.length) return null;

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: visibleItems.map((item) => ({
      "@type": "Question",
      name: item.soru.trim(),
      acceptedAnswer: {
        "@type": "Answer",
        text: item.cevap.trim(),
      },
    })),
  };
}

export function buildBreadcrumbListJsonLd(
  items: Array<{ name: string; path: string }>
) {
  if (!items.length) return null;

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${getPublicSiteUrl()}${item.path.startsWith("/") ? item.path : `/${item.path}`}`,
    })),
  };
}

export function buildStoreBreadcrumbJsonLd(
  slug: string,
  shopName: string,
  crumbs: Array<{ name: string; segment?: string }>
) {
  return buildBreadcrumbListJsonLd([
    { name: shopName, path: `/${slug}` },
    ...crumbs.map((crumb) => ({
      name: crumb.name,
      path: `/${slug}${crumb.segment ? `/${crumb.segment}` : ""}`,
    })),
  ]);
}

export function buildWebPageJsonLd(input: {
  slug: string;
  path: string;
  name: string;
  description?: string | null;
}) {
  const url = absoluteStorePath(input.slug, input.path);

  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: input.name,
    url,
    ...(input.description ? { description: input.description } : {}),
    isPartOf: {
      "@type": "WebSite",
      name: "EsnafPRO",
      url: getPublicSiteUrl(),
    },
    about: {
      "@id": `${absoluteStorePath(input.slug)}#localbusiness`,
    },
  };
}

export function buildBlogPostingJsonLd(input: {
  post: DukkanBlogYazisi;
  shopName: string;
  shopSlug: string;
}) {
  const url = absoluteStorePath(input.shopSlug, `/blog/${input.post.slug}`);

  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: input.post.baslik,
    datePublished: input.post.created_at,
    dateModified: input.post.updated_at ?? input.post.created_at,
    author: {
      "@type": "Organization",
      name: input.shopName,
    },
    publisher: {
      "@type": "Organization",
      name: input.shopName,
    },
    url,
    mainEntityOfPage: url,
    ...(input.post.kapak_url ? { image: input.post.kapak_url } : {}),
    ...(input.post.icerik ? { articleBody: input.post.icerik } : {}),
  };
}

export function buildProductJsonLd(input: {
  device: Pick<
    SecondHandDevicePublic,
    | "brand"
    | "model"
    | "sale_price"
    | "web_title"
    | "web_description"
    | "image_urls"
    | "web_slug"
    | "condition"
  >;
  shopName: string;
  shopSlug: string;
  devicePath: string;
}) {
  const name =
    input.device.web_title?.trim() ||
    `${input.device.brand} ${input.device.model}`.trim();
  const url = `${getPublicSiteUrl()}${input.devicePath.startsWith("/") ? input.devicePath : `/${input.devicePath}`}`;

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    description:
      input.device.web_description?.trim() ??
      `${input.shopName} ikinci el cihaz ilanı: ${name}`,
    url,
    ...(input.device.image_urls?.[0]
      ? { image: input.device.image_urls[0] }
      : {}),
    offers: {
      "@type": "Offer",
      priceCurrency: "TRY",
      price: input.device.sale_price,
      availability: "https://schema.org/InStock",
      seller: {
        "@type": "LocalBusiness",
        name: input.shopName,
        url: absoluteStorePath(input.shopSlug),
      },
    },
    ...(input.device.condition
      ? { itemCondition: "https://schema.org/UsedCondition" }
      : {}),
  };
}

export function buildDukkanJsonLd(dukkan: Dukkan) {
  return [buildLocalBusinessJsonLd(dukkan)];
}
