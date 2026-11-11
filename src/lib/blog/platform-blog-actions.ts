"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { sanitizeBlogHtml } from "@/lib/blog/blog-html";
import {
  isPlatformBlogCategory,
  PLATFORM_BLOG_DEFAULT_CATEGORY,
  validatePlatformBlogPublish,
} from "@/lib/blog/platform-blog.constants";
import { isSuperAdminUser } from "@/lib/auth/super-admin";
import { revalidateSitemap } from "@/lib/seo/sitemap-cache";
import { createClient } from "@/lib/supabase/server";
import { isValidSlugFormat, slugify } from "@/lib/utils/slug";

export type PlatformBlogFormState = {
  error?: string;
};

type ParsedPlatformBlogForm = {
  baslik: string;
  slug: string;
  ozet: string | null;
  icerik: string | null;
  kapakUrl: string | null;
  kategori: string;
  metaTitle: string | null;
  metaDescription: string | null;
  anahtarKelime: string | null;
  yazarAdi: string;
  yayinda: boolean;
  postId?: string;
};

const ADMIN_BLOG_PATH = "/yonetim/admin/blog";

function revalidatePlatformBlogPaths(slug: string, oldSlug?: string) {
  revalidatePath(ADMIN_BLOG_PATH);
  revalidatePath("/blog");
  revalidatePath(`/blog/${slug}`);

  if (oldSlug && oldSlug !== slug) {
    revalidatePath(`/blog/${oldSlug}`);
  }

  revalidateSitemap();
}

function parseForm(
  formData: FormData
): ParsedPlatformBlogForm | { error: string } {
  const baslik = String(formData.get("baslik") ?? "").trim();
  const rawSlug = String(formData.get("slug") ?? "").trim();
  const ozet = String(formData.get("ozet") ?? "").trim();
  const rawIcerik = String(formData.get("icerik") ?? "").trim();
  const kapakUrl = String(formData.get("kapak_url") ?? "").trim();
  const rawKategori = String(formData.get("kategori") ?? "").trim();
  const metaTitle = String(formData.get("meta_title") ?? "").trim();
  const metaDescription = String(formData.get("meta_description") ?? "").trim();
  const anahtarKelime = String(formData.get("anahtar_kelime") ?? "").trim();
  const yazarAdi = String(formData.get("yazar_adi") ?? "").trim();
  const yayinda = formData.get("yayinda") === "true";
  const postId = String(formData.get("post_id") ?? "").trim() || undefined;

  if (!baslik) {
    return { error: "Yazı başlığı zorunludur." };
  }

  const slug = rawSlug ? slugify(rawSlug) : slugify(baslik);
  if (!slug || !isValidSlugFormat(slug)) {
    return {
      error:
        "Geçerli bir URL slug girin (küçük harf, rakam ve tire; en az 2 karakter).",
    };
  }

  return {
    baslik,
    slug,
    ozet: ozet || null,
    icerik: rawIcerik ? sanitizeBlogHtml(rawIcerik) : null,
    kapakUrl: kapakUrl || null,
    kategori: isPlatformBlogCategory(rawKategori)
      ? rawKategori
      : PLATFORM_BLOG_DEFAULT_CATEGORY,
    metaTitle: metaTitle || null,
    metaDescription: metaDescription || null,
    anahtarKelime: anahtarKelime || null,
    yazarAdi: yazarAdi || "EsnafPRO",
    yayinda,
    postId,
  };
}

function payload(parsed: ParsedPlatformBlogForm) {
  return {
    baslik: parsed.baslik,
    slug: parsed.slug,
    ozet: parsed.ozet,
    icerik: parsed.icerik,
    kapak_url: parsed.kapakUrl,
    kategori: parsed.kategori,
    meta_title: parsed.metaTitle,
    meta_description: parsed.metaDescription,
    anahtar_kelime: parsed.anahtarKelime,
    yazar_adi: parsed.yazarAdi,
    yayinda: parsed.yayinda,
  };
}

async function requireSuperAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Bu işlem için giriş yapmalısınız." as string };
  }

  if (!isSuperAdminUser(user)) {
    return { error: "Bu işlem için yetkiniz yok." as string };
  }

  return { supabase, user };
}

