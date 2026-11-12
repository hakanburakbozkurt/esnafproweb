import { gorselAdresi } from "@/lib/gorsel/odak";
import { getPublicSiteUrl } from "@/lib/auth/site-url";
import { stripBlogHtml } from "@/lib/blog/blog-html";
import {
  parseCalismaSaatleri,
  toSchemaOrgOpeningHours,
} from "@/lib/dukkan/calisma-saatleri";
import {
  getVisibleFaqItems,
  resolveFaqItemsForSource,
} from "@/lib/dukkan/faq";
import { cozKonum, type DukkanKonumu } from "@/lib/dukkan/konum";
import type { FaqPlaceholderSource } from "@/lib/dukkan/faq-placeholders";
import type { Dukkan, DukkanBlogYazisi, FaqItem } from "@/types/database.types";
import type { SecondHandDevicePublic } from "@/types/database.types";

/**
 * Hizmet bölgesi: semt varsa ayrı bir Place olarak da yazılır, böylece
 * "Bahçeşehir telefoncu" ve "Başakşehir telefoncu" aramalarının ikisine de sinyal gider.
 */
function buildAreaServed({ il, ilce, semt }: DukkanKonumu) {
  const ilceIl = ilce && il ? `${ilce}, ${il}` : il ?? ilce ?? null;
  const alanlar: Array<Record<string, string>> = [];
  if (semt) alanlar.push({ "@type": "Place", name: ilceIl ? `${semt}, ${ilceIl}` : semt });
  if (ilceIl) alanlar.push({ "@type": "AdministrativeArea", name: ilceIl });
  if (!alanlar.length) return null;
  return alanlar.length === 1 ? alanlar[0] : alanlar;
}

function konumAdi({ il, ilce, semt }: DukkanKonumu): string | null {
  const parcalar = [semt, ilce, il].filter(Boolean);
  return parcalar.length ? parcalar.join(", ") : null;
}

function absoluteStorePath(slug: string, path = ""): string {
  const normalizedPath = path.startsWith("/") ? path : path ? `/${path}` : "";
  return `${getPublicSiteUrl()}/${slug}${normalizedPath}`;
}

/**
 * Telefon numarasını uluslararası biçime çevirir: "05539559111" / "905539559111" → "+905539559111".
 * Tanınmayan biçimler olduğu gibi döner.
 */
export function formatSchemaTelefon(value: string | null | undefined): string | null {
  const ham = value?.trim();
  if (!ham) return null;
  const rakam = ham.replace(/\D/g, "");
  if (ham.startsWith("+") && rakam.length >= 10) return `+${rakam}`;
  if (rakam.length === 12 && rakam.startsWith("90")) return `+${rakam}`;
  if (rakam.length === 11 && rakam.startsWith("0")) return `+9${rakam}`;
  if (rakam.length === 10 && rakam.startsWith("5")) return `+90${rakam}`;
  return ham;
}

export function buildLocalBusinessJsonLd(dukkan: Dukkan) {
  const pageUrl = absoluteStorePath(dukkan.slug);
  const konum = cozKonum(dukkan);
  const { il, ilce } = konum;

  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    // MobilePhoneStore, LocalBusiness'ın alt türü: Google mağazanın "telefoncu" olduğunu anlar
    "@type": "MobilePhoneStore",
    "@id": `${pageUrl}#localbusiness`,
    name: dukkan.dukkan_adi,
    url: pageUrl,
  };

  if (dukkan.aciklama) schema.description = dukkan.aciklama;
  const telefon = formatSchemaTelefon(dukkan.telefon ?? dukkan.whatsapp);
  if (telefon) schema.telephone = telefon;
  if (dukkan.logo_url) schema.logo = dukkan.logo_url;

  // Google İşletme profili linki aynı işletme olduğunu gösterir (harita sıralaması için önemli)
  const sameAs = [
    dukkan.google_business_url,
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
    schema.hasMap =
      dukkan.google_business_url?.trim() ||
      `https://www.google.com/maps/search/?api=1&query=${dukkan.enlem},${dukkan.boylam}`;
  }

  const areaServed = buildAreaServed(konum);
  if (areaServed) schema.areaServed = areaServed;

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
  shopAdres?: string | null;
  /** Dükkan ayarlarındaki semt (Esenkent, Bahçeşehir…) */
  shopSemt?: string | null;
}) {
  const url = absoluteStorePath(input.shopSlug, `/blog/${input.post.slug}`);
  const konum = cozKonum({ adres: input.shopAdres, semt: input.shopSemt });
  const areaName = konumAdi(konum);

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
    ...(input.post.icerik
      ? { articleBody: stripBlogHtml(input.post.icerik) }
      : {}),
    ...(areaName
      ? { contentLocation: { "@type": "Place", name: areaName } }
      : {}),
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
  > &
    Partial<Pick<SecondHandDevicePublic, "listing_type" | "capacity" | "color" | "device_category">>;
  shopName: string;
  shopSlug: string;
  shopAdres?: string | null;
  /** Dükkan ayarlarındaki semt (Esenkent, Bahçeşehir…) */
  shopSemt?: string | null;
  devicePath: string;
}) {
  const name =
    input.device.web_title?.trim() ||
    `${input.device.brand} ${input.device.model}`.trim();
  const sifir = input.device.listing_type?.trim() === "new";
  const durumEtiketi = sifir ? "sıfır" : "ikinci el";
  const url = `${getPublicSiteUrl()}${input.devicePath.startsWith("/") ? input.devicePath : `/${input.devicePath}`}`;
  const konum = cozKonum({ adres: input.shopAdres, semt: input.shopSemt });
  const { il, ilce } = konum;
  const areaName = konumAdi(konum);
  const areaServed = buildAreaServed(konum);

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${url}#product`,
    name,
    description:
      input.device.web_description?.trim() ||
      `${input.shopName}${areaName ? ` (${areaName})` : ""} ${durumEtiketi} cihaz ilanı: ${name}`,
    url,
    ...(input.device.brand?.trim() ? { brand: { "@type": "Brand", name: input.device.brand.trim() } } : {}),
    ...(input.device.model?.trim() ? { model: input.device.model.trim() } : {}),
    ...(input.device.color?.trim() ? { color: input.device.color.trim() } : {}),
    ...(input.device.image_urls?.[0]
      ? { image: gorselAdresi(input.device.image_urls[0]) }
      : {}),
    offers: {
      "@type": "Offer",
      priceCurrency: "TRY",
      price: input.device.sale_price,
      availability: "https://schema.org/InStock",
      itemCondition: sifir ? "https://schema.org/NewCondition" : "https://schema.org/UsedCondition",
      ...(areaServed ? { areaServed } : {}),
      seller: {
        "@type": "LocalBusiness",
        "@id": `${absoluteStorePath(input.shopSlug)}#localbusiness`,
        name: input.shopName,
        url: absoluteStorePath(input.shopSlug),
        ...(input.shopAdres
          ? {
              address: {
                "@type": "PostalAddress",
                streetAddress: input.shopAdres,
                ...(ilce ? { addressLocality: ilce } : {}),
                ...(il ? { addressRegion: il } : {}),
                addressCountry: "TR",
              },
            }
          : {}),
      },
    },
  };
}

