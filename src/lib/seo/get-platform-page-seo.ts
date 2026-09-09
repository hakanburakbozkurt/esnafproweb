import type { Metadata } from "next";
import {
  getDefaultPlatformPageSeo,
  PLATFORM_PAGE_SEO_DEFAULTS,
} from "@/lib/seo/platform-page-seo.defaults";
import { buildPageMetadata } from "@/lib/seo/page-metadata";
import type {
  PlatformPageSeo,
  PlatformPageSeoAdminRow,
} from "@/lib/seo/platform-page-seo.types";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database.types";

type PlatformPageSeoRow = Database["public"]["Tables"]["platform_page_seo"]["Row"];

function rowToSeo(row: PlatformPageSeoRow): PlatformPageSeo {
  return {
    page_path: row.page_path,
    label: row.label,
    meta_title: row.meta_title,
    meta_description: row.meta_description,
    meta_keywords: row.meta_keywords,
    robots_index: row.robots_index,
    robots_follow: row.robots_follow,
    sort_order: row.sort_order,
    updated_at: row.updated_at,
  };
}

function mergeWithDefault(row: PlatformPageSeo): PlatformPageSeo {
  const fallback = getDefaultPlatformPageSeo(row.page_path);
  if (!fallback) return row;

  return {
    ...fallback,
    ...row,
    label: row.label || fallback.label,
  };
}

/** Public metadata — DB kaydı yoksa katalog fallback. */
export async function getPlatformPageSeo(pagePath: string): Promise<PlatformPageSeo> {
  const fallback =
    getDefaultPlatformPageSeo(pagePath) ??
    ({
      page_path: pagePath,
      label: pagePath,
      meta_title: "EsnafPRO",
      meta_description: "EsnafPRO dijital vitrin ve işletme yönetimi platformu.",
      meta_keywords: null,
      robots_index: true,
      robots_follow: true,
      sort_order: 999,
    } satisfies PlatformPageSeo);

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("platform_page_seo")
      .select("*")
      .eq("page_path", pagePath)
      .maybeSingle();

    if (error || !data) {
      return fallback;
    }

    return mergeWithDefault(rowToSeo(data));
  } catch {
    return fallback;
  }
}

export function buildMetadataFromPlatformSeo(seo: PlatformPageSeo): Metadata {
  const base = buildPageMetadata({
    title: seo.meta_title,
    description: seo.meta_description,
    path: seo.page_path === "/" ? "/" : seo.page_path,
  });

  const keywords = seo.meta_keywords
    ?.split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  return {
    ...base,
    ...(keywords?.length ? { keywords } : {}),
    robots: {
      index: seo.robots_index,
      follow: seo.robots_follow,
    },
  };
}

export async function resolvePlatformPageMetadata(pagePath: string): Promise<Metadata> {
  const seo = await getPlatformPageSeo(pagePath);
  return buildMetadataFromPlatformSeo(seo);
}

export type PlatformPageSeoAdminQueryResult = {
  rows: PlatformPageSeoAdminRow[];
  error?: string;
};

/** Admin — katalog + DB birleşimi; mock ID yok. */
export async function getAdminPlatformPageSeoList(): Promise<PlatformPageSeoAdminQueryResult> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("platform_page_seo")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("page_path", { ascending: true });

  if (error) {
    return { rows: [], error: error.message };
  }

  const dbMap = new Map((data ?? []).map((row) => [row.page_path, rowToSeo(row)]));

  const rows: PlatformPageSeoAdminRow[] = PLATFORM_PAGE_SEO_DEFAULTS.map((catalogItem) => {
    const persisted = dbMap.get(catalogItem.page_path);
    if (persisted) {
      return { ...mergeWithDefault(persisted), isPersisted: true };
    }
    return { ...catalogItem, isPersisted: false };
  });

  return { rows };
}
