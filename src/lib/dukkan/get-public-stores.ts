import { createClient } from "@/lib/supabase/server";
import {
  FOOTER_STORES_LIMIT,
  LANDING_STORES_DESKTOP_LIMIT,
  type PublicStoreCard,
} from "@/lib/dukkan/public-store.types";

export type { PublicStoreCard } from "@/lib/dukkan/public-store.types";
export {
  FOOTER_STORES_LIMIT,
  LANDING_STORES_DESKTOP_LIMIT,
  LANDING_STORES_MOBILE_LIMIT,
} from "@/lib/dukkan/public-store.types";

const STORE_CARD_SELECT =
  "id, slug, dukkan_adi, logo_url, aciklama" as const;

export async function getFeaturedStoresForLanding(): Promise<{
  stores: PublicStoreCard[];
  hasMore: boolean;
}> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("dukkanlar")
      .select(STORE_CARD_SELECT)
      .eq("aktif", true)
      .eq("approval_status", "active")
      .order("created_at", { ascending: false })
      .limit(LANDING_STORES_DESKTOP_LIMIT + 1);

    if (error || !data?.length) {
      return { stores: [], hasMore: false };
    }

    const hasMore = data.length > LANDING_STORES_DESKTOP_LIMIT;
    return {
      stores: data.slice(0, LANDING_STORES_DESKTOP_LIMIT),
      hasMore,
    };
  } catch {
    return { stores: [], hasMore: false };
  }
}

export async function getAllActivePublicStores(): Promise<PublicStoreCard[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("dukkanlar")
      .select(STORE_CARD_SELECT)
      .eq("aktif", true)
      .eq("approval_status", "active")
      .order("created_at", { ascending: false })
      .limit(200);

    if (error || !data) return [];
    return data;
  } catch {
    return [];
  }
}

export async function getFooterStores(): Promise<{
  stores: PublicStoreCard[];
  hasMore: boolean;
}> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("dukkanlar")
      .select(STORE_CARD_SELECT)
      .eq("aktif", true)
      .eq("approval_status", "active")
      .order("created_at", { ascending: false })
      .limit(FOOTER_STORES_LIMIT + 1);

    if (error || !data?.length) {
      return { stores: [], hasMore: false };
    }

    const hasMore = data.length > FOOTER_STORES_LIMIT;
    return {
      stores: data.slice(0, FOOTER_STORES_LIMIT),
      hasMore,
    };
  } catch {
    return { stores: [], hasMore: false };
  }
}
