export type UrunStokBadge = {
  label: string;
  tone: "danger" | "warning" | "success";
};

/** stok_adedi: NULL rozet yok, 0 Tükendi, 1 Son 1 adet, >1 Stokta */
export function getUrunStokBadge(
  stok: number | string | null | undefined
): UrunStokBadge | null {
  if (stok === null || stok === undefined) return null;
  const raw = typeof stok === "number" ? String(stok) : stok.trim();
  if (!/^\d+$/.test(raw)) return null;

  const value = Number(raw);
  if (value === 0) return { label: "Tükendi", tone: "danger" };
  if (value === 1) return { label: "Son 1 adet", tone: "warning" };
  return { label: "Stokta", tone: "success" };
}

export const URUN_STOK_BADGE_CLASSES: Record<UrunStokBadge["tone"], string> = {
  danger: "bg-red-50 text-red-700 ring-red-600/15",
  warning: "bg-amber-50 text-amber-800 ring-amber-600/20",
  success: "bg-emerald-50 text-emerald-700 ring-emerald-600/15",
};
