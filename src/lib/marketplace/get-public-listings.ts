import { parseLocationFromAdres } from "@/lib/dukkan/faq-placeholders";
import { PUBLIC_SECOND_HAND_DEVICE_SELECT } from "@/lib/dukkan/second-hand-devices";
import type { MarketplaceListing } from "@/lib/marketplace/public-listing.types";
import { createPublicClient } from "@/lib/supabase/public";

const MARKETPLACE_DEVICE_SELECT =
  `${PUBLIC_SECOND_HAND_DEVICE_SELECT}, user_id` as const;

const SHOP_SELECT =
  "id, user_id, slug, dukkan_adi, adres, whatsapp, telefon, logo_url, enlem, boylam, pazaryeri_vitrin_aktif" as const;

function buildLocationLabel(il: string | null, ilce: string | null): string | null {
  if (ilce && il) return `${ilce}, ${il}`;
  return il ?? ilce;
}

export async function getMarketplaceListings(): Promise<MarketplaceListing[]> {
  try {
    const supabase = createPublicClient();

    const { data: devices, error: devicesError } = await supabase
      .from("second_hand_devices_public")
      .select(MARKETPLACE_DEVICE_SELECT)
      .eq("web_published", true)
      .order("web_published_at", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false });

    if (devicesError || !devices?.length) {
      return [];
    }

    const userIds = [
      ...new Set(
        devices
          .map((device) => device.user_id)
          .filter((userId): userId is string => Boolean(userId))
      ),
    ];

    if (!userIds.length) return [];

    const { data: shops, error: shopsError } = await supabase
      .from("dukkanlar")
      .select(SHOP_SELECT)
      .eq("aktif", true)
      .eq("approval_status", "active")
      .in("user_id", userIds);

    if (shopsError || !shops?.length) {
      return [];
    }

    const shopByUserId = new Map(shops.map((shop) => [shop.user_id, shop] as const));
    const shopIds = shops.map((shop) => shop.id);

    // Fetch seller ratings
    const { data: ratings } = await supabase
      .from("seller_ratings_summary")
      .select("dukkan_id, average_rating, total_reviews")
      .in("dukkan_id", shopIds);

    const ratingsByShopId = new Map(
      (ratings ?? []).map((r) => [r.dukkan_id, { average_rating: r.average_rating, total_reviews: r.total_reviews }] as const)
    );

    const listings: MarketplaceListing[] = [];

    for (const device of devices) {
      if (!device.user_id || !device.id) continue;

      const shop = shopByUserId.get(device.user_id);
      if (!shop || shop.pazaryeri_vitrin_aktif === false) continue;

      const { il, ilce } = parseLocationFromAdres(shop.adres);
      const shopRating = ratingsByShopId.get(shop.id);

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
          averageRating: shopRating?.average_rating ?? null,
          totalReviews: shopRating?.total_reviews ?? null,
        },
        il,
        ilce,
        locationLabel: buildLocationLabel(il, ilce),
      });
    }

    return listings;
  } catch {
    return [];
  }
}
