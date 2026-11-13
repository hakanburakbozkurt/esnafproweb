import type { Metadata } from "next";
import { getPublicSiteUrl } from "@/lib/auth/site-url";

export type PageMetadataInput = {
  title: string;
  description: string;
  path: string;
  image?: string | null;
  ogType?: "website" | "article";
};

/** Kendi görseli olmayan sayfaların paylaşım görseli (src/app/api/og/route.tsx) */
export const DEFAULT_OG_IMAGE_PATH = "/api/og";
export const DEFAULT_OG_IMAGE_SIZE = { width: 1200, height: 630 } as const;
export const DEFAULT_OG_IMAGE_ALT =
  "EsnafPRO: telefoncular ve teknik servisler için ücretsiz dijital mağaza";

export function buildAbsoluteUrl(path: string): string {
  const base = getPublicSiteUrl();
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalizedPath}`;
}

/** Next.js Metadata: title, description, canonical, Open Graph ve Twitter kartları */
export function buildPageMetadata(input: PageMetadataInput): Metadata {
  const url = buildAbsoluteUrl(input.path);
  const ownImage = input.image?.trim() || undefined;
  // Görseli olmayan sayfa da WhatsApp/Instagram/X'te büyük önizlemeyle paylaşılır.
  const ogImage = ownImage
    ? { url: ownImage, alt: input.title }
    : { url: buildAbsoluteUrl(DEFAULT_OG_IMAGE_PATH), alt: DEFAULT_OG_IMAGE_ALT, ...DEFAULT_OG_IMAGE_SIZE };

  return {
    title: input.title,
    description: input.description,
    alternates: {
      canonical: url,
      languages: {
        "tr-TR": url,
      },
    },
    openGraph: {
      title: input.title,
      description: input.description,
      url,
      siteName: "EsnafPRO",
      locale: "tr_TR",
      type: input.ogType ?? "website",
      images: [ogImage],
    },
    twitter: {
      card: "summary_large_image",
      title: input.title,
      description: input.description,
      images: [ogImage.url],
    },
    other: {
      "content-language": "tr",
    },
  };
}
