"use server";

import { revalidatePath } from "next/cache";
import { isSuperAdminUser } from "@/lib/auth/super-admin";
import type { ShopApprovalStatus } from "@/lib/dukkan/approval-status";
import { revalidateSitemap } from "@/lib/seo/sitemap-cache";
import { createClient } from "@/lib/supabase/server";

export type DukkanApprovalAdminState = {
  error?: string;
  success?: string;
};

function parseApprovalStatus(value: string): ShopApprovalStatus | null {
  if (value === "active" || value === "pending" || value === "rejected") {
    return value;
  }
  return null;
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

function revalidateDukkanApprovalPaths(slug: string) {
  revalidatePath(`/${slug}`);
  revalidatePath(`/${slug}/iletisim`);
  revalidatePath(`/${slug}/teknik-servis`);
  revalidatePath(`/${slug}/hakkimizda`);
  revalidatePath(`/${slug}/blog`);
  revalidatePath(`/${slug}/pazaryeri`);
  revalidatePath(`/${slug}/katalog`);
  revalidatePath("/dukkan-ayarlari");
  revalidatePath("/esnaflar");
  revalidatePath("/yonetim/admin");
  revalidatePath("/yonetim/admin/dukkan-onay");
  revalidateSitemap();
}

export async function setDukkanApprovalStatus(
  _prev: DukkanApprovalAdminState,
  formData: FormData
): Promise<DukkanApprovalAdminState> {
  const auth = await assertSuperAdmin();
  if (auth.error || !auth.supabase) {
    return { error: auth.error ?? "Yetki hatası." };
  }

  const dukkanId = String(formData.get("dukkan_id") ?? "").trim();
  const approvalStatus = parseApprovalStatus(
    String(formData.get("approval_status") ?? "").trim()
  );

  if (!dukkanId) {
    return { error: "Geçersiz dükkan kaydı." };
  }

  if (!approvalStatus) {
    return { error: "Geçersiz onay statüsü." };
  }

  const { data: current, error: fetchError } = await auth.supabase
    .from("dukkanlar")
    .select("slug, approval_status")
    .eq("id", dukkanId)
    .maybeSingle();

  if (fetchError) {
    return { error: fetchError.message };
  }

  if (!current) {
    return { error: "Dükkan bulunamadı." };
  }

  if (current.approval_status === approvalStatus) {
    return { success: "Statü zaten güncel." };
  }

  const { error: updateError } = await auth.supabase
    .from("dukkanlar")
    .update({
      approval_status: approvalStatus,
      updated_at: new Date().toISOString(),
    })
    .eq("id", dukkanId);

  if (updateError) {
    return { error: updateError.message };
  }

  revalidateDukkanApprovalPaths(current.slug);

  const label =
    approvalStatus === "active"
      ? "onaylandı"
      : approvalStatus === "rejected"
        ? "reddedildi"
        : "incelemeye alındı";

  return { success: `Dükkan ${label}.` };
}

export async function approveDukkanForm(
  prev: DukkanApprovalAdminState,
  formData: FormData
): Promise<DukkanApprovalAdminState> {
  formData.set("approval_status", "active");
  return setDukkanApprovalStatus(prev, formData);
}

export async function rejectDukkanForm(
  prev: DukkanApprovalAdminState,
  formData: FormData
): Promise<DukkanApprovalAdminState> {
  formData.set("approval_status", "rejected");
  return setDukkanApprovalStatus(prev, formData);
}

export async function pendingDukkanForm(
  prev: DukkanApprovalAdminState,
  formData: FormData
): Promise<DukkanApprovalAdminState> {
  formData.set("approval_status", "pending");
  return setDukkanApprovalStatus(prev, formData);
}
