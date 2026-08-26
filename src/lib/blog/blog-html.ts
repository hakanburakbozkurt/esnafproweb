import sanitizeHtml from "sanitize-html";

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

const BLOG_SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [...BLOG_ALLOWED_TAGS],
  allowedAttributes: {
    a: ["href", "target", "rel"],
    span: ["style"],
    p: ["style"],
    h2: ["style"],
    h3: ["style"],
    li: ["style"],
    div: ["style"],
  },
  allowedStyles: {
    "*": {
      color: [
        /^#(?:[0-9a-f]{3,8})$/i,
        /^rgb\(/i,
        /^rgba\(/i,
      ],
      "text-align": [/^left$/i, /^right$/i, /^center$/i, /^justify$/i],
    },
  },
  allowedSchemes: ["http", "https", "mailto", "tel"],
  transformTags: {
    a: sanitizeHtml.simpleTransform("a", {
      rel: "noopener noreferrer",
    }),
  },
};

/** Sunucu/SSR uyumlu blog HTML sanitization — jsdom gerektirmez */
export function sanitizeBlogHtml(html: string): string {
  const trimmed = html.trim();
  if (!trimmed) return "";

  return sanitizeHtml(trimmed, BLOG_SANITIZE_OPTIONS).trim();
}

/** HTML içeriğinden düz metin üretir (snippet / excerpt) */
export function stripBlogHtml(html: string | null | undefined): string {
  if (!html?.trim()) return "";

  return sanitizeHtml(html, { allowedTags: [], allowedAttributes: {} })
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
