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
  "div",
] as const;

const BLOCK_TAGS_IN_MARKS = "h2|h3|p|ul|ol|li|div";

/** strong/b etiketlerinin blok seviyesinde sarmalamasını kaldırır — kalın stil sızmasını önler */
export function repairBlogHtmlInlineMarks(html: string): string {
  let result = html;
  let previous = "";

  const wrapPattern = new RegExp(
    `<(?:strong|b)(?:\\s[^>]*)?>\\s*((?:<(?:${BLOCK_TAGS_IN_MARKS})\\b[\\s\\S]*?</(?:${BLOCK_TAGS_IN_MARKS})>\\s*)+)</(?:strong|b)>`,
    "gi"
  );

  while (previous !== result) {
    previous = result;
    result = result.replace(wrapPattern, "$1");
  }

  return result;
}

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
        /^rgb\s*\(/i,
        /^rgba\s*\(/i,
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

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function looksLikeHtml(content: string): boolean {
  return /<\/?[a-z][\s\S]*?>/i.test(content);
}

/** Eski düz metin blog yazılarını paragraflara çevirir */
export function plainTextToBlogHtml(text: string): string {
  const blocks = text
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);

  if (blocks.length === 0) {
    const single = text.trim();
    return single ? `<p>${escapeHtml(single)}</p>` : "";
  }

  return blocks
    .map((block) => {
      const withBreaks = escapeHtml(block).replace(/\n/g, "<br />");
      return `<p>${withBreaks}</p>`;
    })
    .join("");
}

/** Sunucu/SSR uyumlu blog HTML sanitization — jsdom gerektirmez */
export function sanitizeBlogHtml(html: string): string {
  const trimmed = html.trim();
  if (!trimmed) return "";

  const repaired = repairBlogHtmlInlineMarks(trimmed);
  return sanitizeHtml(repaired, BLOG_SANITIZE_OPTIONS).trim();
}

/**
 * Detay sayfası için: düz metin legacy içerik + TipTap HTML birlikte güvenli render.
 * Sanitize sonrası boş kalırsa düz metin fallback uygulanır.
 */
export function prepareBlogHtmlForDisplay(html: string): string {
  const trimmed = html.trim();
  if (!trimmed) return "";

  const normalized = looksLikeHtml(trimmed) ? trimmed : plainTextToBlogHtml(trimmed);
  const sanitized = sanitizeBlogHtml(normalized);

  if (sanitized) return sanitized;

  if (!looksLikeHtml(trimmed)) {
    return sanitizeBlogHtml(plainTextToBlogHtml(trimmed));
  }

  return sanitized;
}

/** HTML içeriğinden düz metin üretir (snippet / excerpt) */
export function stripBlogHtml(html: string | null | undefined): string {
  if (!html?.trim()) return "";

  const source = looksLikeHtml(html) ? html : plainTextToBlogHtml(html);

  return sanitizeHtml(source, { allowedTags: [], allowedAttributes: {} })
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
