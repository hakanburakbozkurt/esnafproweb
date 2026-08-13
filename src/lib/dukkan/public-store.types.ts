export type PublicStoreCard = {
  id: string;
  slug: string;
  dukkan_adi: string;
  logo_url: string | null;
  aciklama: string | null;
};

export const LANDING_STORES_DESKTOP_LIMIT = 8;
export const LANDING_STORES_MOBILE_LIMIT = 6;
export const FOOTER_STORES_LIMIT = 10;
