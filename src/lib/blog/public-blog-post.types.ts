import type { DukkanBlogYazisi } from "@/types/database.types";
import { stripBlogHtml } from "@/lib/blog/blog-html";

export type PublicBlogPost = DukkanBlogYazisi & {
  shop_slug: string;
  shop_name: string;
};

export const LANDING_BLOG_POST_LIMIT = 3;
export const BLOG_INDEX_LIMIT = 24;

export function blogExcerpt(text: string | null, max = 140): string {
  const trimmed = text?.trim() ?? "";
  if (!trimmed) return "";

  const plain = trimmed.includes("<")
    ? stripBlogHtml(trimmed)
    : trimmed.replace(/\s+/g, " ");

  if (plain.length <= max) return plain;
  return `${plain.slice(0, max).trim()}…`;
}

export function formatBlogDate(value: string): string {
  return new Intl.DateTimeFormat("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}