export function buildDukkanJsonLd(dukkan: Dukkan) {
  return [buildLocalBusinessJsonLd(dukkan)];
}

/** Kategori (klasör) sayfası: CollectionPage + içindeki öğelerin ItemList'i. */
export function buildCollectionPageJsonLd(input: {
  slug: string;
  path: string;
  name: string;
  description?: string | null;
  items: Array<{ name: string; path: string; image?: string | null }>;
}) {
  const url = absoluteStorePath(input.slug, input.path);

  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
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
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: input.items.length,
      itemListElement: input.items.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: item.name,
        url: `${getPublicSiteUrl()}${item.path.startsWith("/") ? item.path : `/${item.path}`}`,
        ...(item.image ? { image: item.image } : {}),
      })),
    },
  };
}

/**
 * Mağaza ürünü (dukkan_urunleri) için Product şeması. Fiyat anlaşılamıyorsa
 * Offer eklenmez; Google yanlış fiyat göstermesin.
 */
export function buildUrunProductJsonLd(input: {
  name: string;
  description?: string | null;
  images: string[];
  category?: string | null;
  price: number | null;
  stokAdedi: number | null;
  barkod?: string | null;
  shopName: string;
  shopSlug: string;
  shopAdres?: string | null;
  /** Dükkan ayarlarındaki semt (Esenkent, Bahçeşehir…) */
  shopSemt?: string | null;
  path: string;
}) {
  const url = `${getPublicSiteUrl()}${input.path.startsWith("/") ? input.path : `/${input.path}`}`;
  const barkod = input.barkod?.replace(/\s+/g, "") || null;
  // GTIN yalnızca 8/12/13/14 haneli sayısal barkodlarda; diğerleri SKU olarak gider.
  const gtin = barkod && /^(\d{8}|\d{12,14})$/.test(barkod) ? barkod : null;
  const konum = cozKonum({ adres: input.shopAdres, semt: input.shopSemt });
  const { il, ilce } = konum;
  const areaName = konumAdi(konum);
  const areaServed = buildAreaServed(konum);
  const description =
    input.description?.trim() ||
    `${input.shopName}${areaName ? ` (${areaName})` : ""} mağazasında ${input.name}. Fiyat ve stok bilgisi için iletişime geçin.`;

  const availability =
    input.stokAdedi === 0 ? "https://schema.org/OutOfStock" : "https://schema.org/InStock";

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${url}#product`,
    name: input.name,
    description,
    url,
    ...(input.images.length ? { image: input.images } : {}),
    ...(input.category ? { category: input.category } : {}),
    ...(barkod ? { sku: barkod } : {}),
    ...(gtin ? { gtin } : {}),
    ...(input.price != null
      ? {
          offers: {
            "@type": "Offer",
            url,
            priceCurrency: "TRY",
            price: input.price,
            availability,
            itemCondition: "https://schema.org/NewCondition",
            ...(areaServed ? { areaServed } : {}),
            seller: {
              "@type": "LocalBusiness",
              // Mağaza sayfasındaki LocalBusiness ile aynı varlık (konum, saat, harita)
              "@id": `${absoluteStorePath(input.shopSlug)}#localbusiness`,
              name: input.shopName,
              url: absoluteStorePath(input.shopSlug),
              ...(input.shopAdres
                ? {
                    address: {
                      "@type": "PostalAddress",
                      streetAddress: input.shopAdres,
                      ...(ilce ? { addressLocality: ilce } : {}),
                      ...(il ? { addressRegion: il } : {}),
                      addressCountry: "TR",
                    },
                  }
                : {}),
            },
          },
        }
      : {}),
  };
}
