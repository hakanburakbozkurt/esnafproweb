import { IlanKarti } from "@/components/marketplace/ilan-karti";
import {
  formatSecondHandCondition,
  formatSecondHandPrice,
  getDeviceCategoryLabel,
  getListingTypeBadge,
  getSecondHandDeviceGorselleri,
  getSecondHandDeviceHref,
  getSecondHandDeviceTitle,
} from "@/lib/dukkan/second-hand-devices";
import { buildWhatsAppUrl, normalizeWhatsAppNumber } from "@/lib/dukkan/contact";
import type { GeoCoordinates } from "@/lib/geo/haversine";
import { getListingLocationBadgeLabel } from "@/lib/marketplace/listing-location-badge";
import type { MarketplaceListing } from "@/lib/marketplace/public-listing.types";

const WHATSAPP_MESSAGE_PREFIX = "Merhaba, Esnaf Pro üzerindeki";

export function MarketplaceDeviceCard({
  listing,
  userCoords = null,
  className,
  oncelikli = false,
}: {
  listing: MarketplaceListing;
  userCoords?: GeoCoordinates | null;
  className?: string;
  oncelikli?: boolean;
}) {
  const { device, shop } = listing;
  const title = getSecondHandDeviceTitle(device);
  const condition = formatSecondHandCondition(device.condition);
  const price = formatSecondHandPrice(device.sale_price);
  const detailHref = getSecondHandDeviceHref(shop.slug, device);
  const locationBadge = getListingLocationBadgeLabel(listing, userCoords);
  const contactNumber = shop.whatsapp ?? shop.telefon;
  const normalizedWhatsApp = contactNumber
    ? normalizeWhatsAppNumber(contactNumber)
    : null;
  const whatsappHref = normalizedWhatsApp
    ? buildWhatsAppUrl(
        normalizedWhatsApp,
        `${WHATSAPP_MESSAGE_PREFIX} ${title} ilanınız için yazıyorum...`
      )
    : null;

  return (
    <IlanKarti
      className={className}
      href={detailHref}
      baslik={title}
      fiyat={price}
      gorseller={getSecondHandDeviceGorselleri(device)}
      durumRozeti={getListingTypeBadge(device.listing_type)}
      magazaAdi={shop.dukkan_adi}
      magazaHref={`/${shop.slug}`}
      konum={locationBadge ?? listing.locationLabel}
      etiketler={[getDeviceCategoryLabel(device.device_category), condition].filter(
        (e): e is string => Boolean(e)
      )}
      whatsappHref={whatsappHref}
      iletisimHref={`/${shop.slug}/iletisim`}
      oncelikli={oncelikli}
    />
  );
}
