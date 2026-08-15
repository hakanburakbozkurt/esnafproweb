import { createClient } from "@/lib/supabase/server";
import type { KatalogWebItem } from "@/types/database.types";

export async function getKatalogItemsForUser(
  userId: string
): Promise<KatalogWebItem[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("katalogweb")
      .select("*")
      .eq("user_id", userId)
      .eq("is_sold", false)
      .order("created_at", { ascending: false });

    if (error || !data) return [];
    return data;
  } catch {
    return [];
  }
}
