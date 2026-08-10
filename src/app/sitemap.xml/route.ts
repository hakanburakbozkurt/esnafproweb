import { buildSitemap } from "@/lib/seo/build-sitemap";
import { buildSitemapUrl } from "@/lib/seo/sitemap-url";
import { buildSitemapXml } from "@/lib/seo/sitemap-xml";

/** ISR: en fazla 10 dk önbellek; süre dolunca bir sonraki istekte yenilenir */
export const revalidate = 600;

const SITEMAP_HEADERS = {
  "Content-Type": "application/xml; charset=utf-8",
  "X-Content-Type-Options": "nosniff",
} as const;

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

function sitemapResponse(xml: string, cacheControl: string): Response {
  return new Response(xml, {
    headers: {
      ...SITEMAP_HEADERS,
      "Cache-Control": cacheControl,
    },
  });
}

export async function GET() {
  try {
    const entries = await buildSitemap();
    const xml = buildSitemapXml(entries);

    return sitemapResponse(
      xml,
      "public, s-maxage=600, stale-while-revalidate=86400"
    );
  } catch (error) {
    console.error("[sitemap] generation failed:", error);

    return sitemapResponse(
      fallbackSitemapXml(),
      "public, s-maxage=60, stale-while-revalidate=300"
    );
  }
}
