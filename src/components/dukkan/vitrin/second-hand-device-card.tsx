import Link from "next/link";
import { IlanKarti } from "@/components/marketplace/ilan-karti";
import {
  formatSecondHandCondition,
  formatSecondHandPrice,
  getDeviceCategoryLabel,
  getListingTypeBadge,
  getSecondHandDeviceGorselleri,
  getSecondHandDeviceHref,
  getSecondHandDeviceTitle,
  type PublicSecondHandDevice,
} from "@/lib/dukkan/second-hand-devices";
import { buildWhatsAppUrl, normalizeWhatsAppNumber } from "@/lib/dukkan/contact";

type SecondHandDeviceCardProps = {
  device: PublicSecondHandDevice;
  shopSlug: string;
  shopName: string;
  whatsapp: string | null;
  className?: string;
};

export function SecondHandDeviceCard({
  device,
  shopSlug,
  shopName,
  whatsapp,
  className,
}: SecondHandDeviceCardProps) {
  const title = getSecondHandDeviceTitle(device);
  const condition = formatSecondHandCondition(device.condition);
  const price = formatSecondHandPrice(device.sale_price);
  const detailHref = getSecondHandDeviceHref(shopSlug, device);
  const normalizedWhatsApp = whatsapp ? normalizeWhatsAppNumber(whatsapp) : null;
  const whatsappHref = normalizedWhatsApp
    ? buildWhatsAppUrl(
        normalizedWhatsApp,
        `Merhaba ${shopName}, "${title}" ilanı hakkında bilgi almak istiyorum.`
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
      etiketler={[getDeviceCategoryLabel(device.device_category), condition].filter(
        (e): e is string => Boolean(e)
      )}
      whatsappHref={whatsappHref}
      iletisimHref={`/${shopSlug}/iletisim`}
    />
  );
}
