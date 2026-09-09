"use server";

import { revalidatePath } from "next/cache";
import type { TamirPriceWizardState } from "@/lib/local-yonetim/subscriptions/types";
import { isSuperAdminUser } from "@/lib/auth/super-admin";
import { createClient } from "@/lib/supabase/server";

async function assertTamirWizardAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !isSuperAdminUser(user)) {
    return { error: "Bu işlem için süper admin yetkisi gerekir." as const, supabase: null };
  }

  return { error: null, supabase };
}

function computeAdjustedPrice(
  current: number,
  adjustmentType: "percent" | "fixed",
  value: number,
  direction: "increase" | "decrease"
): number {
  const sign = direction === "increase" ? 1 : -1;

  let next =
    adjustmentType === "percent"
      ? current * (1 + (sign * value) / 100)
      : current + sign * value;

  if (!Number.isFinite(next)) next = current;
  next = Math.max(0, Math.round(next));
  return next;
}

export async function applyTamirBulkPriceAdjustmentForm(
  _prev: TamirPriceWizardState,
  formData: FormData
): Promise<TamirPriceWizardState> {
  const auth = await assertTamirWizardAdmin();
  if (auth.error || !auth.supabase) return { error: auth.error ?? "Yetki hatası." };

  const seriIds = formData
    .getAll("seri_ids")
    .map((value) => String(value).trim())
    .filter(Boolean);

  if (!seriIds.length) {
    return { error: "En az bir seri seçmelisiniz." };
  }

  const category = String(formData.get("category") ?? "").trim();
  const adjustmentType = String(formData.get("adjustment_type") ?? "percent");
  const direction = String(formData.get("direction") ?? "increase");
  const rawValue = Number(formData.get("adjustment_value") ?? 0);

  if (adjustmentType !== "percent" && adjustmentType !== "fixed") {
    return { error: "Geçersiz ayarlama tipi." };
  }

  if (direction !== "increase" && direction !== "decrease") {
    return { error: "Geçersiz yön." };
  }

  if (!Number.isFinite(rawValue) || rawValue <= 0) {
    return { error: "Geçerli bir artış/azalış değeri girin." };
  }

  if (adjustmentType === "percent" && rawValue > 100 && direction === "decrease") {
    return { error: "Yüzde azaltma en fazla 100 olabilir." };
  }

  const { data: models, error: modelError } = await auth.supabase
    .from("tamir_modelleri")
    .select("id")
    .in("seri_id", seriIds);

  if (modelError) return { error: modelError.message };

  const modelIds = (models ?? []).map((model) => model.id);
  if (!modelIds.length) {
    return { error: "Seçilen serilerde model bulunamadı." };
  }

  let priceQuery = auth.supabase
    .from("tamir_fiyatlari")
    .select("id, price")
    .in("model_id", modelIds);

  if (category) {
    priceQuery = priceQuery.eq("category", category);
  }

  const { data: prices, error: priceError } = await priceQuery;
  if (priceError) return { error: priceError.message };
  if (!prices?.length) {
    return { error: "Güncellenecek fiyat kaydı bulunamadı." };
  }

  let updatedCount = 0;
  const batchSize = 50;

  for (let i = 0; i < prices.length; i += batchSize) {
    const batch = prices.slice(i, i + batchSize);
    const updates = await Promise.all(
      batch.map(async (row) => {
        const nextPrice = computeAdjustedPrice(
          Number(row.price),
          adjustmentType,
          rawValue,
          direction
        );

        if (nextPrice === Number(row.price)) return null;

        const { error } = await auth.supabase!
          .from("tamir_fiyatlari")
          .update({ price: nextPrice })
          .eq("id", row.id);

        if (error) throw new Error(error.message);
        return row.id;
      })
    );

    updatedCount += updates.filter(Boolean).length;
  }

  revalidatePath("/tamir-fiyati");
  revalidatePath("/local-yonetim/fiyat-sihirbazi");

  return {
    success: `${updatedCount} tamir fiyat kaydı güncellendi.`,
    updatedCount,
  };
}
