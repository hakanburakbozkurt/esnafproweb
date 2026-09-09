import type { TamirWizardMarkaOption } from "@/lib/local-yonetim/subscriptions/types";
import { createClient } from "@/lib/supabase/server";

export type TamirWizardCatalogResult = {
  markalar: TamirWizardMarkaOption[];
  categories: string[];
  error?: string;
};

export async function getTamirWizardCatalog(): Promise<TamirWizardCatalogResult> {
  const supabase = await createClient();

  const [markalarResult, serilerResult, modellerResult, fiyatlarResult] = await Promise.all([
    supabase.from("tamir_markalari").select("id, name, slug").eq("aktif", true).order("sort_order"),
    supabase.from("tamir_serileri").select("id, name, slug, marka_id, sort_order").order("sort_order"),
    supabase.from("tamir_modelleri").select("id, seri_id").order("sort_order"),
    supabase.from("tamir_fiyatlari").select("id, model_id, category, price"),
  ]);

  if (markalarResult.error) {
    return { markalar: [], categories: [], error: markalarResult.error.message };
  }

  const modelCountBySeri = new Map<string, number>();
  for (const model of modellerResult.data ?? []) {
    modelCountBySeri.set(model.seri_id, (modelCountBySeri.get(model.seri_id) ?? 0) + 1);
  }

  const modelSeriMap = new Map(
    (modellerResult.data ?? []).map((model) => [model.id, model.seri_id])
  );

  const priceCountBySeri = new Map<string, number>();
  const categories = new Set<string>();

  for (const price of fiyatlarResult.data ?? []) {
    if (price.category) categories.add(price.category);
    const seriId = modelSeriMap.get(price.model_id);
    if (!seriId) continue;
    priceCountBySeri.set(seriId, (priceCountBySeri.get(seriId) ?? 0) + 1);
  }

  const serilerByMarka = new Map<string, TamirWizardMarkaOption["seriler"]>();
  for (const seri of serilerResult.data ?? []) {
    const list = serilerByMarka.get(seri.marka_id) ?? [];
    list.push({
      id: seri.id,
      name: seri.name,
      slug: seri.slug,
      marka_id: seri.marka_id,
      model_count: modelCountBySeri.get(seri.id) ?? 0,
      price_count: priceCountBySeri.get(seri.id) ?? 0,
    });
    serilerByMarka.set(seri.marka_id, list);
  }

  const markalar: TamirWizardMarkaOption[] = (markalarResult.data ?? []).map((marka) => ({
    id: marka.id,
    name: marka.name,
    slug: marka.slug,
    seriler: serilerByMarka.get(marka.id) ?? [],
  }));

  return {
    markalar,
    categories: [...categories].sort((a, b) => a.localeCompare(b, "tr")),
  };
}

export async function countTamirPricesForWizard(input: {
  seriIds: string[];
  category?: string;
}): Promise<{ count: number; error?: string }> {
  if (!input.seriIds.length) return { count: 0 };

  const supabase = await createClient();

  const { data: models, error: modelError } = await supabase
    .from("tamir_modelleri")
    .select("id")
    .in("seri_id", input.seriIds);

  if (modelError) return { count: 0, error: modelError.message };

  const modelIds = (models ?? []).map((model) => model.id);
  if (!modelIds.length) return { count: 0 };

  let query = supabase
    .from("tamir_fiyatlari")
    .select("id", { count: "exact", head: true })
    .in("model_id", modelIds);

  if (input.category?.trim()) {
    query = query.eq("category", input.category.trim());
  }

  const { count, error } = await query;
  if (error) return { count: 0, error: error.message };

  return { count: count ?? 0 };
}
