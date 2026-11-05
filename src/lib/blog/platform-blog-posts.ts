import { blogExcerptFromHtml, stripBlogHtml } from "@/lib/blog/blog-html";
import {
  PLATFORM_BLOG_INDEX_LIMIT,
  platformBlogReadingMinutes,
} from "@/lib/blog/platform-blog.constants";

export {
  validatePlatformBlogPublish,
  type PlatformBlogPublishFields,
} from "@/lib/blog/platform-blog.constants";
import { createClient } from "@/lib/supabase/server";
import type { PlatformBlogYazisi } from "@/types/database.types";

export type PlatformBlogListItem = PlatformBlogYazisi & {
  okuma_suresi: number;
  gorunen_ozet: string;
};

function decoratePost(post: PlatformBlogYazisi): PlatformBlogListItem {
  const plain = stripBlogHtml(post.icerik);

  return {
    ...post,
    okuma_suresi: platformBlogReadingMinutes(plain),
    gorunen_ozet:
      post.ozet?.trim() || blogExcerptFromHtml(post.icerik, 170) || post.baslik,
  };
}

export async function getPlatformBlogPosts(options?: {
  limit?: number;
  kategori?: string;
}): Promise<PlatformBlogListItem[]> {
  try {
    const supabase = await createClient();
    let query = supabase
      .from("platform_blog_yazilari")
      .select("*")
      .eq("yayinda", true)
      .order("yayin_tarihi", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false })
      .limit(options?.limit ?? PLATFORM_BLOG_INDEX_LIMIT);

    if (options?.kategori) {
      query = query.eq("kategori", options.kategori);
    }

    const { data, error } = await query;

    if (error || !data?.length) return [];

    return data.map(decoratePost);
  } catch {
    return [];
  }
}

export async function getPlatformBlogPostBySlug(
  slug: string
): Promise<PlatformBlogListItem | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("platform_blog_yazilari")
      .select("*")
      .eq("slug", slug)
      .eq("yayinda", true)
      .maybeSingle();

    if (error || !data) return null;

    return decoratePost(data);
  } catch {
    return null;
  }
}

/** Aynı kategoriden diğer yazılar — detay sayfası iç linkleme (SEO) */
export async function getRelatedPlatformBlogPosts(
  post: Pick<PlatformBlogYazisi, "id" | "kategori">,
  limit = 3
): Promise<PlatformBlogListItem[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("platform_blog_yazilari")
      .select("*")
      .eq("yayinda", true)
      .eq("kategori", post.kategori)
      .neq("id", post.id)
      .order("yayin_tarihi", { ascending: false, nullsFirst: false })
      .limit(limit);

    if (error || !data?.length) return [];

    return data.map(decoratePost);
  } catch {
    return [];
  }
}

/** Admin listesi — taslaklar dahil (RLS super admin politikasıyla korunur) */
export async function getAdminPlatformBlogPosts(): Promise<PlatformBlogYazisi[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("platform_blog_yazilari")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getAdminPlatformBlogPosts", error.message);
    return [];
  }

  return data ?? [];
}

export async function getAdminPlatformBlogPostById(
  postId: string
): Promise<PlatformBlogYazisi | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("platform_blog_yazilari")
    .select("*")
    .eq("id", postId)
    .maybeSingle();

  if (error) {
    console.error("getAdminPlatformBlogPostById", error.message);
    return null;
  }

  return data;
}

/** Sitemap için hafif sorgu */
export async function getPlatformBlogSitemapRows(): Promise<
  Pick<PlatformBlogYazisi, "slug" | "updated_at" | "yayin_tarihi" | "created_at">[]
> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("platform_blog_yazilari")
      .select("slug, updated_at, yayin_tarihi, created_at")
      .eq("yayinda", true);

    if (error || !data) return [];

    return data;
  } catch {
    return [];
  }
}
