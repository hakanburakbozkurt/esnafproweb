import type { Metadata } from "next";
import { parseLocationFromAdres } from "@/lib/dukkan/faq-placeholders";
import {
  isShopSeoIndexable,
  type ShopApprovalStatus,
} from "@/lib/dukkan/approval-status";
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
  approval_status?: ShopApprovalStatus | null;
};

function applyStoreSeoRobots(
  metadata: Metadata,
  approvalStatus?: ShopApprovalStatus | null
): Metadata {
  if (isShopSeoIndexable(approvalStatus)) {
    return {
      ...metadata,
      robots: { index: true, follow: true },
    };
  }

  return {
    ...metadata,
    robots: { index: false, follow: false },
  };
}

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

  return applyStoreSeoRobots(
    buildPageMetadata({
      title,
      description: withLocalAreaSuffix(description, dukkan.adres),
      path: `/${dukkan.slug}`,
      image: dukkan.banner_url ?? dukkan.logo_url,
    }),
    dukkan.approval_status
  );
}

export function buildStoreSubpageSeoMetadata(
  dukkan: DukkanSeoSource,
  segment: string,
  pageLabel: string,
  description: string,
  options?: { image?: string | null; ogType?: "website" | "article" }
): Metadata {
  return applyStoreSeoRobots(
    buildPageMetadata({
      title: `${pageLabel} | ${dukkan.dukkan_adi} | EsnafPRO`,
      description: withLocalAreaSuffix(description, dukkan.adres),
      path: `/${dukkan.slug}/${segment}`,
      image: options?.image ?? dukkan.banner_url ?? dukkan.logo_url,
      ogType: options?.ogType,
    }),
    dukkan.approval_status
  );
}
