import { Check, Handshake, ShieldCheck, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export type TrustBadgeItem = {
  key: string;
  label: string;
  /** Tek satıra sığan kısa yazı */
  shortLabel: string;
  icon: typeof ShieldCheck;
};

type TrustBadgesProps = {
  isVerifiedShop: boolean;
  hasWarranty?: boolean | null;
  listingType?: string | null;
  hasInvoice?: boolean | null;
  className?: string;
};

function resolveTrustBadges({
  isVerifiedShop,
  hasWarranty,
  listingType,
  hasInvoice,
}: Omit<TrustBadgesProps, "className">): TrustBadgeItem[] {
  const badges: TrustBadgeItem[] = [];

  if (isVerifiedShop || hasWarranty) {
    badges.push({
      key: "store-warranty",
      label: "Mağaza Garantili",
      shortLabel: "Garantili",
      icon: ShieldCheck,
    });
  }

  if (isVerifiedShop) {
    badges.push({
      key: "in-store-test",
      label: "Elden Test İmkanı",
      shortLabel: "Elden test",
      icon: Handshake,
    });
  }

  if (listingType === "new" || hasInvoice) {
    badges.push({
      key: "original",
      label: "Orijinal Ürün",
      shortLabel: "Orijinal ürün",
      icon: Sparkles,
    });
  }

  if (!badges.length && isVerifiedShop) {
    badges.push(
      {
        key: "store-warranty",
        label: "Mağaza Garantili",
      shortLabel: "Garantili",
        icon: ShieldCheck,
      },
      {
        key: "in-store-test",
        label: "Elden Test İmkanı",
      shortLabel: "Elden test",
        icon: Handshake,
      }
    );
  }

  return badges;
}

export function TrustBadges({
  isVerifiedShop,
  hasWarranty,
  listingType,
  hasInvoice,
  className,
}: TrustBadgesProps) {
  const badges = resolveTrustBadges({
    isVerifiedShop,
    hasWarranty,
    listingType,
    hasInvoice,
  });

  if (!badges.length) return null;

  return (
    <ul
      className={cn(
        "flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium text-neutral-600 sm:text-sm",
        className
      )}
      aria-label="Güven rozetleri"
    >
      {badges.map((badge) => (
        <li key={badge.key} className="inline-flex items-center gap-1 whitespace-nowrap">
          <Check className="size-3.5 shrink-0 text-emerald-600" strokeWidth={3} aria-hidden />
          <span title={badge.label}>{badge.shortLabel}</span>
        </li>
      ))}
    </ul>
  );
}
