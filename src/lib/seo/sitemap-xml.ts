import type { MetadataRoute } from "next";

export const XML_DECLARATION = '<?xml version="1.0" encoding="UTF-8"?>';
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

/** HTML/JS enjeksiyonu — self-closing, boş ve çift etiket dahil */
const SCRIPT_TAG_PATTERN =
  /<\s*script\b[^>]*\/?\s*>|<\s*script\b[^>]*>[\s\S]*?<\s*\/\s*script\s*>/gi;

const FORBIDDEN_MARKUP_PATTERNS = [
  SCRIPT_TAG_PATTERN,
  /<\s*noscript\b[^>]*\/?\s*>|<\s*noscript\b[^>]*>[\s\S]*?<\s*\/\s*noscript\s*>/gi,
  /<\/?html\b[^>]*>/gi,
  /<\/?body\b[^>]*>/gi,
  /<\/?head\b[^>]*>/gi,
  /<\s*meta\b[^>]*\/?\s*>/gi,
  /<\s*link\b[^>]*\/?\s*>/gi,
  /<\s*iframe\b[^>]*\/?\s*>|<\s*iframe\b[^>]*>[\s\S]*?<\s*\/\s*iframe\s*>/gi,
];

const FORBIDDEN_CONTENT_CHECKS = [
  /<\s*script\b/i,
  /<\/?html\b/i,
  /<\/?body\b/i,
  /<\/?head\b/i,
];

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

  for (const pattern of FORBIDDEN_CONTENT_CHECKS) {
    if (pattern.test(trimmed)) {
      throw new Error("[sitemap-xml] URL içinde yasak HTML/XML deseni bulundu.");
    }
  }

  return trimmed;
}

/** Olası script/html kalıntılarını temizler — kararlı sonuç için tekrarlı uygular */
export function stripForbiddenMarkup(xml: string): string {
  let cleaned = xml;
  let previous = "";

  while (previous !== cleaned) {
    previous = cleaned;

    for (const pattern of FORBIDDEN_MARKUP_PATTERNS) {
      cleaned = cleaned.replace(pattern, "");
    }
  }

  return cleaned.trim();
}

const URLSET_OPEN_TAG = "<urlset";
const URLSET_CLOSE_TAG = "</urlset";

function indexOfIgnoreCase(source: string, needle: string, fromIndex = 0): number {
  return source.toLowerCase().indexOf(needle.toLowerCase(), fromIndex);
}

/** </urlset> veya </urlset ...> kapanışının bitiş indeksini döner */
function findUrlsetCloseEnd(source: string, urlsetStart: number): number {
  const closeStart = indexOfIgnoreCase(source, URLSET_CLOSE_TAG, urlsetStart);

  if (closeStart === -1) {
    return -1;
  }

  const closeEnd = source.indexOf(">", closeStart);

  if (closeEnd === -1) {
    return -1;
  }

  return closeEnd + 1;
}

/**
 * Handler yanıtı için keskin substring temizliği.
 * <urlset öncesindeki tüm HTML/script kalıntılarını mutlak surette atar.
 */
export function cleanSitemapResponseBody(xml: string): string {
  const source = xml.replace(/^\uFEFF/, "");
  const urlsetStart = indexOfIgnoreCase(source, URLSET_OPEN_TAG);

  if (urlsetStart === -1) {
    throw new Error("[sitemap-xml] urlset başlangıcı bulunamadı.");
  }

  const urlsetEnd = findUrlsetCloseEnd(source, urlsetStart);

  if (urlsetEnd === -1) {
    throw new Error("[sitemap-xml] urlset kapanış etiketi bulunamadı.");
  }

  const urlsetBlock = source.slice(urlsetStart, urlsetEnd).trim();

  if (!urlsetBlock.toLowerCase().startsWith(URLSET_OPEN_TAG)) {
    throw new Error("[sitemap-xml] urlset bloğu geçersiz.");
  }

  if (indexOfIgnoreCase(urlsetBlock, "<script") !== -1) {
    throw new Error("[sitemap-xml] urlset bloğu script etiketi içeriyor.");
  }

  const document = `${urlsetBlock}\n`;
  return document;
}

/** Çıktının her zaman XML bildirimi ile başlamasını garanti eder */
export function ensureXmlDeclaration(xml: string): string {
  const cleaned = stripForbiddenMarkup(xml).replace(/^\uFEFF/, "");
  const body = cleaned.replace(/^\s*<\?xml[^?]*\?>\s*/i, "").trimStart();

  return body ? `${XML_DECLARATION}\n${body}` : `${XML_DECLARATION}\n`;
}

function assertPureSitemapXml(xml: string): string {
  const normalized = ensureXmlDeclaration(xml);

  if (!normalized.startsWith(XML_DECLARATION)) {
    throw new Error("[sitemap-xml] XML çıktısı geçerli bildirim ile başlamıyor.");
  }

  for (const pattern of FORBIDDEN_CONTENT_CHECKS) {
    if (pattern.test(normalized)) {
      throw new Error("[sitemap-xml] Çıktıda yasak etiket tespit edildi.");
    }
  }

  if (!normalized.includes("<urlset")) {
    throw new Error("[sitemap-xml] Geçersiz sitemap yapısı.");
  }

  return normalized.endsWith("\n") ? normalized : `${normalized}\n`;
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
  ].join("\n");

  return assertPureSitemapXml(xml);
}
