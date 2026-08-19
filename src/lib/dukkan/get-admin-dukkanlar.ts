import type { AdminDukkanListItem } from "@/lib/dukkan/admin-dukkanlar.shared";
import { createClient } from "@/lib/supabase/server";

export type { AdminDukkanListItem } from "@/lib/dukkan/admin-dukkanlar.shared";
export { countDukkanlarByApprovalStatus } from "@/lib/dukkan/admin-dukkanlar.shared";

export async function getAdminDukkanlar(): Promise<AdminDukkanListItem[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("dukkanlar")
    .select("id, dukkan_adi, slug, approval_status, created_at, telefon, aktif")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[getAdminDukkanlar]", error.message);
    return [];
  }

  return (data ?? []).map((row) => ({
    ...row,
    approval_status: row.approval_status as AdminDukkanListItem["approval_status"],
  }));
}
