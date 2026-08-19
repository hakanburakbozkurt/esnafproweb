import type { ShopApprovalStatus } from "@/lib/dukkan/approval-status";
import { createClient } from "@/lib/supabase/server";

export type AdminDukkanListItem = {
  id: string;
  dukkan_adi: string;
  slug: string;
  approval_status: ShopApprovalStatus;
  created_at: string;
  telefon: string | null;
  aktif: boolean;
};

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
    approval_status: row.approval_status as ShopApprovalStatus,
  }));
}

export function countDukkanlarByApprovalStatus(
  dukkanlar: AdminDukkanListItem[]
): Record<ShopApprovalStatus, number> {
  return dukkanlar.reduce(
    (counts, dukkan) => {
      counts[dukkan.approval_status] += 1;
      return counts;
    },
    { active: 0, pending: 0, rejected: 0 } satisfies Record<
      ShopApprovalStatus,
      number
    >
  );
}
