"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type MarkKatalogSoldState = {
  error?: string;
  success?: boolean;
};

export async function markKatalogItemSold(
  itemId: string,
  shopSlug: string
): Promise<MarkKatalogSoldState> {
  if (!itemId?.trim()) {
    return { error: "Geçersiz ürün." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Bu işlem için giriş yapmalısınız." };
  }

  const { data: dukkan } = await supabase
    .from("dukkanlar")
    .select("id, slug, user_id")
    .eq("slug", shopSlug)
    .eq("aktif", true)
    .maybeSingle();

  if (!dukkan || dukkan.user_id !== user.id) {
    return { error: "Bu işlem için yetkiniz yok." };
  }

  const { data, error } = await supabase
    .from("katalogweb")
    .update({ is_sold: true })
    .eq("id", itemId)
    .eq("user_id", user.id)
    .eq("is_sold", false)
    .select("id")
    .maybeSingle();

  if (error) {
    return { error: error.message };
  }

  if (!data) {
    return { error: "Ürün bulunamadı veya zaten satıldı." };
  }

  revalidatePath(`/${shopSlug}/katalog`);
  return { success: true };
}
