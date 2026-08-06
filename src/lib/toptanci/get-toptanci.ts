import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

type SupabaseDbClient = SupabaseClient<Database>;

export async function getToptanciByUserId(
  supabase: SupabaseDbClient,
  userId: string
) {
  const { data, error } = await supabase
    .from("toptancilar")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.error("[getToptanciByUserId]", error.message);
    return null;
  }

  return data;
}

export async function hasToptanciProfile(
  supabase: SupabaseDbClient,
  userId: string
): Promise<boolean> {
  const profile = await getToptanciByUserId(supabase, userId);
  return Boolean(profile?.slug);
}
