import Link from "next/link";
import { DeviceListingBadges } from "@/components/marketplace/device-listing-badges";
import { DeviceListingImage } from "@/components/marketplace/device-listing-image";
import {
  formatSecondHandCondition,
  formatSecondHandPrice,
  getSecondHandDeviceHref,
  getSecondHandDeviceImage,
  getSecondHandDeviceTitle,
} from "@/lib/dukkan/second-hand-devices";
import { buildWhatsAppUrl, normalizeWhatsAppNumber } from "@/lib/dukkan/contact";
import type { GeoCoordinates } from "@/lib/geo/haversine";
import {
  getListingLocationBadgeLabel,
  shouldShowLocationSubtitle,
} from "@/lib/marketplace/listing-location-badge";
import type { MarketplaceListing } from "@/lib/marketplace/public-listing.types";
import { cn } from "@/lib/utils/cn";

const WHATSAPP_MESSAGE_PREFIX = "Merhaba, Esnaf Pro üzerindeki";

export function MarketplaceDeviceCard({
  listing,
  userCoords = null,
  className,
}: {
  listing: MarketplaceListing;
  userCoords?: GeoCoordinates | null;
  className?: string;
}) {
  const { device, shop } = listing;
  const title = getSecondHandDeviceTitle(device);
  const imageUrl = getSecondHandDeviceImage(device);
  const condition = formatSecondHandCondition(device.condition);
  const price = formatSecondHandPrice(device.sale_price);
  const detailHref = getSecondHandDeviceHref(shop.slug, device);
  const locationBadge = getListingLocationBadgeLabel(listing, userCoords);
  const showLocationSubtitle = shouldShowLocationSubtitle(listing, userCoords);
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
    <article
      className={cn(
        "overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-sm transition duration-300 hover:border-emerald-200 hover:shadow-md sm:rounded-2xl",
        className
      )}
    >
      <div className="flex min-w-0 flex-col sm:h-full">
        <div className="flex min-w-0 gap-3 p-3 sm:block sm:p-0">
          <Link
            href={detailHref}
            className="group relative block w-28 shrink-0 overflow-hidden rounded-lg sm:w-full sm:rounded-none"
          >
            <DeviceListingImage
              src={imageUrl}
              alt={title}
              aspect="4/3"
              className="rounded-lg sm:rounded-none"
              imgClassName="transition duration-500 group-hover:scale-[1.02]"
            />
            <div className="absolute left-1.5 top-1.5 sm:left-2.5 sm:top-2.5">
              <DeviceListingBadges
                condition={condition}
                deviceCategory={device.device_category}
                listingType={device.listing_type}
                locationBadge={locationBadge}
              />
            </div>
          </Link>

          <div className="flex min-w-0 flex-1 flex-col py-0.5 sm:border-t sm:border-slate-100 sm:p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <Link
                  href={`/${shop.slug}`}
                  className="truncate text-[10px] font-semibold uppercase tracking-[0.12em] text-emerald-600 hover:text-emerald-700 sm:text-[11px]"
                >
                  {shop.dukkan_adi}
                </Link>
                {showLocationSubtitle && listing.locationLabel && (
                  <p className="mt-0.5 truncate text-[11px] text-slate-400 sm:text-xs">
                    {listing.locationLabel}
                  </p>
                )}
              </div>
              <span
                className="hidden shrink-0 rounded-full border border-emerald-100 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 sm:inline"
                aria-label="Esnaf Pro üyesi"
              >
                Esnaf Pro
              </span>
            </div>

            <Link href={detailHref} className="mt-1 block min-w-0 sm:mt-2">
              <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-slate-900 transition hover:text-emerald-700 sm:text-base">
                {title}
              </h3>
            </Link>

            {(device.brand || device.model) && (
              <p className="mt-1 hidden truncate text-[11px] font-medium uppercase tracking-[0.1em] text-slate-400 sm:block">
                {[device.brand, device.model].filter(Boolean).join(" · ")}
              </p>
            )}

            <p className="mt-2 text-lg font-bold tracking-tight text-emerald-700 sm:mt-3 sm:text-xl">
              {price}
            </p>
          </div>
        </div>

        <div className="flex gap-2 border-t border-slate-100 px-3 pb-3 pt-2 sm:flex-col sm:gap-2 sm:px-4 sm:pb-4">
          <Link
            href={detailHref}
            className="inline-flex min-h-9 flex-1 items-center justify-center rounded-full border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:border-emerald-300 hover:text-emerald-600 sm:min-h-11 sm:w-full sm:text-sm"
          >
            Detay
          </Link>

          {whatsappHref ? (
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-9 flex-1 items-center justify-center gap-1.5 rounded-full bg-[#25D366] px-3 text-xs font-semibold text-white shadow-sm transition hover:bg-[#20bd5a] sm:min-h-11 sm:w-full sm:text-sm"
            >
              <WhatsAppIcon />
              <span className="truncate">WhatsApp</span>
            </a>
          ) : (
            <Link
              href={`/${shop.slug}/iletisim`}
              className="inline-flex min-h-9 flex-1 items-center justify-center rounded-full border border-slate-200 bg-slate-50 px-3 text-xs font-semibold text-slate-600 transition hover:border-emerald-200 hover:text-emerald-700 sm:min-h-11 sm:w-full sm:text-sm"
            >
              İletişim
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}

function WhatsAppIcon() {
  return (
    <svg className="size-4 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
    </svg>
  );
}
