import type { Metadata } from "next";
import { getPublicSiteUrl } from "@/lib/auth/site-url";

export type PageMetadataInput = {
  title: string;
  description: string;
  path: string;
  image?: string | null;
  ogType?: "website" | "article";
};

export function buildAbsoluteUrl(path: string): string {
  const base = getPublicSiteUrl();
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalizedPath}`;
}

/** Next.js Metadata: title, description, canonical, Open Graph ve Twitter kartları */
export function buildPageMetadata(input: PageMetadataInput): Metadata {
  const url = buildAbsoluteUrl(input.path);
  const image = input.image?.trim() || undefined;

  return {
    title: input.title,
    description: input.description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: input.title,
      description: input.description,
      url,
      siteName: "EsnafPRO",
      locale: "tr_TR",
      type: input.ogType ?? "website",
      ...(image ? { images: [{ url: image, alt: input.title }] } : {}),
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title: input.title,
      description: input.description,
      ...(image ? { images: [image] } : {}),
    },
  };
}
