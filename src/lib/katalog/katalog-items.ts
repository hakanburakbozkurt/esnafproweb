import { createClient } from "@/lib/supabase/server";
import type { KatalogWebItem } from "@/types/database.types";

export async function getKatalogItemsForUser(
  userId: string,
  options?: { includeSold?: boolean }
): Promise<KatalogWebItem[]> {
  try {
    const supabase = await createClient();
    let query = supabase
      .from("katalogweb")
      .select("*")
      .eq("user_id", userId)
      .order("brand", { ascending: true })
      .order("model_name", { ascending: true })
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (!options?.includeSold) {
      query = query.eq("is_sold", false);
    }

    const { data, error } = await query;

    if (error || !data) return [];
    return data;
  } catch {
    return [];
  }
}

export async function getKatalogItemsForShop(
  userId: string,
  isOwner: boolean
): Promise<KatalogWebItem[]> {
  return getKatalogItemsForUser(userId, { includeSold: isOwner });
}
