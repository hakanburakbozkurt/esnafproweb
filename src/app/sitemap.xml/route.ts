import {
  renderSitemapXml,
  SITEMAP_RESPONSE_HEADERS,
} from "@/lib/seo/render-sitemap";

/** Ham XML — layout/RSC katmanı devreye girmez */
export const revalidate = 600;

export async function GET() {
  const xml = await renderSitemapXml();

  return new Response(xml, { headers: SITEMAP_RESPONSE_HEADERS });
}
