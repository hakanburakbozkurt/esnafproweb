import {
  BLOG_INDEX_LIMIT,
  LANDING_BLOG_POST_LIMIT,
  type PublicBlogPost,
} from "@/lib/blog/public-blog-post.types";
import { createClient } from "@/lib/supabase/server";
import type { DukkanBlogYazisi } from "@/types/database.types";

export type { PublicBlogPost } from "@/lib/blog/public-blog-post.types";
export {
  blogExcerpt,
  formatBlogDate,
  LANDING_BLOG_POST_LIMIT,
  BLOG_INDEX_LIMIT,
} from "@/lib/blog/public-blog-post.types";

async function mapPostsWithShops(
  posts: DukkanBlogYazisi[]
): Promise<PublicBlogPost[]> {
  if (!posts.length) return [];

  const supabase = await createClient();
  const dukkanIds = [...new Set(posts.map((post) => post.dukkan_id))];

  const { data: dukkanlar, error } = await supabase
    .from("dukkanlar")
    .select("id, slug, dukkan_adi")
    .eq("aktif", true)
    .eq("approval_status", "active")
    .in("id", dukkanIds);

  if (error || !dukkanlar?.length) return [];

  const shopLookup = new Map(
    dukkanlar.map((dukkan) => [dukkan.id, dukkan] as const)
  );

  return posts
    .map((post) => {
      const shop = shopLookup.get(post.dukkan_id);
      if (!shop) return null;

      return {
        ...post,
        shop_slug: shop.slug,
        shop_name: shop.dukkan_adi,
      };
    })
    .filter((post): post is PublicBlogPost => post !== null);
}

export async function getLatestPublicBlogPosts(
  limit = LANDING_BLOG_POST_LIMIT
): Promise<PublicBlogPost[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("dukkan_blog_yazilari")
      .select("*")
      .eq("yayinda", true)
      .order("created_at", { ascending: false })
      .limit(Math.max(limit, 12));

    if (error || !data?.length) return [];

    const mapped = await mapPostsWithShops(data);
    return mapped.slice(0, limit);
  } catch {
    return [];
  }
}

export async function getPublicBlogPosts(
  limit = BLOG_INDEX_LIMIT
): Promise<PublicBlogPost[]> {
  return getLatestPublicBlogPosts(limit);
}

export async function getPublicBlogPostBySlug(
  postSlug: string
): Promise<PublicBlogPost | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("dukkan_blog_yazilari")
      .select("*")
      .eq("slug", postSlug)
      .eq("yayinda", true)
      .order("created_at", { ascending: false })
      .limit(5);

    if (error || !data?.length) return null;

    const mapped = await mapPostsWithShops(data);
    return mapped[0] ?? null;
  } catch {
    return null;
  }
}
