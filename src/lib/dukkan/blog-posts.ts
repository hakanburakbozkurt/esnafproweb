import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, DukkanBlogYazisi } from "@/types/database.types";

type SupabaseDbClient = SupabaseClient<Database>;

export async function getDukkanBlogPostCount(
  supabase: SupabaseDbClient,
  dukkanId: string
): Promise<number> {
  const { count, error } = await supabase
    .from("dukkan_blog_yazilari")
    .select("*", { count: "exact", head: true })
    .eq("dukkan_id", dukkanId);

  if (error) {
    console.error("getDukkanBlogPostCount", error.message);
    return 0;
  }

  return count ?? 0;
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

  return data ?? [];
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

  return data;
}
