"use server";

import { revalidatePath } from "next/cache";
import { PLATFORM_PAGE_SEO_DEFAULTS } from "@/lib/seo/platform-page-seo.defaults";
import type { PlatformSeoAdminState } from "@/lib/seo/platform-page-seo.types";
import {
  SEO_DESCRIPTION_MAX,
  SEO_KEYWORDS_MAX,
  SEO_TITLE_MAX,
} from "@/lib/seo/platform-page-seo.types";
import { isSuperAdminUser } from "@/lib/auth/super-admin";
import { createClient } from "@/lib/supabase/server";

const REVALIDATE_PATHS = [
  "/",
  "/fiyatlandirma",
  "/pazaryeri",
  "/blog",
  "/hakkimizda",
  "/iletisim",
  "/esnaflar",
  "/local-yonetim/seo",
] as const;

async function assertSeoAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !isSuperAdminUser(user)) {
    return { error: "Bu işlem için süper admin yetkisi gerekir." as const, supabase: null };
  }

  return { error: null, supabase };
}

function revalidateSeoPaths() {
  for (const path of REVALIDATE_PATHS) {
    revalidatePath(path);
  }
}

function parseRobotsBoolean(formData: FormData, name: string): boolean {
  return formData.get(name) === "true";
}

function validateSeoPayload(input: {
  page_path: string;
  label: string;
  meta_title: string;
  meta_description: string;
  meta_keywords: string;
}): string | null {
  if (!input.page_path.startsWith("/")) {
    return "Geçersiz sayfa yolu.";
  }

  if (!input.label.trim()) {
    return "Sayfa etiketi zorunludur.";
  }

  if (!input.meta_title.trim()) {
    return "Meta title zorunludur.";
  }

  if (input.meta_title.length > SEO_TITLE_MAX) {
    return `Meta title en fazla ${SEO_TITLE_MAX} karakter olabilir.`;
  }

  if (!input.meta_description.trim()) {
    return "Meta description zorunludur.";
  }

  if (input.meta_description.length > SEO_DESCRIPTION_MAX) {
    return `Meta description en fazla ${SEO_DESCRIPTION_MAX} karakter olabilir.`;
  }

  if (input.meta_keywords.length > SEO_KEYWORDS_MAX) {
    return `Anahtar kelimeler en fazla ${SEO_KEYWORDS_MAX} karakter olabilir.`;
  }

  const allowed = new Set(PLATFORM_PAGE_SEO_DEFAULTS.map((item) => item.page_path));
  if (!allowed.has(input.page_path)) {
    return "Bu sayfa yolu platform kataloğunda tanımlı değil.";
  }

  return null;
}

export async function upsertPlatformPageSeoForm(
  _prev: PlatformSeoAdminState,
  formData: FormData
): Promise<PlatformSeoAdminState> {
  const auth = await assertSeoAdmin();
  if (auth.error || !auth.supabase) return { error: auth.error ?? "Yetki hatası." };

  const payload = {
    page_path: String(formData.get("page_path") ?? "").trim(),
    label: String(formData.get("label") ?? "").trim(),
    meta_title: String(formData.get("meta_title") ?? "").trim(),
    meta_description: String(formData.get("meta_description") ?? "").trim(),
    meta_keywords: String(formData.get("meta_keywords") ?? "").trim() || null,
    robots_index: parseRobotsBoolean(formData, "robots_index"),
    robots_follow: parseRobotsBoolean(formData, "robots_follow"),
    sort_order: Number(formData.get("sort_order") ?? 0),
    updated_at: new Date().toISOString(),
  };

  const validationError = validateSeoPayload({
    page_path: payload.page_path,
    label: payload.label,
    meta_title: payload.meta_title,
    meta_description: payload.meta_description,
    meta_keywords: payload.meta_keywords ?? "",
  });

  if (validationError) {
    return { error: validationError };
  }

  const { error } = await auth.supabase.from("platform_page_seo").upsert(payload, {
    onConflict: "page_path",
  });

  if (error) {
    return { error: error.message };
  }

  revalidateSeoPaths();
  return { success: `${payload.label} SEO kaydı güncellendi.` };
}

export async function seedDefaultPlatformPageSeoForm(
  _prev: PlatformSeoAdminState
): Promise<PlatformSeoAdminState> {
  const auth = await assertSeoAdmin();
  if (auth.error || !auth.supabase) return { error: auth.error ?? "Yetki hatası." };

  const rows = PLATFORM_PAGE_SEO_DEFAULTS.map(
    ({
      page_path,
      label,
      meta_title,
      meta_description,
      meta_keywords,
      robots_index,
      robots_follow,
      sort_order,
    }) => ({
      page_path,
      label,
      meta_title,
      meta_description,
      meta_keywords,
      robots_index,
      robots_follow,
      sort_order,
      updated_at: new Date().toISOString(),
    })
  );

  const { error } = await auth.supabase.from("platform_page_seo").upsert(rows, {
    onConflict: "page_path",
  });

  if (error) {
    return { error: error.message };
  }

  revalidateSeoPaths();
  return {
    success: `${rows.length} çekirdek sayfa için varsayılan SEO meta yüklendi.`,
  };
}
