"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { MAX_BULK_KATALOG_IMAGES } from "@/lib/katalog/katalog-constants";

export type KatalogActionState = {
  error?: string;
  success?: boolean;
  count?: number;
};

export type BulkKatalogItemInput = {
  image_url: string;
  brand: string;
  model_name: string;
  product_name?: string | null;
  price?: number | null;
};

async function assertShopOwner(shopSlug: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Bu işlem için giriş yapmalısınız." } as const;
  }

  const { data: dukkan } = await supabase
    .from("dukkanlar")
    .select("id, slug, user_id")
    .eq("slug", shopSlug)
    .eq("aktif", true)
    .maybeSingle();

  if (!dukkan || dukkan.user_id !== user.id) {
    return { error: "Bu işlem için yetkiniz yok." } as const;
  }

  return { supabase, user, dukkan } as const;
}

function revalidateKatalogPaths(shopSlug: string) {
  revalidatePath(`/${shopSlug}/katalog`);
  revalidatePath("/yonetim/katalog");
}

export async function markKatalogItemSold(
  itemId: string,
  shopSlug: string
): Promise<KatalogActionState> {
  if (!itemId?.trim()) {
    return { error: "Geçersiz ürün." };
  }

  const owner = await assertShopOwner(shopSlug);
  if ("error" in owner) return owner;

  const { supabase, user } = owner;

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

  revalidateKatalogPaths(shopSlug);
  return { success: true };
}

export async function bulkCreateKatalogItems(
  shopSlug: string,
  brand: string,
  modelName: string,
  items: BulkKatalogItemInput[],
  options?: { productName?: string | null; price?: number | null }
): Promise<KatalogActionState> {
  const trimmedBrand = brand.trim();
  const trimmedModel = modelName.trim();

  if (!trimmedBrand || !trimmedModel) {
    return { error: "Marka ve model zorunludur." };
  }

  if (!items.length) {
    return { error: "En az bir görsel yüklemelisiniz." };
  }

  if (items.length > MAX_BULK_KATALOG_IMAGES) {
    return {
      error: `Tek seferde en fazla ${MAX_BULK_KATALOG_IMAGES} görsel ekleyebilirsiniz.`,
    };
  }

  const owner = await assertShopOwner(shopSlug);
  if ("error" in owner) return owner;

  const { supabase, user } = owner;
  const defaultProductName = options?.productName?.trim() || null;
  const defaultPrice =
    options?.price != null && !Number.isNaN(options.price)
      ? options.price
      : null;

  const rows = items.map((item, index) => ({
    user_id: user.id,
    brand: trimmedBrand,
    model_name: trimmedModel,
    product_name: item.product_name?.trim() || defaultProductName,
    price: item.price ?? defaultPrice,
    image_url: item.image_url,
    is_sold: false,
    sort_order: index,
  }));

  const { data, error } = await supabase
    .from("katalogweb")
    .insert(rows)
    .select("id");

  if (error) {
    return { error: error.message };
  }

  revalidateKatalogPaths(shopSlug);
  return { success: true, count: data?.length ?? rows.length };
}
