"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  BadgeCheck,
  MapPin,
  Navigation,
} from "lucide-react";
import { DeviceDetailActionBar } from "@/components/dukkan/vitrin/device-detail-action-bar";
import { InstallmentOptionsCard } from "@/components/dukkan/vitrin/installment-modal";
import { SecondHandDeviceGallery } from "@/components/dukkan/vitrin/second-hand-device-gallery";
import { TrustBadges } from "@/components/dukkan/vitrin/trust-badges";
import { buildWhatsAppUrl, normalizeWhatsAppNumber } from "@/lib/dukkan/contact";
import {
  appendSecondHandDeviceUrlToWhatsAppMessage,
  buildSecondHandDeviceInquiryWhatsAppMessage,
  buildSecondHandDevicePublicUrl,
  canShowDeviceInstallmentOptions,
  formatSecondHandPrice,
  getDeviceConditionWarnings,
  getDeviceConditionMarkers,
  getSecondHandDeviceGorselleri,
  getSecondHandExpertiseReport,
  getSecondHandDeviceSpecRows,
  getSecondHandDeviceTitle,
  type PublicSecondHandDeviceDetail,
} from "@/lib/dukkan/second-hand-devices";
import { buildGoogleMapsDirectionsUrl } from "@/lib/dukkan/map-navigation";
import { kisaKonumEtiketi } from "@/lib/dukkan/konum";
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
  const gorseller = getSecondHandDeviceGorselleri(device);
  const report = getSecondHandExpertiseReport(device);
  const conditionMarkers = getDeviceConditionMarkers(device);
  const konumEtiketi = kisaKonumEtiketi({ adres: dukkan.adres, semt: dukkan.semt });
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

  const description = device.web_description?.trim() ?? "";
  const notes = device.notes?.trim() ?? "";
  const kondisyon = conditionMarkers.map((m) => m.label).join(" · ");
  const tabloSatirlari = kondisyon
    ? [...specRows, { label: "Kondisyon", value: kondisyon }]
    : specRows;

  return (
    <div className={`${desktopContainerClass} relative pb-10 pt-3 sm:pt-8 lg:pb-16 lg:pt-12`}>
      <VitrinDotGrid />

      <Link
        href={`/${dukkan.slug}/pazaryeri`}
        className="inline-flex items-center gap-1 text-sm font-medium text-neutral-500 transition hover:text-emerald-600"
      >
        ← Pazaryeri
      </Link>

      <div className="mt-3 grid grid-cols-1 gap-4 sm:mt-6 lg:grid-cols-2 lg:gap-14 xl:gap-16">
        <div className="lg:sticky lg:top-24 lg:self-start">
          <SecondHandDeviceGallery gorseller={gorseller} altPrefix={title} />
        </div>

        <div className="flex min-w-0 flex-col gap-3 sm:gap-4">
          <section className="rounded-3xl border border-neutral-100 bg-white p-4 shadow-sm sm:p-6">
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href={`/${dukkan.slug}`}
                className="text-sm font-semibold text-emerald-700 transition hover:text-emerald-800"
              >
                {dukkan.dukkan_adi}
              </Link>
              {isVerifiedShop ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 ring-1 ring-emerald-100">
                  <BadgeCheck className="size-3.5" aria-hidden />
                  Onaylı Mağaza
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-neutral-50 px-2 py-0.5 text-[11px] font-semibold text-neutral-600 ring-1 ring-neutral-100">
                  Esnaf Pro
                </span>
              )}
            </div>

            <h1 className="mt-2 text-xl font-bold tracking-tight text-neutral-900 sm:text-2xl">
              {title}
            </h1>

            <p className="mt-1 text-2xl font-bold tracking-tight text-emerald-700 sm:mt-2 sm:text-3xl">
              {price}
            </p>

            {showInstallmentOptions && (
              <InstallmentOptionsCard
                className="mt-3"
                acceptsInstallments
                salePrice={device.sale_price}
                productTitle={title}
              />
            )}

            <TrustBadges
              className="mt-3"
              hasWarranty={device.has_warranty}
              listingType={device.listing_type}
            />

            {mapsNavigationUrl && (
              <a
                href={mapsNavigationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 flex w-full items-center gap-2.5 rounded-2xl border border-emerald-100 bg-emerald-50/60 px-3 py-2.5 text-sm transition hover:border-emerald-200 hover:bg-emerald-50"
                aria-label={
                  distanceLabel
                    ? `${distanceLabel} — mağaza konumunu haritada aç`
                    : "Mağaza konumunu haritada aç"
                }
              >
                <MapPin className="size-4 shrink-0 text-emerald-600" aria-hidden />
                <span className="min-w-0 flex-1 truncate font-semibold text-emerald-700">
                  {[distanceLabel, konumEtiketi].filter(Boolean).join(" · ") || "Haritada aç"}
                </span>
                <span className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-emerald-700/80">
                  Yol tarifi
                  <Navigation className="size-3.5" aria-hidden />
                </span>
              </a>
            )}
          </section>

          {conditionWarnings.map((warning) => (
            <div
              key={warning.key}
              className="rounded-3xl border border-amber-200/80 bg-amber-50/70 p-4 shadow-sm sm:p-5"
            >
              <div className="flex items-start gap-3">
                <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-700" aria-hidden />
                <div className="min-w-0">
                  <h2 className="text-sm font-bold text-amber-900">{warning.title}</h2>
                  <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-amber-950/80">
                    {warning.content}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {tabloSatirlari.length > 0 && (
            <section className="rounded-3xl border border-neutral-100 bg-white px-4 py-3 shadow-sm sm:px-6 sm:py-5">
              <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-600">
                Teknik Detaylar
              </h2>
              <dl className="mt-1 divide-y divide-neutral-100">
                {tabloSatirlari.map((row) => (
                  <div
                    key={row.label}
                    className="flex items-baseline justify-between gap-4 py-2 text-sm"
                  >
                    <dt className="shrink-0 text-neutral-500">{row.label}</dt>
                    <dd className="min-w-0 text-right font-semibold text-neutral-900">
                      {row.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
          )}

          {report.hasContent && (
            <section className="rounded-3xl border border-neutral-100 bg-white p-4 shadow-sm sm:p-6">
              <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-600">
                Ekspertiz
              </h2>
              {report.highlights.length > 0 && (
                <dl className="mt-1 divide-y divide-neutral-100">
                  {report.highlights.map((item) => (
                    <div
                      key={item.label}
                      className="flex items-baseline justify-between gap-4 py-2 text-sm"
                    >
                      <dt className="text-neutral-500">{item.label}</dt>
                      <dd className="text-right font-semibold text-emerald-800">{item.value}</dd>
                    </div>
                  ))}
                </dl>
              )}
              <div className="mt-2 space-y-2">
                {report.sections.map((section) => (
                  <div
                    key={section.title}
                    className={
                      section.tone === "warning"
                        ? "rounded-2xl bg-amber-50/70 px-3 py-2.5"
                        : section.tone === "success"
                          ? "rounded-2xl bg-emerald-50/60 px-3 py-2.5"
                          : "rounded-2xl bg-neutral-50 px-3 py-2.5"
                    }
                  >
                    <h3 className="text-sm font-semibold text-neutral-900">{section.title}</h3>
                    <p className="mt-0.5 whitespace-pre-line text-sm leading-relaxed text-neutral-700">
                      {section.content}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section className="rounded-3xl border border-neutral-100 bg-white p-4 shadow-sm sm:p-6">
            {(description || notes) && (
              <>
                <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-600">
                  Açıklama
                </h2>
                {description && (
                  <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-neutral-700">
                    {description}
                  </p>
                )}
                {notes && notes !== description && (
                  <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-neutral-700">
                    {notes}
                  </p>
                )}
              </>
            )}

            {/* Telefonda WhatsApp / Ara / Yol tarifi alttaki sabit çubukta; burada yalnızca diğer talepler */}
            <div className={`grid grid-cols-2 gap-2 md:hidden ${description || notes ? "mt-3" : ""}`}>
              <IkincilButon href={reservationHref ?? `/${dukkan.slug}/iletisim`} dis={Boolean(reservationHref)}>
                Rezervasyon
              </IkincilButon>
              <IkincilButon href={tradeWhatsAppHref ?? `/${dukkan.slug}/iletisim`} dis={Boolean(tradeWhatsAppHref)}>
                Teklif / Takas
              </IkincilButon>
            </div>

            <DeviceDetailActionBar
              yalin
              className={`hidden md:block ${description || notes ? "md:mt-4" : ""}`}
              shopSlug={dukkan.slug}
              reservationHref={reservationHref}
              whatsappHref={whatsappHref}
              tradeWhatsAppHref={tradeWhatsAppHref}
            />
          </section>
        </div>
      </div>
    </div>
  );
}

function IkincilButon({
  href,
  dis,
  children,
}: {
  href: string;
  dis: boolean;
  children: React.ReactNode;
}) {
  const sinif =
    "inline-flex min-h-10 items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 px-3 text-xs font-semibold text-emerald-700 transition hover:border-emerald-300 hover:bg-emerald-100";
  return dis ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className={sinif}>
      {children}
    </a>
  ) : (
    <Link href={href} className={sinif}>
      {children}
    </Link>
  );
}
