"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getShopPlan } from "@/lib/abonelik/get-shop-plan";
import {
  getIstanbulMonthStartIso,
  getPlanLimits,
  isPlanEnforcementEnabled,
  isWithinLimit,
  planLimitMessage,
} from "@/lib/abonelik/plan-limits";
import { sanitizeBlogHtml } from "@/lib/blog/blog-html";
import { validateBlogPublishRequirements } from "@/lib/blog/blog-publish-rules";
import { createClient } from "@/lib/supabase/server";
import { isWholesalerAccount, wholesalerStoreAccessError } from "@/lib/auth/wholesaler";
import { revalidateSitemap } from "@/lib/seo/sitemap-cache";
import { isValidSlugFormat, slugify } from "@/lib/utils/slug";

export type BlogFormState = {
  error?: string;
};

type ParsedBlogForm = {
  baslik: string;
  slug: string;
  icerik: string | null;
  kapakUrl: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  yayinda: boolean;
  postId?: string;
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

/** Paket sınırı aşılıyorsa kullanıcıya gösterilecek mesajı döndürür (PLAN_ENFORCEMENT=on iken). */
async function getBlogPlanLimitError(
  supabase: Awaited<ReturnType<typeof createClient>>,
  dukkanId: string
): Promise<string | null> {
  if (!isPlanEnforcementEnabled()) return null;

  const limits = getPlanLimits(await getShopPlan(supabase, dukkanId));

  if (limits.blogToplam !== null) {
    const { count, error } = await supabase
      .from("dukkan_blog_yazilari")
      .select("id", { count: "exact", head: true })
      .eq("dukkan_id", dukkanId);
    if (error) return "Blog sınırı kontrol edilemedi. Lütfen tekrar deneyin.";
    if (!isWithinLimit(limits.blogToplam, count ?? 0)) {
      return planLimitMessage("blog yazısı ekleyebilirsiniz", limits.blogToplam, "toplam");
    }
  }

  if (limits.blogAylik !== null) {
    const { count, error } = await supabase
      .from("dukkan_blog_yazilari")
      .select("id", { count: "exact", head: true })
      .eq("dukkan_id", dukkanId)
      .gte("created_at", getIstanbulMonthStartIso());
    if (error) return "Blog sınırı kontrol edilemedi. Lütfen tekrar deneyin.";
    if (!isWithinLimit(limits.blogAylik, count ?? 0)) {
      return planLimitMessage("blog yazısı ekleyebilirsiniz", limits.blogAylik, "aylik");
    }
  }

  return null;
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

function parseBlogForm(formData: FormData): ParsedBlogForm | { error: string } {
  const baslik = String(formData.get("baslik") ?? "").trim();
  const rawSlug = String(formData.get("slug") ?? "").trim();
  const rawIcerik = String(formData.get("icerik") ?? "").trim();
  const kapakUrl = String(formData.get("kapak_url") ?? "").trim();
  const metaTitle = String(formData.get("meta_title") ?? "").trim();
  const metaDescription = String(formData.get("meta_description") ?? "").trim();
  const yayinda = formData.get("yayinda") === "true";
  const postId = String(formData.get("post_id") ?? "").trim() || undefined;

  if (!baslik) {
    return { error: "Blog başlığı zorunludur." };
  }

  const slug = rawSlug ? slugify(rawSlug) : slugify(baslik);
  if (!slug || !isValidSlugFormat(slug)) {
    return {
      error:
        "Geçerli bir URL slug girin (küçük harf, rakam ve tire; en az 2 karakter).",
    };
  }

  const icerik = rawIcerik ? sanitizeBlogHtml(rawIcerik) : null;

  return {
    baslik,
    slug,
    icerik,
    kapakUrl: kapakUrl || null,
    metaTitle: metaTitle || null,
    metaDescription: metaDescription || null,
    yayinda,
    postId,
  };
}

function blogPayload(parsed: ParsedBlogForm) {
  return {
    baslik: parsed.baslik,
    slug: parsed.slug,
    icerik: parsed.icerik,
    kapak_url: parsed.kapakUrl,
    meta_title: parsed.metaTitle,
    meta_description: parsed.metaDescription,
    yayinda: parsed.yayinda,
  };
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

  const parsed = parseBlogForm(formData);
  if ("error" in parsed) {
    return { error: parsed.error };
  }

  if (parsed.yayinda) {
    const publishCheck = validateBlogPublishRequirements({
      kapak_url: parsed.kapakUrl,
      icerik: parsed.icerik,
    });
    if (!publishCheck.ok) {
      return { error: publishCheck.error };
    }
  }

  const planLimitError = await getBlogPlanLimitError(supabase, dukkan.id);
  if (planLimitError) {
    return { error: planLimitError };
  }

  const { error } = await supabase.from("dukkan_blog_yazilari").insert({
    dukkan_id: dukkan.id,
    ...blogPayload(parsed),
  });

  if (error) {
    if (error.code === "23505") {
      return { error: "Bu slug ile zaten bir yazınız var. Farklı bir URL deneyin." };
    }
    return { error: error.message };
  }

  revalidateBlogPaths(dukkan.slug, parsed.slug);

  if (parsed.yayinda) {
    redirect(`/${dukkan.slug}/blog/${parsed.slug}`);
  }

  redirect("/yonetim/blog");
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

  const parsed = parseBlogForm(formData);
  if ("error" in parsed) {
    return { error: parsed.error };
  }

  if (parsed.yayinda) {
    const publishCheck = validateBlogPublishRequirements({
      kapak_url: parsed.kapakUrl,
      icerik: parsed.icerik,
    });
    if (!publishCheck.ok) {
      return { error: publishCheck.error };
    }
  }

  if (!parsed.postId) {
    return { error: "Yazı kimliği bulunamadı." };
  }

  const { data: existing } = await supabase
    .from("dukkan_blog_yazilari")
    .select("id, slug")
    .eq("id", parsed.postId)
    .eq("dukkan_id", dukkan.id)
    .maybeSingle();

  if (!existing) {
    return { error: "Düzenlenecek blog yazısı bulunamadı." };
  }

  const { error } = await supabase
    .from("dukkan_blog_yazilari")
    .update({
      ...blogPayload(parsed),
      updated_at: new Date().toISOString(),
    })
    .eq("id", parsed.postId)
    .eq("dukkan_id", dukkan.id);

  if (error) {
    if (error.code === "23505") {
      return { error: "Bu slug ile zaten bir yazınız var. Farklı bir URL deneyin." };
    }
    return { error: error.message };
  }

  revalidateBlogPaths(dukkan.slug, parsed.slug, existing.slug);
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
