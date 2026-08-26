import type { Metadata } from "next";
import { parseLocationFromAdres } from "@/lib/dukkan/faq-placeholders";
import {
  isShopSeoIndexable,
  type ShopApprovalStatus,
} from "@/lib/dukkan/approval-status";
import {
  resolveBlogSeoDescription,
  resolveBlogSeoTitle,
} from "@/lib/blog/blog-html";
import { buildPageMetadata } from "@/lib/seo/page-metadata";
import type { DukkanBlogYazisi } from "@/types/database.types";

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

/** meta_description ve aciklama boşsa yerel + sektör sinyalli varsayılan metin */
export function buildDefaultStoreDescription(
  dukkan: Pick<DukkanMetadataSource, "dukkan_adi"> & { adres?: string | null }
): string {
  const name = dukkan.dukkan_adi.trim();
  const area = buildLocalAreaLabel(dukkan.adres);

  if (area) {
    return `${name}, ${area} bölgesinde telefon ve teknik servis sektöründe faaliyet gösteren işletmenin dijital vitrin sayfası. Ürünler, iletişim bilgileri ve hizmet detaylarına buradan ulaşabilirsiniz.`;
  }

  return `${name} telefon ve teknik servis işletmesinin EsnafPRO dijital vitrin sayfası. Ürünler, iletişim bilgileri ve hizmet detayları tek adreste.`;
}

export function buildDukkanPageMetadata(
  dukkan: DukkanMetadataSource & { adres?: string | null }
): {
  title: string;
  description: string;
} {
  const title =
    dukkan.meta_title?.trim() || `${dukkan.dukkan_adi} | EsnafPRO`;

  const description =
    dukkan.meta_description?.trim() ||
    dukkan.aciklama?.trim() ||
    buildDefaultStoreDescription(dukkan);

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

export function buildBlogPostSeoMetadata(
  dukkan: DukkanSeoSource,
  post: Pick<
    DukkanBlogYazisi,
    "slug" | "baslik" | "meta_title" | "meta_description" | "icerik" | "kapak_url"
  >
): Metadata {
  const title = resolveBlogSeoTitle(
    post.meta_title,
    post.baslik,
    dukkan.dukkan_adi
  );
  const description = withLocalAreaSuffix(
    resolveBlogSeoDescription(
      post.meta_description,
      post.icerik,
      post.baslik
    ),
    dukkan.adres
  );

  return applyStoreSeoRobots(
    buildPageMetadata({
      title,
      description,
      path: `/${dukkan.slug}/blog/${post.slug}`,
      image: post.kapak_url ?? dukkan.banner_url ?? dukkan.logo_url,
      ogType: "article",
    }),
    dukkan.approval_status
  );
}
