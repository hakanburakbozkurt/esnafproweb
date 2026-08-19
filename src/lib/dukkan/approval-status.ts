export type ShopApprovalStatus = "active" | "pending" | "rejected";

export const SHOP_APPROVAL_STATUS_CONFIG: Record<
  ShopApprovalStatus,
  {
    label: string;
    dot: string;
    badgeClassName: string;
  }
> = {
  active: {
    label: "Aktif",
    dot: "🟢",
    badgeClassName:
      "border-emerald-200 bg-emerald-50 text-emerald-800",
  },
  pending: {
    label: "İncelemede",
    dot: "🟠",
    badgeClassName:
      "border-amber-200 bg-amber-50 text-amber-800",
  },
  rejected: {
    label: "Reddedildi",
    dot: "🔴",
    badgeClassName:
      "border-rose-200 bg-rose-50 text-rose-800",
  },
};

export const SHOP_SEO_PENDING_MESSAGE =
  "Slug adresiniz onaylandıktan sonra SEO durumunuz aktif olacaktır.";

export function isShopSeoIndexable(
  status: ShopApprovalStatus | null | undefined
): boolean {
  return status === "active";
}

export function normalizeShopApprovalStatus(
  value: string | null | undefined
): ShopApprovalStatus {
  if (value === "active" || value === "pending" || value === "rejected") {
    return value;
  }
  return "pending";
}
