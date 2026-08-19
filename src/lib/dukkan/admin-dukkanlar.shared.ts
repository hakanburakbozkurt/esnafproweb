import type { ShopApprovalStatus } from "@/lib/dukkan/approval-status";

export type AdminDukkanListItem = {
  id: string;
  dukkan_adi: string;
  slug: string;
  approval_status: ShopApprovalStatus;
  created_at: string;
  telefon: string | null;
  aktif: boolean;
};

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
