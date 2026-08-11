import { buildSitemap } from "@/lib/seo/build-sitemap";
import { buildSitemapUrl } from "@/lib/seo/sitemap-url";
import { buildSitemapXml } from "@/lib/seo/sitemap-xml";

/**
 * Saf XML — Metadata Route (app/sitemap.ts) veya rewrite + Pages API yerine
 * doğrudan ham string döndürür; layout / RSC script enjekte etmez.
 */
export const revalidate = 600;

const SITEMAP_HEADERS = {
  "Content-Type": "application/xml; charset=utf-8",
  "X-Content-Type-Options": "nosniff",
  "Cache-Control": "public, s-maxage=600, stale-while-revalidate=86400",
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

export async function GET() {
  try {
    const entries = await buildSitemap();
    const xml = buildSitemapXml(entries);

    return new Response(xml, { headers: SITEMAP_HEADERS });
  } catch (error) {
    console.error("[sitemap] generation failed:", error);

    return new Response(fallbackSitemapXml(), {
      headers: {
        ...SITEMAP_HEADERS,
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    });
  }
}
