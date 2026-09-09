"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  BadgeCheck,
  MapPin,
  Navigation,
} from "lucide-react";
import { ScrollReveal } from "@/components/motion/scroll-reveal";
import { DeviceDetailActionBar } from "@/components/dukkan/vitrin/device-detail-action-bar";
import { InstallmentOptionsCard } from "@/components/dukkan/vitrin/installment-modal";
import { SecondHandDeviceGallery } from "@/components/dukkan/vitrin/second-hand-device-gallery";
import { SecondHandExpertiseReport } from "@/components/dukkan/vitrin/second-hand-expertise-report";
import { TrustBadges } from "@/components/dukkan/vitrin/trust-badges";
import { buildWhatsAppUrl, normalizeWhatsAppNumber } from "@/lib/dukkan/contact";
import {
  appendSecondHandDeviceUrlToWhatsAppMessage,
  buildSecondHandDeviceInquiryWhatsAppMessage,
  buildSecondHandDevicePublicUrl,
  canShowDeviceInstallmentOptions,
  formatSecondHandPrice,
  getDeviceConditionWarnings,
  getSecondHandDeviceImages,
  getSecondHandDeviceSpecRows,
  getSecondHandDeviceTitle,
  type PublicSecondHandDeviceDetail,
} from "@/lib/dukkan/second-hand-devices";
import { buildGoogleMapsDirectionsUrl } from "@/lib/dukkan/map-navigation";
import {
  formatDistanceLabel,
  haversineDistanceKm,
  hasValidCoordinates,
} from "@/lib/geo/haversine";
import { useUserGeolocation } from "@/lib/marketplace/use-user-geolocation";
import { desktopContainerClass } from "@/lib/utils/layout";
import type { Dukkan } from "@/types/database.types";
import { VitrinDotGrid } from "@/components/dukkan/vitrin/vitrin-open-section";

type SecondHandDeviceDetailContentProps = {
  dukkan: Dukkan;
  device: PublicSecondHandDeviceDetail;
};

