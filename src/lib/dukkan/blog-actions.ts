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

async function getOwnerDukkan(userId: string) {
  const supabase = await createClient();
  const { data: dukkan } = await supabase
    .from("dukkanlar")
    .select("id, slug")
    .eq("user_id", userId)
    .maybeSingle();

  return { supabase, dukkan };
}

function revalidateBlogPaths(shopSlug: string, postSlug: string, oldSlug?: string) {
  revalidatePath("/yonetim");
  revalidatePath("/yonetim/blog");
  revalidatePath("/");
  revalidatePath("/blog");
  revalidatePath(`/${shopSlug}/blog`);
  revalidatePath(`/${shopSlug}/blog/${postSlug}`);

  if (oldSlug && oldSlug !== postSlug) {
    revalidatePath(`/${shopSlug}/blog/${oldSlug}`);
  }

  revalidateSitemap();
}

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

  const { dukkan } = await getOwnerDukkan(user.id);

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

  revalidateBlogPaths(dukkan.slug, slug);
  redirect(`/${dukkan.slug}/blog`);
}

export async function updateBlogPost(
  _prevState: BlogFormState,
  formData: FormData
): Promise<BlogFormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Blog yazısını düzenlemek için giriş yapmalısınız." };
  }

  if (await isWholesalerAccount(supabase, user)) {
    return { error: wholesalerStoreAccessError() };
  }

  const { dukkan } = await getOwnerDukkan(user.id);

  if (!dukkan) {
    return { error: "Önce mağaza açmalısınız." };
  }

  const postId = String(formData.get("post_id") ?? "").trim();
  const baslik = String(formData.get("baslik") ?? "").trim();
  const icerik = String(formData.get("icerik") ?? "").trim();
  const kapakUrl = String(formData.get("kapak_url") ?? "").trim();
  const yayinda = formData.get("yayinda") === "true";

  if (!postId) {
    return { error: "Yazı kimliği bulunamadı." };
  }

  if (!baslik) {
    return { error: "Blog başlığı zorunludur." };
  }

  const slug = slugify(baslik);
  if (!slug) {
    return { error: "Geçerli bir başlık girin." };
  }

  const { data: existing } = await supabase
    .from("dukkan_blog_yazilari")
    .select("id, slug")
    .eq("id", postId)
    .eq("dukkan_id", dukkan.id)
    .maybeSingle();

  if (!existing) {
    return { error: "Düzenlenecek blog yazısı bulunamadı." };
  }

  const { error } = await supabase
    .from("dukkan_blog_yazilari")
    .update({
      baslik,
      slug,
      icerik: icerik || null,
      kapak_url: kapakUrl || null,
      yayinda,
      updated_at: new Date().toISOString(),
    })
    .eq("id", postId)
    .eq("dukkan_id", dukkan.id);

  if (error) {
    if (error.code === "23505") {
      return { error: "Bu başlıkla zaten bir yazınız var. Farklı bir başlık deneyin." };
    }
    return { error: error.message };
  }

  revalidateBlogPaths(dukkan.slug, slug, existing.slug);
  redirect("/yonetim/blog");
}

export async function deleteBlogPost(
  _prevState: BlogFormState,
  formData: FormData
): Promise<BlogFormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Blog yazısını silmek için giriş yapmalısınız." };
  }

  if (await isWholesalerAccount(supabase, user)) {
    return { error: wholesalerStoreAccessError() };
  }

  const { dukkan } = await getOwnerDukkan(user.id);

  if (!dukkan) {
    return { error: "Önce mağaza açmalısınız." };
  }

  const postId = String(formData.get("post_id") ?? "").trim();

  if (!postId) {
    return { error: "Yazı kimliği bulunamadı." };
  }

  const { data: existing } = await supabase
    .from("dukkan_blog_yazilari")
    .select("slug")
    .eq("id", postId)
    .eq("dukkan_id", dukkan.id)
    .maybeSingle();

  if (!existing) {
    return { error: "Silinecek blog yazısı bulunamadı." };
  }

  const { error } = await supabase
    .from("dukkan_blog_yazilari")
    .delete()
    .eq("id", postId)
    .eq("dukkan_id", dukkan.id);

  if (error) {
    return { error: error.message };
  }

  revalidateBlogPaths(dukkan.slug, existing.slug);
  redirect("/yonetim/blog");
}
