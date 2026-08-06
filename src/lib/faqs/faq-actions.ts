"use server";

import { revalidatePath } from "next/cache";
import { getDefaultFaqsForContext } from "@/lib/faqs/defaults";
import type { FaqContext } from "@/lib/faqs/types";
import { createClient } from "@/lib/supabase/server";
import { isSuperAdminUser } from "@/lib/auth/super-admin";

export type FaqAdminState = {
  error?: string;
  success?: string;
};

function parseFaqContext(value: string): FaqContext {
  return value === "fiyatlandirma" ? "fiyatlandirma" : "anasayfa";
}

async function assertSuperAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !isSuperAdminUser(user)) {
    return { error: "Bu işlem için yetkiniz yok." as const, supabase: null };
  }

  return { error: null, supabase };
}

function revalidateFaqPaths() {
  revalidatePath("/");
  revalidatePath("/fiyatlandirma");
  revalidatePath("/yonetim/admin/sss");
}

export async function upsertFaq(
  _prev: FaqAdminState,
  formData: FormData
): Promise<FaqAdminState> {
  const auth = await assertSuperAdmin();
  if (auth.error || !auth.supabase) return { error: auth.error ?? "Yetki hatası." };

  const id = String(formData.get("id") ?? "").trim();
  const soru = String(formData.get("soru") ?? "").trim();
  const cevap = String(formData.get("cevap") ?? "").trim();
  const context = parseFaqContext(String(formData.get("context") ?? "anasayfa"));

  if (!soru || !cevap) {
    return { error: "Soru ve cevap zorunludur." };
  }

  const payload = {
    soru,
    cevap,
    context,
    sort_order: Number(formData.get("sort_order") ?? 0),
    is_active: formData.get("is_active") === "true",
    updated_at: new Date().toISOString(),
  };

  const { error } = id
    ? await auth.supabase.from("faqs").update(payload).eq("id", id)
    : await auth.supabase.from("faqs").insert(payload);

  if (error) {
    return { error: error.message };
  }

  revalidateFaqPaths();
  return { success: "SSS kaydedildi." };
}

export async function deleteFaqForm(
  _prev: FaqAdminState,
  formData: FormData
): Promise<FaqAdminState> {
  const auth = await assertSuperAdmin();
  if (auth.error || !auth.supabase) return { error: auth.error ?? "Yetki hatası." };

  const faqId = String(formData.get("faq_id") ?? "").trim();
  if (!faqId) {
    return { error: "Silinecek kayıt bulunamadı." };
  }

  const { error } = await auth.supabase.from("faqs").delete().eq("id", faqId);

  if (error) {
    return { error: error.message };
  }

  revalidateFaqPaths();
  return { success: "SSS silindi." };
}

export async function moveFaqForm(
  _prev: FaqAdminState,
  formData: FormData
): Promise<FaqAdminState> {
  const auth = await assertSuperAdmin();
  if (auth.error || !auth.supabase) return { error: auth.error ?? "Yetki hatası." };

  const faqId = String(formData.get("faq_id") ?? "").trim();
  const direction = String(formData.get("direction") ?? "");
  const context = parseFaqContext(String(formData.get("context") ?? "anasayfa"));

  if (!faqId || (direction !== "up" && direction !== "down")) {
    return { error: "Geçersiz sıralama isteği." };
  }

  const { data: rows, error: listError } = await auth.supabase
    .from("faqs")
    .select("id, sort_order")
    .eq("context", context)
    .order("sort_order", { ascending: true });

  if (listError || !rows?.length) {
    return { error: listError?.message ?? "SSS listesi alınamadı." };
  }

  const index = rows.findIndex((row) => row.id === faqId);
  if (index === -1) {
    return { error: "Kayıt bulunamadı." };
  }

  const targetIndex = direction === "up" ? index - 1 : index + 1;
  if (targetIndex < 0 || targetIndex >= rows.length) {
    return { success: "Sıra güncellendi." };
  }

  const current = rows[index];
  const neighbor = rows[targetIndex];

  const results = await Promise.all([
    auth.supabase
      .from("faqs")
      .update({ sort_order: neighbor.sort_order, updated_at: new Date().toISOString() })
      .eq("id", current.id),
    auth.supabase
      .from("faqs")
      .update({ sort_order: current.sort_order, updated_at: new Date().toISOString() })
      .eq("id", neighbor.id),
  ]);

  const updateError = results.find((result) => result.error)?.error;
  if (updateError) {
    return { error: updateError.message };
  }

  revalidateFaqPaths();
  return { success: "Sıra güncellendi." };
}

export async function seedDefaultFaqsForm(
  _prev: FaqAdminState,
  formData: FormData
): Promise<FaqAdminState> {
  const auth = await assertSuperAdmin();
  if (auth.error || !auth.supabase) return { error: auth.error ?? "Yetki hatası." };

  const context = parseFaqContext(String(formData.get("context") ?? "anasayfa"));

  const { count, error: countError } = await auth.supabase
    .from("faqs")
    .select("*", { count: "exact", head: true })
    .eq("context", context);

  if (countError) {
    return { error: countError.message };
  }

  if ((count ?? 0) > 0) {
    return {
      error: `Bu alan (${context}) için zaten SSS kayıtları var. Yalnızca boş alana aktarım yapılır.`,
    };
  }

  const payload = getDefaultFaqsForContext(context).map(
    ({ soru, cevap, sort_order, is_active, context: faqContext }) => ({
      soru,
      cevap,
      sort_order,
      is_active,
      context: faqContext,
    })
  );

  const { error } = await auth.supabase.from("faqs").insert(payload);

  if (error) {
    return { error: error.message };
  }

  revalidateFaqPaths();
  return { success: "Varsayılan SSS kayıtları aktarıldı." };
}