export async function createPlatformBlogPost(
  _prevState: PlatformBlogFormState,
  formData: FormData
): Promise<PlatformBlogFormState> {
  const auth = await requireSuperAdmin();
  if ("error" in auth) return { error: auth.error };

  const parsed = parseForm(formData);
  if ("error" in parsed) return { error: parsed.error };

  if (parsed.yayinda) {
    const check = validatePlatformBlogPublish({
      ozet: parsed.ozet,
      icerik: parsed.icerik,
      kapak_url: parsed.kapakUrl,
    });
    if (!check.ok) return { error: check.error };
  }

  const { error } = await auth.supabase.from("platform_blog_yazilari").insert({
    ...payload(parsed),
    olusturan_id: auth.user.id,
  });

  if (error) {
    if (error.code === "23505" || error.code === "23514") {
      return {
        error: "Bu slug zaten kullanımda. Farklı bir URL deneyin.",
      };
    }
    return { error: error.message };
  }

  revalidatePlatformBlogPaths(parsed.slug);
  redirect(ADMIN_BLOG_PATH);
}

export async function updatePlatformBlogPost(
  _prevState: PlatformBlogFormState,
  formData: FormData
): Promise<PlatformBlogFormState> {
  const auth = await requireSuperAdmin();
  if ("error" in auth) return { error: auth.error };

  const parsed = parseForm(formData);
  if ("error" in parsed) return { error: parsed.error };

  if (!parsed.postId) {
    return { error: "Yazı kimliği bulunamadı." };
  }

  if (parsed.yayinda) {
    const check = validatePlatformBlogPublish({
      ozet: parsed.ozet,
      icerik: parsed.icerik,
      kapak_url: parsed.kapakUrl,
    });
    if (!check.ok) return { error: check.error };
  }

  const { data: existing } = await auth.supabase
    .from("platform_blog_yazilari")
    .select("id, slug")
    .eq("id", parsed.postId)
    .maybeSingle();

  if (!existing) {
    return { error: "Düzenlenecek yazı bulunamadı." };
  }

  const { error } = await auth.supabase
    .from("platform_blog_yazilari")
    .update(payload(parsed))
    .eq("id", parsed.postId);

  if (error) {
    if (error.code === "23505") {
      return { error: "Bu slug zaten kullanımda. Farklı bir URL deneyin." };
    }
    return { error: error.message };
  }

  revalidatePlatformBlogPaths(parsed.slug, existing.slug);
  redirect(ADMIN_BLOG_PATH);
}

export async function togglePlatformBlogPost(
  _prevState: PlatformBlogFormState,
  formData: FormData
): Promise<PlatformBlogFormState> {
  const auth = await requireSuperAdmin();
  if ("error" in auth) return { error: auth.error };

  const postId = String(formData.get("post_id") ?? "").trim();
  if (!postId) return { error: "Yazı kimliği bulunamadı." };

  const { data: existing } = await auth.supabase
    .from("platform_blog_yazilari")
    .select("id, slug, ozet, icerik, kapak_url, yayinda")
    .eq("id", postId)
    .maybeSingle();

  if (!existing) return { error: "Yazı bulunamadı." };

  const nextYayinda = !existing.yayinda;

  if (nextYayinda) {
    const check = validatePlatformBlogPublish(existing);
    if (!check.ok) return { error: check.error };
  }

  const { error } = await auth.supabase
    .from("platform_blog_yazilari")
    .update({ yayinda: nextYayinda })
    .eq("id", postId);

  if (error) return { error: error.message };

  revalidatePlatformBlogPaths(existing.slug);
  return {};
}

export async function deletePlatformBlogPost(
  _prevState: PlatformBlogFormState,
  formData: FormData
): Promise<PlatformBlogFormState> {
  const auth = await requireSuperAdmin();
  if ("error" in auth) return { error: auth.error };

  const postId = String(formData.get("post_id") ?? "").trim();
  if (!postId) return { error: "Yazı kimliği bulunamadı." };

  const { data: existing } = await auth.supabase
    .from("platform_blog_yazilari")
    .select("slug")
    .eq("id", postId)
    .maybeSingle();

  if (!existing) return { error: "Silinecek yazı bulunamadı." };

  const { error } = await auth.supabase
    .from("platform_blog_yazilari")
    .delete()
    .eq("id", postId);

  if (error) return { error: error.message };

  revalidatePlatformBlogPaths(existing.slug);
  return {};
}
