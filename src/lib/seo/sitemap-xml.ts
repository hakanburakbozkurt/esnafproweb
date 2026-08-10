import type { MetadataRoute } from "next";

const XML_DECLARATION = '<?xml version="1.0" encoding="UTF-8"?>';
const SITEMAP_NS = "http://www.sitemaps.org/schemas/sitemap/0.9";

const ALLOWED_CHANGE_FREQUENCIES = new Set([
  "always",
  "hourly",
  "daily",
  "weekly",
  "monthly",
  "yearly",
  "never",
]);

/** XML dışı etiket enjeksiyonunu engellemek için yasak desenler */
const FORBIDDEN_XML_PATTERNS = [/<\/?script\b/i, /<\/?html\b/i, /<\/?body\b/i];

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function formatLastMod(value: Date | string): string {
  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return formatLastMod(new Date());
  }

  // ISO 8601 — UTC: YYYY-MM-DDThh:mm:ss+00:00 (Supabase timestamptz ile uyumlu)
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  const hours = String(date.getUTCHours()).padStart(2, "0");
  const minutes = String(date.getUTCMinutes()).padStart(2, "0");
  const seconds = String(date.getUTCSeconds()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}+00:00`;
}

function sanitizeUrl(url: string): string {
  const trimmed = url.trim();

  if (!trimmed.startsWith("https://")) {
    throw new Error(`[sitemap-xml] Geçersiz URL protokolü: ${trimmed}`);
  }

  for (const pattern of FORBIDDEN_XML_PATTERNS) {
    if (pattern.test(trimmed)) {
      throw new Error("[sitemap-xml] URL içinde yasak HTML/XML deseni bulundu.");
    }
  }

  return trimmed;
}

function assertPureSitemapXml(xml: string): string {
  if (!xml.startsWith(XML_DECLARATION)) {
    throw new Error("[sitemap-xml] XML çıktısı geçerli bildirim ile başlamıyor.");
  }

  for (const pattern of FORBIDDEN_XML_PATTERNS) {
    if (pattern.test(xml)) {
      throw new Error("[sitemap-xml] Çıktıda yasak etiket tespit edildi.");
    }
  }

  return xml;
}

function buildUrlNode(entry: MetadataRoute.Sitemap[number]): string {
  const lastModified = entry.lastModified ?? new Date();
  const parts = [
    `<loc>${escapeXml(sanitizeUrl(entry.url))}</loc>`,
    `<lastmod>${escapeXml(formatLastMod(lastModified))}</lastmod>`,
  ];

  if (
    entry.changeFrequency &&
    ALLOWED_CHANGE_FREQUENCIES.has(entry.changeFrequency)
  ) {
    parts.push(`<changefreq>${entry.changeFrequency}</changefreq>`);
  }

  if (entry.priority !== undefined) {
    const priority = Math.min(1, Math.max(0, entry.priority));
    parts.push(`<priority>${priority.toFixed(1)}</priority>`);
  }

  return `<url>${parts.join("")}</url>`;
}

/** Yalnızca sitemap.org protokolüne uygun, saf XML string üretir. */
export function buildSitemapXml(entries: MetadataRoute.Sitemap): string {
  const body = entries.map(buildUrlNode).join("");

  const xml = [
    XML_DECLARATION,
    `<urlset xmlns="${SITEMAP_NS}">`,
    body,
    "</urlset>",
    "",
  ].join("\n");

  return assertPureSitemapXml(xml);
}
