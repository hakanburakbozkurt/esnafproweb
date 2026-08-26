import DOMPurify from "isomorphic-dompurify";

const BLOG_ALLOWED_TAGS = [
  "p",
  "br",
  "strong",
  "b",
  "em",
  "i",
  "u",
  "h2",
  "h3",
  "ul",
  "ol",
  "li",
  "span",
  "a",
] as const;

const BLOG_ALLOWED_ATTR = ["style", "class", "href", "target", "rel"];

/** Sunucu tarafında blog HTML içeriğini güvenli şekilde temizler */
export function sanitizeBlogHtml(html: string): string {
  const trimmed = html.trim();
  if (!trimmed) return "";

  return DOMPurify.sanitize(trimmed, {
    ALLOWED_TAGS: [...BLOG_ALLOWED_TAGS],
    ALLOWED_ATTR: BLOG_ALLOWED_ATTR,
  }).trim();
}

/** HTML içeriğinden düz metin üretir (snippet / excerpt) */
export function stripBlogHtml(html: string | null | undefined): string {
  if (!html?.trim()) return "";

  return DOMPurify.sanitize(html, { ALLOWED_TAGS: [] })
    .replace(/\s+/g, " ")
    .trim();
}

export function blogExcerptFromHtml(
  html: string | null | undefined,
  max = 160
): string {
  const plain = stripBlogHtml(html);
  if (!plain) return "";
  if (plain.length <= max) return plain;
  return `${plain.slice(0, max).trim()}…`;
}

export function resolveBlogSeoTitle(
  metaTitle: string | null | undefined,
  baslik: string,
  shopName: string
): string {
  const custom = metaTitle?.trim();
  if (custom) return `${custom} | ${shopName} | EsnafPRO`;
  return `${baslik} | ${shopName} | EsnafPRO`;
}

export function resolveBlogSeoDescription(
  metaDescription: string | null | undefined,
  icerik: string | null | undefined,
  baslik: string
): string {
  const custom = metaDescription?.trim();
  if (custom) return custom;
  return blogExcerptFromHtml(icerik, 160) || baslik;
}
