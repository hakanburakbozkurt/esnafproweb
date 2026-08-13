"use client";

import Link from "next/link";
import { ScrollReveal } from "@/components/motion/scroll-reveal";
import { SecondHandDeviceGallery } from "@/components/dukkan/vitrin/second-hand-device-gallery";
import { SecondHandExpertiseReport } from "@/components/dukkan/vitrin/second-hand-expertise-report";
import { buildWhatsAppUrl, normalizeWhatsAppNumber } from "@/lib/dukkan/contact";
import {
  formatSecondHandCondition,
  formatSecondHandPrice,
  getSecondHandDeviceImages,
  getSecondHandDeviceSpecRows,
  getSecondHandDeviceTitle,
  type PublicSecondHandDeviceDetail,
} from "@/lib/dukkan/second-hand-devices";
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
  const condition = formatSecondHandCondition(device.condition);
  const specRows = getSecondHandDeviceSpecRows(device);
  const normalizedWhatsApp = dukkan.whatsapp
    ? normalizeWhatsAppNumber(dukkan.whatsapp)
    : null;
  const whatsappHref = normalizedWhatsApp
    ? buildWhatsAppUrl(
        normalizedWhatsApp,
        `Merhaba, Esnaf Pro üzerindeki ${title} ilanınız için yazıyorum...`
      )
    : null;

  return (
    <div className={`${desktopContainerClass} relative pb-10 pt-8 lg:pb-16 lg:pt-12`}>
      <VitrinDotGrid />

      <ScrollReveal>
        <Link
          href={`/${dukkan.slug}/pazaryeri`}
          className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 transition hover:text-emerald-600"
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
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
              İkinci El Cihaz
            </p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-emerald-700 lg:text-4xl">
              {title}
            </h1>

            {(device.brand || device.model) && (
              <p className="mt-2 text-sm text-slate-500">
                {[device.brand, device.model].filter(Boolean).join(" · ")}
              </p>
            )}

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-100">
                {condition}
              </span>
              {device.color?.trim() && (
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                  {device.color.trim()}
                </span>
              )}
            </div>

            <p className="mt-6 text-3xl font-bold tracking-tight text-emerald-700 lg:text-4xl">
              {price}
            </p>

            {specRows.length > 0 && (
              <div className="mt-8 rounded-2xl border border-slate-200/80 bg-white/80 p-5">
                <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-400">
                  Teknik Detaylar
                </h2>
                <dl className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {specRows.map((row) => (
                    <div
                      key={row.label}
                      className="rounded-xl bg-slate-50/80 px-4 py-3"
                    >
                      <dt className="text-xs font-medium text-slate-400">{row.label}</dt>
                      <dd className="mt-1 text-sm font-semibold text-slate-800">
                        {row.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}

            <div className="mt-8 lg:mt-auto lg:pt-8">
              {whatsappHref ? (
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#25D366] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#20bd5a] sm:w-auto"
                >
                  <WhatsAppIcon />
                  WhatsApp ile Bilgi Al
                </a>
              ) : (
                <p className="text-sm text-slate-400">
                  İletişim için mağaza iletişim sayfasını ziyaret edin.
                </p>
              )}
            </div>
          </div>
        </ScrollReveal>
      </div>

      <ScrollReveal className="mt-10 lg:mt-14" delay={0.06}>
        <SecondHandExpertiseReport device={device} />
      </ScrollReveal>
    </div>
  );
}

function WhatsAppIcon() {
  return (
    <svg className="size-5 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
    </svg>
  );
}
