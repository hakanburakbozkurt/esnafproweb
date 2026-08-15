import type { KatalogWebItem } from "@/types/database.types";

export function formatKatalogPrice(price: number | null | undefined): string {
  if (price == null || Number.isNaN(price)) return "Fiyat sorunuz";

  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(price);
}

export function getKatalogProductTitle(item: KatalogWebItem): string {
  return (
    item.product_name?.trim() ||
    [item.brand, item.model_name].filter(Boolean).join(" ") ||
    "Katalog Ürünü"
  );
}
