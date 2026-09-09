import {
  normalizeCihazKataloguRow,
  type CihazKataloguRow,
} from "@/lib/katalog/cihaz-katalogu.types";
import { createClient } from "@/lib/supabase/server";

export async function getAdminCihazKataloguList(): Promise<{
  rows: CihazKataloguRow[];
  error?: string;
}> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("cihaz_katalogu")
      .select("*")
      .order("category", { ascending: true })
      .order("brand", { ascending: true })
      .order("sort_order", { ascending: true })
      .order("model_name", { ascending: true });

    if (error) {
      return { rows: [], error: error.message };
    }

    return {
      rows: (data ?? []).map((row) =>
        normalizeCihazKataloguRow(row as Record<string, unknown>)
      ),
    };
  } catch (err) {
    return {
      rows: [],
      error: err instanceof Error ? err.message : "Katalog yüklenemedi.",
    };
  }
}
