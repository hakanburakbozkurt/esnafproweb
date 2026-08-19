import type { SupabaseClient } from "@supabase/supabase-js";
import { SLUG_TAKEN_ERROR } from "@/lib/dukkan/slug-availability";
import type { Database } from "@/types/database.types";

type SupabaseDbClient = SupabaseClient<Database>;

export async function isSlugTakenGlobally(
  supabase: SupabaseDbClient,
  slug: string,
  options?: { excludeDukkanId?: string; excludeToptanciId?: string }
): Promise<boolean> {
  const [{ data: dukkan }, { data: toptanci }, { data: slugHistory }] =
    await Promise.all([
      supabase.from("dukkanlar").select("id").eq("slug", slug).maybeSingle(),
      supabase.from("toptancilar").select("id").eq("slug", slug).maybeSingle(),
      supabase
        .from("shop_slug_history")
        .select("shop_id")
        .eq("old_slug", slug)
        .maybeSingle(),
    ]);

  if (dukkan && dukkan.id !== options?.excludeDukkanId) {
    return true;
  }

  if (toptanci && toptanci.id !== options?.excludeToptanciId) {
    return true;
  }

  if (
    slugHistory &&
    slugHistory.shop_id !== options?.excludeDukkanId
  ) {
    return true;
  }

  return false;
}

export async function assertSlugAvailableGlobal(
  supabase: SupabaseDbClient,
  slug: string,
  options?: { excludeDukkanId?: string; excludeToptanciId?: string }
): Promise<{ ok: true } | { error: string }> {
  const taken = await isSlugTakenGlobally(supabase, slug, options);
  if (taken) {
    return { error: SLUG_TAKEN_ERROR };
  }
  return { ok: true };
}
