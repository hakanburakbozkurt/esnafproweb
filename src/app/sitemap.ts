import type { MetadataRoute } from "next";
import { getPublicSiteUrl } from "@/lib/auth/site-url";
import { buildSitemap } from "@/lib/seo/build-sitemap";

export const revalidate = 3600;
export const dynamic = "force-dynamic";

function fallbackSitemap(): MetadataRoute.Sitemap {
  const baseUrl = getPublicSiteUrl();
  const now = new Date();

  return [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${baseUrl}/fiyatlandirma`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    return await buildSitemap();
  } catch (error) {
    console.error("[sitemap] generation failed:", error);
    return fallbackSitemap();
  }
}
