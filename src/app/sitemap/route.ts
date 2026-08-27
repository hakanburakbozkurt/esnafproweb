import {
  finalizeSitemapXml,
  renderSitemapXml,
  SITEMAP_RESPONSE_HEADERS,
} from "@/lib/seo/render-sitemap";

/** Ham XML — root layout / RSC script enjeksiyonundan kaçınmak için /sitemap handler + rewrite kullanılır */
export const revalidate = 600;

export async function GET() {
  const rawXml = await renderSitemapXml();
  const cleanXmlString = finalizeSitemapXml(rawXml);

  return new Response(cleanXmlString, {
    headers: SITEMAP_RESPONSE_HEADERS,
  });
}
