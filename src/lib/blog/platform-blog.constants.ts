/** Platform blog (EsnafPRO editoryal blog) sabitleri — istemci/sunucu ortak */

import { stripBlogHtml } from "@/lib/blog/blog-html";

export const PLATFORM_BLOG_CATEGORIES = [
  { value: "rehber", label: "Rehber" },
  { value: "tamir", label: "Teknik Servis & Tamir" },
  { value: "ikinci-el", label: "2. El Cihaz" },
  { value: "dukkan-yonetimi", label: "Dükkan Yönetimi" },
  { value: "pazaryeri", label: "Pazaryeri" },
  { value: "yerel-seo", label: "Yerel SEO" },
  { value: "duyuru", label: "Duyuru" },
] as const;

export type PlatformBlogCategory =
  (typeof PLATFORM_BLOG_CATEGORIES)[number]["value"];

export const PLATFORM_BLOG_CATEGORY_VALUES = PLATFORM_BLOG_CATEGORIES.map(
  (category) => category.value
) as readonly string[];

export const PLATFORM_BLOG_DEFAULT_CATEGORY: PlatformBlogCategory = "rehber";

export const PLATFORM_BLOG_INDEX_LIMIT = 24;
export const PLATFORM_BLOG_LANDING_LIMIT = 3;

/** Yayınlanabilir yazı için minimum içerik uzunluğu (düz metin) */
export const PLATFORM_BLOG_MIN_PUBLISH_LENGTH = 600;

export const PLATFORM_BLOG_PUBLISH_INFO =
  "Yazıyı dilediğin zaman taslak olarak kaydedebilirsin. Yayına almak için en az 600 karakter içerik, bir özet ve kapak görseli gerekir — Google'da sıralanmak için bu alt sınır önemli.";

export function platformBlogCategoryLabel(value: string | null | undefined): string {
  const match = PLATFORM_BLOG_CATEGORIES.find(
    (category) => category.value === value
  );
  return match?.label ?? "Rehber";
}

export function isPlatformBlogCategory(
  value: string | null | undefined
): value is PlatformBlogCategory {
  if (!value) return false;
  return PLATFORM_BLOG_CATEGORY_VALUES.includes(value);
}

/** Ortalama 200 kelime/dk okuma hızına göre tahmini süre */
export function platformBlogReadingMinutes(plainText: string): number {
  const words = plainText.trim().split(/\s+/).filter(Boolean).length;
  if (!words) return 1;
  return Math.max(1, Math.round(words / 200));
}

export type PlatformBlogPublishFields = {
  ozet?: string | null;
  icerik?: string | null;
  kapak_url?: string | null;
};

/** Yayın için minimum kalite kriterleri — form ve server action ortak kullanır */
export function validatePlatformBlogPublish(
  post: PlatformBlogPublishFields
): { ok: true } | { ok: false; error: string } {
  if (!post.kapak_url?.trim()) {
    return { ok: false, error: "Yayınlamak için kapak görseli gerekir." };
  }

  if (!post.ozet?.trim()) {
    return {
      ok: false,
      error: "Yayınlamak için kısa özet (liste kartı metni) gerekir.",
    };
  }

  const length = stripBlogHtml(post.icerik).length;
  if (length < PLATFORM_BLOG_MIN_PUBLISH_LENGTH) {
    return {
      ok: false,
      error: `Yayınlamak için içerik en az ${PLATFORM_BLOG_MIN_PUBLISH_LENGTH} karakter olmalı (şu an ${length}).`,
    };
  }

  return { ok: true };
}
