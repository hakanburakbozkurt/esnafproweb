import Link from "next/link";
import {
  formatSecondHandCondition,
  formatSecondHandPrice,
  getSecondHandDeviceHref,
  getSecondHandDeviceImage,
  getSecondHandDeviceTitle,
} from "@/lib/dukkan/second-hand-devices";
import { buildWhatsAppUrl, normalizeWhatsAppNumber } from "@/lib/dukkan/contact";
import { getPlaceholderDistanceKm } from "@/lib/marketplace/marketplace-filters";
import type { MarketplaceListing } from "@/lib/marketplace/public-listing.types";
import { cn } from "@/lib/utils/cn";

const WHATSAPP_MESSAGE_PREFIX =
  "Merhaba, Esnaf Pro üzerindeki";

export function MarketplaceDeviceCard({
  listing,
  className,
}: {
  listing: MarketplaceListing;
  className?: string;
}) {
  const { device, shop, locationLabel } = listing;
  const title = getSecondHandDeviceTitle(device);
  const imageUrl = getSecondHandDeviceImage(device);
  const condition = formatSecondHandCondition(device.condition);
  const price = formatSecondHandPrice(device.sale_price);
  const detailHref = getSecondHandDeviceHref(shop.slug, device);
  const distanceLabel = getPlaceholderDistanceKm(device.id ?? shop.slug);
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
        "flex h-full min-w-0 w-full flex-col overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md sm:rounded-2xl",
        className
      )}
    >
      <Link href={detailHref} className="group block min-w-0">
        <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageUrl}
              alt={title}
              className="h-full w-full object-cover object-center transition duration-500 group-hover:scale-[1.02]"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs text-slate-400 sm:text-sm">
              Görsel yok
            </div>
          )}

          <div className="absolute left-2 top-2 flex flex-wrap gap-1.5 sm:left-3 sm:top-3">
            <span className="rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 shadow-sm backdrop-blur-sm sm:px-3 sm:py-1 sm:text-xs">
              {condition}
            </span>
            <span className="rounded-full bg-slate-900/75 px-2 py-0.5 text-[10px] font-semibold text-white shadow-sm backdrop-blur-sm sm:px-3 sm:py-1 sm:text-xs">
              {distanceLabel}
            </span>
          </div>
        </div>
      </Link>

      <div className="flex min-w-0 flex-1 flex-col border-t border-slate-100 px-3 py-3 sm:px-4 sm:py-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <Link
              href={`/${shop.slug}`}
              className="truncate text-[11px] font-semibold uppercase tracking-[0.12em] text-emerald-600 hover:text-emerald-700"
            >
              {shop.dukkan_adi}
            </Link>
            {locationLabel && (
              <p className="mt-1 truncate text-xs text-slate-400">{locationLabel}</p>
            )}
          </div>
          <div
            className="shrink-0 rounded-full border border-emerald-100 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700"
            aria-label="Esnaf Pro üyesi"
          >
            Esnaf Pro Üyesi
          </div>
        </div>

        <Link href={detailHref} className="mt-2 block min-w-0">
          <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-slate-900 transition hover:text-emerald-700 sm:text-base">
            {title}
          </h3>
        </Link>

        {(device.brand || device.model) && (
          <p className="mt-1 truncate text-[11px] font-medium uppercase tracking-[0.1em] text-slate-400">
            {[device.brand, device.model].filter(Boolean).join(" · ")}
          </p>
        )}

        <div className="mt-auto space-y-2.5 pt-3 sm:space-y-3 sm:pt-4">
          <p className="text-lg font-bold tracking-tight text-emerald-700 sm:text-xl">
            {price}
          </p>

          <div className="flex flex-col gap-1.5 sm:gap-2">
            <Link
              href={detailHref}
              className="inline-flex min-h-9 w-full items-center justify-center rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-emerald-300 hover:text-emerald-600 sm:min-h-11 sm:text-sm"
            >
              Detayları Gör
            </Link>

            {whatsappHref ? (
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-9 w-full items-center justify-center gap-1.5 rounded-full bg-[#25D366] px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-[#20bd5a] sm:min-h-11 sm:gap-2 sm:text-sm"
              >
                <WhatsAppIcon />
                <span className="truncate">WhatsApp ile Bilgi Al</span>
              </a>
            ) : (
              <Link
                href={`/${shop.slug}/iletisim`}
                className="inline-flex min-h-9 w-full items-center justify-center rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-emerald-200 hover:text-emerald-700 sm:min-h-11 sm:text-sm"
              >
                Mağaza İletişim
              </Link>
            )}
          </div>
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
