import type { SupabaseClient } from "@supabase/supabase-js";
import { logDukkanAction } from "@/lib/dukkan/logger";
import type { Database } from "@/types/database.types";

type SupabaseDbClient = SupabaseClient<Database>;

export async function recordShopSlugHistory(
  supabase: SupabaseDbClient,
  params: { shopId: string; oldSlug: string }
): Promise<{ ok: true } | { error: string }> {
  const oldSlug = params.oldSlug.trim();
  if (!oldSlug) {
    return { ok: true };
  }

  const { error } = await supabase.from("shop_slug_history").upsert(
    {
      shop_id: params.shopId,
      old_slug: oldSlug,
    },
    { onConflict: "old_slug" }
  );

  if (error) {
    logDukkanAction("recordShopSlugHistory", "upsert failed", {
      shopId: params.shopId,
      oldSlug,
      error: error.message,
    });
    return { error: error.message };
  }

  return { ok: true };
}

/** Eski slug için güncel aktif vitrin slug'ı; yönlendirme yoksa null */
export async function resolveShopSlugRedirectTarget(
  supabase: SupabaseDbClient,
  oldSlug: string
): Promise<string | null> {
  const normalized = oldSlug.trim().toLowerCase();
  if (!normalized) {
    return null;
  }

  const { data, error } = await supabase.rpc("resolve_shop_slug_redirect", {
    p_old_slug: normalized,
  });

  if (error) {
    logDukkanAction("resolveShopSlugRedirectTarget", "rpc failed", {
      oldSlug: normalized,
      error: error.message,
    });
    return null;
  }

  return typeof data === "string" && data.length > 0 ? data : null;
}
