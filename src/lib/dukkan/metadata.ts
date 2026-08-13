import type { Metadata } from "next";
import { parseLocationFromAdres } from "@/lib/dukkan/faq-placeholders";
import { buildPageMetadata } from "@/lib/seo/page-metadata";

/** Vitrin sayfaları için SEO metadata — meta_* boşsa dükkan adı/açıklamasına düşer */
export type DukkanMetadataSource = {
  dukkan_adi: string;
  aciklama?: string | null;
  meta_title?: string | null;
  meta_description?: string | null;
};

export type DukkanSeoSource = DukkanMetadataSource & {
  slug: string;
  adres?: string | null;
  banner_url?: string | null;
  logo_url?: string | null;
};

export const NOT_FOUND_STORE_METADATA: Metadata = {
  title: "Mağaza Bulunamadı | EsnafPRO",
};

export function buildLocalAreaLabel(adres?: string | null): string | null {
  const { il, ilce } = parseLocationFromAdres(adres);
  if (ilce && il) return `${ilce}, ${il}`;
  return il ?? ilce;
}

/** Yerel arama sinyali için açıklamaya il/ilçe ekler (zaten varsa tekrarlamaz) */
export function withLocalAreaSuffix(
  text: string,
  adres?: string | null
): string {
  const area = buildLocalAreaLabel(adres);
  if (!area) return text;

  const normalized = text.toLocaleLowerCase("tr-TR");
  const areaLower = area.toLocaleLowerCase("tr-TR");

  if (normalized.includes(areaLower)) return text;
  return `${text} — ${area}`;
}

export function buildDukkanPageMetadata(dukkan: DukkanMetadataSource): {
  title: string;
  description: string;
} {
  const title =
    dukkan.meta_title?.trim() || `${dukkan.dukkan_adi} | EsnafPRO`;

  const description =
    dukkan.meta_description?.trim() ||
    dukkan.aciklama?.trim() ||
    `${dukkan.dukkan_adi} dijital vitrin sayfası`;

  return { title, description };
}

export function buildStoreHomeSeoMetadata(dukkan: DukkanSeoSource): Metadata {
  const { title, description } = buildDukkanPageMetadata(dukkan);

  return buildPageMetadata({
    title,
    description: withLocalAreaSuffix(description, dukkan.adres),
    path: `/${dukkan.slug}`,
    image: dukkan.banner_url ?? dukkan.logo_url,
  });
}

export function buildStoreSubpageSeoMetadata(
  dukkan: DukkanSeoSource,
  segment: string,
  pageLabel: string,
  description: string,
  options?: { image?: string | null; ogType?: "website" | "article" }
): Metadata {
  return buildPageMetadata({
    title: `${pageLabel} | ${dukkan.dukkan_adi} | EsnafPRO`,
    description: withLocalAreaSuffix(description, dukkan.adres),
    path: `/${dukkan.slug}/${segment}`,
    image: options?.image ?? dukkan.banner_url ?? dukkan.logo_url,
    ogType: options?.ogType,
  });
}
