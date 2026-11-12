import { Check, ShieldCheck, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export type TrustBadgeItem = {
  key: string;
  label: string;
  /** Tek satıra sığan kısa yazı */
  shortLabel: string;
  icon: typeof ShieldCheck;
};

type TrustBadgesProps = {
  /** İlanın kendi garanti beyanı (satıcının girdiği değer). Mağaza onayı garanti anlamına gelmez. */
  hasWarranty?: boolean | null;
  /** Satıcının beyan ettiği ilan durumu. Yalnızca "new" sıfır ürün anlamına gelir. */
  listingType?: string | null;
  className?: string;
};

/**
 * Rozetler yalnızca ilanın kendi verisinden çıkar. Mağaza onayı ya da fatura
 * yüklenmesi tek başına rozet üretmez (yanıltıcı olmasın diye).
 * "Elden test imkanı" için ilan bazlı bir alan olmadığından gösterilmez.
 */
function resolveTrustBadges({
  hasWarranty,
  listingType,
}: Omit<TrustBadgesProps, "className">): TrustBadgeItem[] {
  const badges: TrustBadgeItem[] = [];

  if (hasWarranty === true) {
    badges.push({
      key: "store-warranty",
      label: "Garantili",
      shortLabel: "Garantili",
      icon: ShieldCheck,
    });
  }

  if (listingType === "new") {
    badges.push({
      key: "original",
      label: "Sıfır ürün",
      shortLabel: "Sıfır ürün",
      icon: Sparkles,
    });
  }

  return badges;
}

export function TrustBadges({ hasWarranty, listingType, className }: TrustBadgesProps) {
  const badges = resolveTrustBadges({ hasWarranty, listingType });

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
