import type { MetadataRoute } from "next";
import { buildSitemap } from "@/lib/seo/build-sitemap";
import { buildSitemapUrl } from "@/lib/seo/sitemap-url";

/** ISR: yeni mağaza en geç 10 dk içinde sitemap'e yansır (on-demand revalidate ile anında da olabilir) */
export const revalidate = 600;

function fallbackSitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return [
    {
      url: buildSitemapUrl(),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: buildSitemapUrl("/fiyatlandirma"),
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
