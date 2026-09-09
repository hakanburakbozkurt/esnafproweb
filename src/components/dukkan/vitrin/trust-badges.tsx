import { Handshake, ShieldCheck, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export type TrustBadgeItem = {
  key: string;
  label: string;
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
      icon: ShieldCheck,
    });
  }

  if (isVerifiedShop) {
    badges.push({
      key: "in-store-test",
      label: "Elden Test İmkanı",
      icon: Handshake,
    });
  }

  if (listingType === "new" || hasInvoice) {
    badges.push({
      key: "original",
      label: "Orijinal Ürün",
      icon: Sparkles,
    });
  }

  if (!badges.length && isVerifiedShop) {
    badges.push(
      {
        key: "store-warranty",
        label: "Mağaza Garantili",
        icon: ShieldCheck,
      },
      {
        key: "in-store-test",
        label: "Elden Test İmkanı",
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
        "flex flex-wrap gap-2",
        className
      )}
      aria-label="Güven rozetleri"
    >
      {badges.map((badge) => {
        const Icon = badge.icon;
        return (
          <li key={badge.key}>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50/80 px-3 py-1.5 text-xs font-semibold text-emerald-800">
              <Icon className="size-3.5 shrink-0 text-emerald-600" aria-hidden />
              {badge.label}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
