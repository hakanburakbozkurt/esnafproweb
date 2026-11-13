import { parseLocationFromAdres } from "@/lib/dukkan/faq-placeholders";
import { PUBLIC_SECOND_HAND_DEVICE_SELECT } from "@/lib/dukkan/second-hand-devices";
import type { MarketplaceListing } from "@/lib/marketplace/public-listing.types";
import { createPublicClient } from "@/lib/supabase/public";

const MARKETPLACE_DEVICE_SELECT =
  `${PUBLIC_SECOND_HAND_DEVICE_SELECT}, user_id` as const;

const SHOP_SELECT =
  "user_id, slug, dukkan_adi, adres, whatsapp, telefon, logo_url, enlem, boylam, pazaryeri_vitrin_aktif" as const;

function buildLocationLabel(il: string | null, ilce: string | null): string | null {
  if (ilce && il) return `${ilce}, ${il}`;
  return il ?? ilce;
}

export type MarketplaceListingsResult = {
  listings: MarketplaceListing[];
  /** Veri katmanında gerçek bir sorgu hatası oluştu; boş liste "ilan yok" anlamına gelmez. */
  yuklenemedi: boolean;
};

/** Sayfalar için: hata ile boş liste birbirinden ayrılır. */
export async function getMarketplaceListingsResult(): Promise<MarketplaceListingsResult> {
  try {
    const supabase = createPublicClient();

    const { data: devices, error: devicesError } = await supabase
      .from("second_hand_devices_public")
      .select(MARKETPLACE_DEVICE_SELECT)
      .eq("web_published", true)
      .order("web_published_at", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false });

    if (devicesError) {
      console.error("[marketplace] devices query failed:", devicesError.message);
      return { listings: [], yuklenemedi: true };
    }
    if (!devices?.length) {
      return { listings: [], yuklenemedi: false };
    }

    const userIds = [
      ...new Set(
        devices
          .map((device) => device.user_id)
          .filter((userId): userId is string => Boolean(userId))
      ),
    ];

    if (!userIds.length) return { listings: [], yuklenemedi: false };

    const { data: shops, error: shopsError } = await supabase
      .from("dukkanlar")
      .select(SHOP_SELECT)
      .eq("aktif", true)
      .eq("approval_status", "active")
      .in("user_id", userIds);

    if (shopsError) {
      console.error("[marketplace] shops query failed:", shopsError.message);
      return { listings: [], yuklenemedi: true };
    }
    if (!shops?.length) {
      return { listings: [], yuklenemedi: false };
    }

    const shopByUserId = new Map(shops.map((shop) => [shop.user_id, shop] as const));

    const listings: MarketplaceListing[] = [];

    for (const device of devices) {
      if (!device.user_id || !device.id) continue;

      const shop = shopByUserId.get(device.user_id);
      if (!shop || shop.pazaryeri_vitrin_aktif === false) continue;

      const { il, ilce } = parseLocationFromAdres(shop.adres);

      listings.push({
        device,
        shop: {
          slug: shop.slug,
          dukkan_adi: shop.dukkan_adi,
          adres: shop.adres,
          whatsapp: shop.whatsapp,
          telefon: shop.telefon,
          logo_url: shop.logo_url,
          enlem: shop.enlem,
          boylam: shop.boylam,
        },
        il,
        ilce,
        locationLabel: buildLocationLabel(il, ilce),
      });
    }

    return { listings, yuklenemedi: false };
  } catch (error) {
    console.error("[marketplace] listings failed:", error);
    return { listings: [], yuklenemedi: true };
  }
}

export async function getMarketplaceListings(): Promise<MarketplaceListing[]> {
  return (await getMarketplaceListingsResult()).listings;
}