export function SecondHandDeviceDetailContent({
  dukkan,
  device,
}: SecondHandDeviceDetailContentProps) {
  const title = getSecondHandDeviceTitle(device);
  const images = getSecondHandDeviceImages(device);
  const price = formatSecondHandPrice(device.sale_price);
  const specRows = getSecondHandDeviceSpecRows(device);
  const conditionWarnings = getDeviceConditionWarnings(device);
  const { coords: userCoords } = useUserGeolocation();

  const distanceLabel =
    hasValidCoordinates(dukkan.enlem, dukkan.boylam) && userCoords
      ? formatDistanceLabel(
          haversineDistanceKm(userCoords, {
            lat: dukkan.enlem!,
            lng: dukkan.boylam!,
          })
        )
      : null;

  const mapsNavigationUrl = buildGoogleMapsDirectionsUrl({
    enlem: dukkan.enlem,
    boylam: dukkan.boylam,
    adres: dukkan.adres,
  });

  const normalizedWhatsApp = dukkan.whatsapp
    ? normalizeWhatsAppNumber(dukkan.whatsapp)
    : null;

  const [devicePublicUrl, setDevicePublicUrl] = useState(() =>
    buildSecondHandDevicePublicUrl(dukkan.slug, device)
  );

  useEffect(() => {
    setDevicePublicUrl(
      buildSecondHandDevicePublicUrl(dukkan.slug, device, window.location.origin)
    );
  }, [dukkan.slug, device.id, device.web_slug]);

  const whatsappHref = useMemo(() => {
    if (!normalizedWhatsApp) return null;
    return buildWhatsAppUrl(
      normalizedWhatsApp,
      buildSecondHandDeviceInquiryWhatsAppMessage(title, devicePublicUrl)
    );
  }, [normalizedWhatsApp, title, devicePublicUrl]);

  const tradeWhatsAppHref = useMemo(() => {
    if (!normalizedWhatsApp) return null;
    return buildWhatsAppUrl(
      normalizedWhatsApp,
      appendSecondHandDeviceUrlToWhatsAppMessage(
        `Merhaba, ${title} ilanı için fiyat teklifi veya takas hakkında bilgi almak istiyorum.`,
        devicePublicUrl
      )
    );
  }, [normalizedWhatsApp, title, devicePublicUrl]);

  const reservationHref = useMemo(() => {
    if (!normalizedWhatsApp) return null;
    return buildWhatsAppUrl(
      normalizedWhatsApp,
      appendSecondHandDeviceUrlToWhatsAppMessage(
        `Merhaba, ${title} ilanı için rezervasyon / satın alma talebi oluşturmak istiyorum. Uygunluğu ve ödeme seçeneklerini paylaşabilir misiniz?`,
        devicePublicUrl
      )
    );
  }, [normalizedWhatsApp, title, devicePublicUrl]);

  const isVerifiedShop = dukkan.approval_status === "active";
  const showInstallmentOptions = canShowDeviceInstallmentOptions(device);

  return (
    <div className={`${desktopContainerClass} relative pb-10 pt-8 lg:pb-16 lg:pt-12`}>
      <VitrinDotGrid />

      <ScrollReveal>
        <Link
          href={`/${dukkan.slug}/pazaryeri`}
          className="inline-flex items-center gap-1 text-sm font-medium text-neutral-500 transition hover:text-emerald-600"
        >
          ← Pazaryeri
        </Link>
      </ScrollReveal>

      <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-14 xl:gap-16">
        <ScrollReveal>
          <SecondHandDeviceGallery images={images} altPrefix={title} />
        </ScrollReveal>

        <ScrollReveal delay={0.04}>
          <div className="flex h-full flex-col">
            <div className="rounded-3xl border border-neutral-100 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href={`/${dukkan.slug}`}
                  className="text-sm font-semibold text-emerald-700 transition hover:text-emerald-800"
                >
                  {dukkan.dukkan_adi}
                </Link>
                {isVerifiedShop && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 ring-1 ring-emerald-100">
                    <BadgeCheck className="size-3.5" aria-hidden />
                    Onaylı Mağaza
                  </span>
                )}
                {!isVerifiedShop && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-neutral-50 px-2.5 py-1 text-[11px] font-semibold text-neutral-600 ring-1 ring-neutral-100">
                    Esnaf Pro
                  </span>
                )}
              </div>

              {mapsNavigationUrl && (
                <a
                  href={mapsNavigationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 flex w-full items-center gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/60 px-3.5 py-3 text-sm transition hover:border-emerald-200 hover:bg-emerald-50"
                  aria-label={
                    distanceLabel
                      ? `${distanceLabel} — mağaza konumunu haritada aç`
                      : "Mağaza konumunu haritada aç"
                  }
                >
                  <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-600 shadow-sm ring-1 ring-emerald-100">
                    <MapPin className="size-4" aria-hidden />
                  </span>
                  <span className="min-w-0 flex-1">
                    {distanceLabel ? (
                      <span className="font-semibold text-emerald-700">{distanceLabel}</span>
                    ) : (
                      <span className="font-semibold text-emerald-700">Haritada aç</span>
                    )}
                    <span className="mt-0.5 block text-xs text-emerald-700/70">
                      Yol tarifi al
                    </span>
                  </span>
                  <Navigation className="size-4 shrink-0 text-emerald-600" aria-hidden />
                </a>
              )}

              <h1 className="mt-4 text-xl font-bold tracking-tight text-neutral-900 sm:text-2xl">
                {title}
              </h1>

              <p className="mt-4 text-2xl font-bold tracking-tight text-emerald-700 sm:text-3xl">
                {price}
              </p>

              {showInstallmentOptions && (
                <InstallmentOptionsCard
                  className="mt-4"
                  acceptsInstallments
                  salePrice={device.sale_price}
                  productTitle={title}
                />
              )}

              <TrustBadges
                className="mt-4"
                isVerifiedShop={isVerifiedShop}
                hasWarranty={device.has_warranty}
                listingType={device.listing_type}
                hasInvoice={device.has_invoice}
              />
            </div>

            {conditionWarnings.length > 0 && (
              <div className="mt-5 space-y-3">
                {conditionWarnings.map((warning) => (
                  <div
                    key={warning.key}
                    className="rounded-3xl border border-amber-200/80 bg-amber-50/70 p-4 shadow-sm sm:p-5"
                  >
                    <div className="flex items-start gap-3">
                      <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
                        <AlertTriangle className="size-4" aria-hidden />
                      </span>
                      <div className="min-w-0">
                        <h2 className="text-sm font-bold text-amber-900">
                          {warning.title}
                        </h2>
                        <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-amber-950/80">
                          {warning.content}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {specRows.length > 0 && (
              <div className="mt-5 rounded-3xl border border-neutral-100 bg-white p-5 shadow-sm sm:p-6">
                <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-600">
                  Teknik Detaylar
                </h2>
                <dl className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {specRows.map((row) => (
                    <div
                      key={row.label}
                      className="rounded-2xl bg-emerald-50/40 px-4 py-3 ring-1 ring-emerald-100/70"
                    >
                      <dt className="text-xs font-medium text-neutral-500">
                        {row.label}
                      </dt>
                      <dd className="mt-1 text-sm font-semibold text-neutral-900">
                        {row.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}

            <DeviceDetailActionBar
              shopSlug={dukkan.slug}
              reservationHref={reservationHref}
              whatsappHref={whatsappHref}
              tradeWhatsAppHref={tradeWhatsAppHref}
            />
          </div>
        </ScrollReveal>
      </div>

      <ScrollReveal className="mt-10 lg:mt-14" delay={0.06}>
        <SecondHandExpertiseReport device={device} />
      </ScrollReveal>
    </div>
  );
}
