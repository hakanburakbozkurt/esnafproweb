"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isWholesalerAccount, wholesalerStoreAccessError } from "@/lib/auth/wholesaler";
import { revalidateSitemap } from "@/lib/seo/sitemap-cache";
import { slugify } from "@/lib/utils/slug";

export type BlogFormState = {
  error?: string;
};

export async function createBlogPost(
  _prevState: BlogFormState,
  formData: FormData
): Promise<BlogFormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Blog yazısı eklemek için giriş yapmalısınız." };
  }

  if (await isWholesalerAccount(supabase, user)) {
    return { error: wholesalerStoreAccessError() };
  }

  const { data: dukkan } = await supabase
    .from("dukkanlar")
    .select("id, slug")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!dukkan) {
    return { error: "Önce mağaza açmalısınız." };
  }

  const baslik = String(formData.get("baslik") ?? "").trim();
  const icerik = String(formData.get("icerik") ?? "").trim();
  const kapakUrl = String(formData.get("kapak_url") ?? "").trim();

  if (!baslik) {
    return { error: "Blog başlığı zorunludur." };
  }

  const slug = slugify(baslik);
  if (!slug) {
    return { error: "Geçerli bir başlık girin." };
  }

  const { error } = await supabase.from("dukkan_blog_yazilari").insert({
    dukkan_id: dukkan.id,
    baslik,
    slug,
    icerik: icerik || null,
    kapak_url: kapakUrl || null,
    yayinda: true,
  });

  if (error) {
    if (error.code === "23505") {
      return { error: "Bu başlıkla zaten bir yazınız var. Farklı bir başlık deneyin." };
    }
    return { error: error.message };
  }

  revalidatePath("/yonetim");
  revalidatePath("/");
  revalidatePath("/blog");
  revalidatePath(`/${dukkan.slug}/blog`);
  revalidatePath(`/${dukkan.slug}/blog/${slug}`);
  revalidateSitemap();
  redirect(`/${dukkan.slug}/blog`);
}
