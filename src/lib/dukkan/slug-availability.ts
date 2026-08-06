import type { SupabaseClient } from "@supabase/supabase-js";
import { isSlugTakenGlobally } from "@/lib/toptanci/slug-availability";
import type { Database } from "@/types/database.types";

export const SLUG_TAKEN_ERROR =
  "Bu dükkan ismi daha önce alınmış, lütfen başka bir isim deneyin.";

type SupabaseDbClient = SupabaseClient<Database>;

/** Slug başka bir dükkana ait mi? (güncellemede mevcut kayıt hariç) */
export async function isSlugTaken(
  supabase: SupabaseDbClient,
  slug: string,
  excludeDukkanId?: string
): Promise<boolean> {
  return isSlugTakenGlobally(supabase, slug, { excludeDukkanId });
}

export async function assertSlugAvailable(
  supabase: SupabaseDbClient,
  slug: string,
  excludeDukkanId?: string
): Promise<{ ok: true } | { error: string }> {
  const taken = await isSlugTaken(supabase, slug, excludeDukkanId);
  if (taken) {
    return { error: SLUG_TAKEN_ERROR };
  }
  return { ok: true };
}
