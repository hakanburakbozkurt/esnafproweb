import { createPublicClient } from "@/lib/supabase/public";
import type {
  TamirFiyati,
  TamirMarkasi,
  TamirModeli,
} from "@/types/database.types";

export type TamirModelOption = TamirModeli & {
  seri_name: string;
  seri_slug: string;
};

export async function getTamirMarkalari(): Promise<TamirMarkasi[]> {
  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("tamir_markalari")
      .select("*")
      .eq("aktif", true)
      .order("sort_order", { ascending: true });

    if (error || !data) return [];
    return data;
  } catch {
    return [];
  }
}

export async function getTamirModelleriByMarka(
  markaSlug: string
): Promise<TamirModelOption[]> {
  try {
    const supabase = createPublicClient();

    const { data: marka } = await supabase
      .from("tamir_markalari")
      .select("id")
      .eq("slug", markaSlug)
      .eq("aktif", true)
      .maybeSingle();

    if (!marka) return [];

    const { data: seriler } = await supabase
      .from("tamir_serileri")
      .select("id, name, slug, sort_order")
      .eq("marka_id", marka.id)
      .order("sort_order", { ascending: true });

    if (!seriler?.length) return [];

    const seriMap = new Map(seriler.map((seri) => [seri.id, seri]));
    const seriIds = seriler.map((seri) => seri.id);

    const { data: modeller } = await supabase
      .from("tamir_modelleri")
      .select("*")
      .in("seri_id", seriIds)
      .order("sort_order", { ascending: true });

    return (modeller ?? []).map((model) => {
      const seri = seriMap.get(model.seri_id);
      return {
        ...model,
        seri_name: seri?.name ?? "",
        seri_slug: seri?.slug ?? "",
      };
    });
  } catch {
    return [];
  }
}

export async function getTamirKategorileriByModel(
  modelId: string
): Promise<string[]> {
  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("tamir_fiyatlari")
      .select("category, sort_order")
      .eq("model_id", modelId)
      .order("sort_order", { ascending: true });

    if (error || !data) return [];

    const seen = new Set<string>();
    const categories: string[] = [];
    for (const row of data) {
      if (!seen.has(row.category)) {
        seen.add(row.category);
        categories.push(row.category);
      }
    }
    return categories;
  } catch {
    return [];
  }
}

export async function getTamirFiyatlariByModel(
  modelId: string
): Promise<TamirFiyati[]> {
  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("tamir_fiyatlari")
      .select("*")
      .eq("model_id", modelId)
      .order("sort_order", { ascending: true });

    if (error || !data) return [];
    return data;
  } catch {
    return [];
  }
}

export type TamirFiyatGroup = {
  category: string;
  items: TamirFiyati[];
};

export function groupTamirFiyatlariByCategory(
  prices: TamirFiyati[]
): TamirFiyatGroup[] {
  const groups = new Map<string, TamirFiyati[]>();

  for (const item of prices) {
    const key = item.category || "Diğer";
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(item);
  }

  return [...groups.entries()].map(([category, items]) => ({
    category,
    items,
  }));
}

export async function getTamirFiyatlariByModelAndCategory(
  modelId: string,
  category: string
): Promise<TamirFiyati[]> {
  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("tamir_fiyatlari")
      .select("*")
      .eq("model_id", modelId)
      .eq("category", category)
      .order("sort_order", { ascending: true });

    if (error || !data) return [];
    return data;
  } catch {
    return [];
  }
}

export function formatTamirPrice(price: number | null | undefined): string {
  if (price == null || Number.isNaN(Number(price)) || Number(price) === 0) {
    return "Fiyat sorunuz";
  }

  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(Number(price));
}
