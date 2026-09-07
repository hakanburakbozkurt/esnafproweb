import { stripBlogHtml } from "@/lib/blog/blog-html";

export const BLOG_MIN_PUBLISH_CONTENT_LENGTH = 200;

export const BLOG_PUBLISH_INFO_BANNER =
  "Yazınızı dilediğiniz zaman taslak olarak kaydedebilirsiniz. Vitrinde görünmesi ve SEO skoru getirmesi için yayınlamadan önce en az 200 karakter içerik ve kapak görseli eklemeniz gerekir.";

export type BlogPublishFields = {
  kapak_url?: string | null;
  icerik?: string | null;
};

export function getBlogContentPlainTextLength(
  icerik: string | null | undefined
): number {
  return stripBlogHtml(icerik).length;
}

export function hasBlogCoverImage(kapakUrl: string | null | undefined): boolean {
  return Boolean(kapakUrl?.trim());
}

/** Yayın + SEO skoru için minimum kalite kriterleri */
export function validateBlogPublishRequirements(
  post: BlogPublishFields
): { ok: true } | { ok: false; error: string } {
  if (!hasBlogCoverImage(post.kapak_url)) {
    return {
      ok: false,
      error: "Yayınlamak için kapak görseli eklemeniz gerekir.",
    };
  }

  const contentLength = getBlogContentPlainTextLength(post.icerik);
  if (contentLength < BLOG_MIN_PUBLISH_CONTENT_LENGTH) {
    return {
      ok: false,
      error: `Yayınlamak için içerik en az ${BLOG_MIN_PUBLISH_CONTENT_LENGTH} karakter olmalıdır (şu an ${contentLength} karakter).`,
    };
  }

  return { ok: true };
}

/** Vitrin + Profil & SEO skoruna dahil edilebilir yayınlanmış yazı */
export function isBlogPostScoreEligible(
  post: BlogPublishFields & { yayinda?: boolean | null }
): boolean {
  if (!post.yayinda) return false;
  return validateBlogPublishRequirements(post).ok;
}
