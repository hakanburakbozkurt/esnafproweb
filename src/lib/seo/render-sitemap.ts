import { buildSitemap } from "@/lib/seo/build-sitemap";
import { buildSitemapUrl } from "@/lib/seo/sitemap-url";
import {
  buildSitemapXml,
  cleanSitemapResponseBody,
} from "@/lib/seo/sitemap-xml";

function fallbackSitemapXml(): string {
  const now = new Date();

  return buildSitemapXml([
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
  ]);
}

/** Yanıt gönderilmeden önce olası layout/RSC script kalıntılarını temizler */
export function finalizeSitemapXml(xml: string): string {
  return cleanSitemapResponseBody(xml);
}

/** Saf sitemap XML string — App Router / layout katmanından bağımsız */
export async function renderSitemapXml(): Promise<string> {
  try {
    const entries = await buildSitemap();
    return buildSitemapXml(entries);
  } catch (error) {
    console.error("[sitemap] generation failed:", error);
    return fallbackSitemapXml();
  }
}

export const SITEMAP_RESPONSE_HEADERS = {
  "Content-Type": "application/xml; charset=utf-8",
  "X-Content-Type-Options": "nosniff",
  "Cache-Control": "public, s-maxage=600, stale-while-revalidate=86400",
} as const;
