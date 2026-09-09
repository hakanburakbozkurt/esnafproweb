export type ShopSubscriptionTier = "free" | "pro";

export const DEFAULT_FREE_ACTION_LIMIT = 10;
export const PRO_DEFAULT_MONTHS = 12;

export type ShopSubscriptionAdminRow = {
  dukkan_id: string;
  dukkan_adi: string;
  slug: string;
  user_id: string;
  telefon: string | null;
  approval_status: string;
  tier: ShopSubscriptionTier;
  actions_used: number;
  actions_limit: number;
  expires_at: string | null;
  usage_devices: number;
  usage_blog: number;
  usage_servis: number;
  usage_total: number;
  isPersisted: boolean;
};

export type SubscriptionAdminState = {
  error?: string;
  success?: string;
};

export type TamirPriceWizardState = {
  error?: string;
  success?: string;
  updatedCount?: number;
};

export type TamirWizardSeriOption = {
  id: string;
  name: string;
  slug: string;
  marka_id: string;
  model_count: number;
  price_count: number;
};

export type TamirWizardMarkaOption = {
  id: string;
  name: string;
  slug: string;
  seriler: TamirWizardSeriOption[];
};
