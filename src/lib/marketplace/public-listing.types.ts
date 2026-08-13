import type { PublicSecondHandDevice } from "@/lib/dukkan/second-hand-devices";

export type MarketplaceShopInfo = {
  slug: string;
  dukkan_adi: string;
  adres: string | null;
  whatsapp: string | null;
  telefon: string | null;
  logo_url: string | null;
};

export type MarketplaceListing = {
  device: PublicSecondHandDevice;
  shop: MarketplaceShopInfo;
  il: string | null;
  ilce: string | null;
  locationLabel: string | null;
};

export type MarketplaceCategoryId =
  | "all"
  | "telefon"
  | "tablet"
  | "bilgisayar"
  | "akilli_saat"
  | "konsol";

export type MarketplaceSortId = "newest" | "price_asc" | "price_desc";
