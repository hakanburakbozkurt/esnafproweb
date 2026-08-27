import {
  finalizeSitemapXml,
  renderSitemapXml,
  SITEMAP_RESPONSE_HEADERS,
} from "@/lib/seo/render-sitemap";

/**
 * Statik önbellek / RSC kabuğu devre dışı — Next.js layout veya <script/> enjekte edemesin.
 * URL listesi üretimi (buildSitemap) bu ayardan etkilenmez.
 */
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const URLSET_PREFIX = "<urlset";

/** İlk karakter mutlak surette `<urlset` olana kadar ön ekleri keser */
function toPureUrlsetResponseBody(body: string): string {
  const withoutBom = body.replace(/^\uFEFF/, "");
  const urlsetStart = withoutBom.toLowerCase().indexOf(URLSET_PREFIX);

  if (urlsetStart === -1) {
    throw new Error("[sitemap] Yanıtta urlset kök öğesi bulunamadı.");
  }

  const urlsetOnly = withoutBom.slice(urlsetStart).trimStart();

  if (!urlsetOnly.startsWith(URLSET_PREFIX)) {
    throw new Error("[sitemap] Yanıt <urlset ile başlamıyor.");
  }

  if (urlsetOnly.toLowerCase().includes("<script")) {
    throw new Error("[sitemap] Yanıt script etiketi içeriyor.");
  }

  return urlsetOnly.endsWith("\n") ? urlsetOnly : `${urlsetOnly}\n`;
}

export async function GET() {
  const rawXml = await renderSitemapXml();
  const cleanXmlString = toPureUrlsetResponseBody(finalizeSitemapXml(rawXml));

  if (cleanXmlString.charAt(0) !== "<") {
    throw new Error("[sitemap] Yanıtın ilk karakteri `<` değil.");
  }

  return new Response(cleanXmlString, {
    status: 200,
    headers: SITEMAP_RESPONSE_HEADERS,
  });
}
