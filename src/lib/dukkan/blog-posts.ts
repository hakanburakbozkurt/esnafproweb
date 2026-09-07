import { isBlogPostScoreEligible } from "@/lib/blog/blog-publish-rules";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, DukkanBlogYazisi } from "@/types/database.types";

type SupabaseDbClient = SupabaseClient<Database>;

export function filterScoreEligibleBlogPosts(
  posts: DukkanBlogYazisi[]
): DukkanBlogYazisi[] {
  return posts.filter((post) => isBlogPostScoreEligible(post));
}

/** Profil & SEO skoruna yalnızca kalite kriterlerini karşılayan yayınlar sayılır */
export async function getDukkanScoreEligibleBlogPostCount(
  supabase: SupabaseDbClient,
  dukkanId: string
): Promise<number> {
  const { data, error } = await supabase
    .from("dukkan_blog_yazilari")
    .select("icerik, kapak_url, yayinda")
    .eq("dukkan_id", dukkanId)
    .eq("yayinda", true);

  if (error) {
    console.error("getDukkanScoreEligibleBlogPostCount", error.message);
    return 0;
  }

  return filterScoreEligibleBlogPosts((data ?? []) as DukkanBlogYazisi[]).length;
}

/** @deprecated Toplam kayıt sayısı — skor için getDukkanScoreEligibleBlogPostCount kullanın */
export async function getDukkanBlogPostCount(
  supabase: SupabaseDbClient,
  dukkanId: string
): Promise<number> {
  return getDukkanScoreEligibleBlogPostCount(supabase, dukkanId);
}

export async function getDukkanBlogPosts(
  supabase: SupabaseDbClient,
  dukkanId: string,
  options?: { publishedOnly?: boolean }
): Promise<DukkanBlogYazisi[]> {
  let query = supabase
    .from("dukkan_blog_yazilari")
    .select("*")
    .eq("dukkan_id", dukkanId)
    .order("created_at", { ascending: false });

  if (options?.publishedOnly) {
    query = query.eq("yayinda", true);
  }

  const { data, error } = await query;

  if (error) {
    console.error("getDukkanBlogPosts", error.message);
    return [];
  }

  const posts = data ?? [];

  if (options?.publishedOnly) {
    return filterScoreEligibleBlogPosts(posts);
  }

  return posts;
}

export async function getDukkanBlogPostBySlug(
  supabase: SupabaseDbClient,
  dukkanId: string,
  postSlug: string
): Promise<DukkanBlogYazisi | null> {
  const { data, error } = await supabase
    .from("dukkan_blog_yazilari")
    .select("*")
    .eq("dukkan_id", dukkanId)
    .eq("slug", postSlug)
    .eq("yayinda", true)
    .maybeSingle();

  if (error) {
    console.error("getDukkanBlogPostBySlug", error.message);
    return null;
  }

  if (!data || !isBlogPostScoreEligible(data)) {
    return null;
  }

  return data;
}

export async function getDukkanBlogPostByIdForOwner(
  supabase: SupabaseDbClient,
  dukkanId: string,
  postId: string
): Promise<DukkanBlogYazisi | null> {
  const { data, error } = await supabase
    .from("dukkan_blog_yazilari")
    .select("*")
    .eq("id", postId)
    .eq("dukkan_id", dukkanId)
    .maybeSingle();

  if (error) {
    console.error("getDukkanBlogPostByIdForOwner", error.message);
    return null;
  }

  return data;
}
