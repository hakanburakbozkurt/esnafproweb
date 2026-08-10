/** Sitemap ve robots.txt için kanonik üretim kökeni */
export const SITEMAP_CANONICAL_ORIGIN = "https://www.esnafpro.app";

/** Sitemap <loc> adreslerini her zaman HTTPS + www ile üretir */
export function buildSitemapUrl(path = ""): string {
  if (!path) {
    return SITEMAP_CANONICAL_ORIGIN;
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${SITEMAP_CANONICAL_ORIGIN}${normalizedPath}`;
}

/** Olası http:// veya eksik protokol değerlerini HTTPS www kökenine çevirir */
export function normalizeSitemapUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return SITEMAP_CANONICAL_ORIGIN;

  const withoutProtocol = trimmed
    .replace(/^https?:\/\//i, "")
    .replace(/^www\./i, "")
    .replace(/\/$/, "");

  const path = withoutProtocol.replace(/^esnafpro\.app/i, "");
  return buildSitemapUrl(path || "");
}
