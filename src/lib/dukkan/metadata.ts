import type { Metadata } from "next";
import { kisaKonumEtiketi, konumEtiketi, metinKonumIceriyor, type KonumGirdisi } from "@/lib/dukkan/konum";
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
  /** Bölge adı (Esenkent, Bahçeşehir…); sütun yoksa undefined gelir */
  semt?: string | null;
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

/**
 * "Esenkent, Esenyurt, İstanbul". Düz adres ya da { adres, semt } alır;
 * semt (dükkan ayarlarından ya da adresten) varsa başa eklenir.
 */
export function buildLocalAreaLabel(konum?: KonumGirdisi): string | null {
  return konumEtiketi(konum);
}

/**
 * Yerel arama sinyali için metne semt/ilçe/il ekler. Metin semti veya ilçeyi
 * zaten içeriyorsa ("… Esenkent'te …") dokunmaz; esnafın yazdığı başlık bozulmaz.
 */
export function withLocalAreaSuffix(
  text: string,
  konum?: KonumGirdisi,
  options?: { kisa?: boolean }
): string {
  // Başlıklarda kısa etiket ("Esenkent, Esenyurt"), açıklamalarda tam etiket
  const area = options?.kisa ? kisaKonumEtiketi(konum) : buildLocalAreaLabel(konum);
  if (!area) return text;
  if (metinKonumIceriyor(text, konum)) return text;
  return `${text} — ${area}`;
}

/** meta_description ve aciklama boşsa yerel + sektör sinyalli varsayılan metin */
export function buildDefaultStoreDescription(
  dukkan: Pick<DukkanMetadataSource, "dukkan_adi"> & { adres?: string | null; semt?: string | null }
): string {
  const name = dukkan.dukkan_adi.trim();
  const area = buildLocalAreaLabel(dukkan);

  if (area) {
    return `${name}, ${area} bölgesinde telefon ve teknik servis sektöründe faaliyet gösteren işletmenin dijital vitrin sayfası. Ürünler, iletişim bilgileri ve hizmet detaylarına buradan ulaşabilirsiniz.`;
  }

  return `${name} telefon ve teknik servis işletmesinin EsnafPRO dijital vitrin sayfası. Ürünler, iletişim bilgileri ve hizmet detayları tek adreste.`;
}

export function buildDukkanPageMetadata(
  dukkan: DukkanMetadataSource & { adres?: string | null; semt?: string | null }
): {
  title: string;
  description: string;
} {
  // Esnaf kendi başlığını yazdıysa ona dokunulmaz; yazmadıysa konum + meslek eklenir:
  // "Redikom Mobile Store — Bahçeşehir, Başakşehir Telefoncu | EsnafPRO"
  const alan = kisaKonumEtiketi(dukkan);
  const title =
    dukkan.meta_title?.trim() ||
    (alan ? `${dukkan.dukkan_adi} — ${alan} Telefoncu | EsnafPRO` : `${dukkan.dukkan_adi} | EsnafPRO`);

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
      description: withLocalAreaSuffix(description, dukkan),
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
      description: withLocalAreaSuffix(description, dukkan),
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
    // Özel meta başlık yoksa yazı başlığına il/ilçe eklenir (ürün sayfalarıyla aynı kural)
    post.meta_title?.trim() ? post.baslik : withLocalAreaSuffix(post.baslik, dukkan, { kisa: true }),
    dukkan.dukkan_adi
  );
  const description = withLocalAreaSuffix(
    resolveBlogSeoDescription(
      post.meta_description,
      post.icerik,
      post.baslik
    ),
    dukkan
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
