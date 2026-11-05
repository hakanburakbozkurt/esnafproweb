import "server-only";

import { sanitizeBlogHtml, stripBlogHtml } from "@/lib/blog/blog-html";
import {
  isPlatformBlogCategory,
  PLATFORM_BLOG_DEFAULT_CATEGORY,
} from "@/lib/blog/platform-blog.constants";
import { createAdminClient } from "@/lib/supabase/admin";
import { isValidSlugFormat, slugify } from "@/lib/utils/slug";
import type { PlatformBlogYazisi } from "@/types/database.types";

export type AutomationPostInput = {
  baslik?: unknown;
  slug?: unknown;
  ozet?: unknown;
  icerik?: unknown;
  kapak_url?: unknown;
  kategori?: unknown;
  meta_title?: unknown;
  meta_description?: unknown;
  anahtar_kelime?: unknown;
  yazar_adi?: unknown;
  yayinda?: unknown;
};

export type AutomationResult =
  | { ok: true; post: PlatformBlogYazisi; slugChanged: boolean }
  | { ok: false; status: number; error: string };

function asText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

/** Otomasyon yetkisi: BLOG_AUTOMATION_TOKEN ile Bearer doğrulaması */
export function isAutomationAuthorized(
  authorizationHeader: string | null
): boolean {
  const expected = process.env.BLOG_AUTOMATION_TOKEN?.trim();
  if (!expected || expected.length < 24) return false;

  const provided = authorizationHeader?.replace(/^Bearer\s+/i, "").trim();
  if (!provided || provided.length !== expected.length) return false;

  // sabit süreli karşılaştırma
  let diff = 0;
  for (let i = 0; i < expected.length; i += 1) {
    diff |= expected.charCodeAt(i) ^ provided.charCodeAt(i);
  }
  return diff === 0;
}

async function resolveFreeSlug(
  supabase: ReturnType<typeof createAdminClient>,
  baseSlug: string
): Promise<{ slug: string; changed: boolean }> {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const candidate = attempt === 0 ? baseSlug : `${baseSlug}-${attempt + 1}`;
    const { data } = await supabase
      .from("platform_blog_yazilari")
      .select("id")
      .eq("slug", candidate)
      .maybeSingle();

    if (!data) {
      return { slug: candidate, changed: candidate !== baseSlug };
    }
  }

  return { slug: `${baseSlug}-${Date.now()}`, changed: true };
}

/**
 * Otomasyon kanalından yazı oluşturur. Varsayılan olarak TASLAK kaydeder —
 * `yayinda: true` açıkça gönderilmedikçe hiçbir şey canlıya çıkmaz.
 */
export async function createAutomationBlogPost(
  input: AutomationPostInput
): Promise<AutomationResult> {
  const baslik = asText(input.baslik);
  if (!baslik) {
    return { ok: false, status: 400, error: "baslik zorunludur." };
  }

  const rawIcerik = asText(input.icerik);
  if (!rawIcerik) {
    return { ok: false, status: 400, error: "icerik zorunludur." };
  }

  const icerik = sanitizeBlogHtml(rawIcerik);
  if (stripBlogHtml(icerik).length < 200) {
    return {
      ok: false,
      status: 400,
      error: "icerik en az 200 karakter düz metin içermelidir.",
    };
  }

  const requestedSlug = asText(input.slug);
  const baseSlug = slugify(requestedSlug || baslik);
  if (!baseSlug || !isValidSlugFormat(baseSlug)) {
    return { ok: false, status: 400, error: "Geçerli bir slug üretilemedi." };
  }

  const kategoriRaw = asText(input.kategori);
  const kategori = isPlatformBlogCategory(kategoriRaw)
    ? kategoriRaw
    : PLATFORM_BLOG_DEFAULT_CATEGORY;

  const supabase = createAdminClient();
  const { slug, changed } = await resolveFreeSlug(supabase, baseSlug);

  const { data, error } = await supabase
    .from("platform_blog_yazilari")
    .insert({
      baslik,
      slug,
      ozet: asText(input.ozet) || null,
      icerik,
      kapak_url: asText(input.kapak_url) || null,
      kategori,
      meta_title: asText(input.meta_title) || null,
      meta_description: asText(input.meta_description) || null,
      anahtar_kelime: asText(input.anahtar_kelime) || null,
      yazar_adi: asText(input.yazar_adi) || "EsnafPRO",
      yayinda: input.yayinda === true,
    })
    .select("*")
    .single();

  if (error || !data) {
    return {
      ok: false,
      status: 500,
      error: error?.message ?? "Yazı kaydedilemedi.",
    };
  }

  return { ok: true, post: data, slugChanged: changed };
}
