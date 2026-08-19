import type { ShopApprovalStatus } from "@/lib/dukkan/approval-status";
import {
  SHOP_APPROVAL_STATUS_CONFIG,
  SHOP_SEO_PENDING_MESSAGE,
} from "@/lib/dukkan/approval-status";

type DukkanApprovalStatusBadgeProps = {
  status: ShopApprovalStatus;
  className?: string;
};

export function DukkanApprovalStatusBadge({
  status,
  className = "",
}: DukkanApprovalStatusBadgeProps) {
  const config = SHOP_APPROVAL_STATUS_CONFIG[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${config.badgeClassName} ${className}`}
    >
      <span aria-hidden>{config.dot}</span>
      {config.label}
    </span>
  );
}

type DukkanApprovalSeoNoticeProps = {
  status: ShopApprovalStatus;
};

export function DukkanApprovalSeoNotice({ status }: DukkanApprovalSeoNoticeProps) {
  if (status === "active") {
    return null;
  }

  return (
    <p className="rounded-2xl border border-slate-200/80 bg-slate-50 px-5 py-4 text-sm text-slate-600 lg:text-base">
      {SHOP_SEO_PENDING_MESSAGE}
    </p>
  );
}
