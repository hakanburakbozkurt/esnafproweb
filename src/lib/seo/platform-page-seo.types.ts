export type PlatformPageSeo = {
  page_path: string;
  label: string;
  meta_title: string;
  meta_description: string;
  meta_keywords: string | null;
  robots_index: boolean;
  robots_follow: boolean;
  sort_order: number;
  updated_at?: string;
};

export type PlatformPageSeoAdminRow = PlatformPageSeo & {
  isPersisted: boolean;
};

export type PlatformSeoAdminState = {
  error?: string;
  success?: string;
};

export const SEO_TITLE_MAX = 120;
export const SEO_DESCRIPTION_MAX = 320;
export const SEO_KEYWORDS_MAX = 500;
export const SEO_DESCRIPTION_IDEAL_MIN = 50;
export const SEO_DESCRIPTION_IDEAL_MAX = 160;
export const SEO_TITLE_IDEAL_MIN = 10;
export const SEO_TITLE_IDEAL_MAX = 70;
