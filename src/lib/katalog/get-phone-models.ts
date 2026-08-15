import { createClient } from "@/lib/supabase/server";
import type { PhoneModel } from "@/types/database.types";

export async function getPhoneModels(): Promise<PhoneModel[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("phone_models")
      .select("*")
      .order("brand", { ascending: true })
      .order("model_name", { ascending: true });

    if (error || !data) return [];
    return data;
  } catch {
    return [];
  }
}
