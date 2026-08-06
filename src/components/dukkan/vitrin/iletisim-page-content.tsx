"use client";

import { ScrollReveal } from "@/components/motion/scroll-reveal";
import { CalismaSaatleriDisplay } from "@/components/dukkan/vitrin/calisma-saatleri-display";
import { FaqSection } from "@/components/dukkan/faq-section";
import { SocialLinks } from "@/components/dukkan/social-links";
import { VitrinMap } from "@/components/dukkan/vitrin/vitrin-map";
import { VitrinDotGrid } from "@/components/dukkan/vitrin/vitrin-open-section";
import { buildWhatsAppUrl } from "@/lib/dukkan/contact";
import { hasVisibleFaqItems } from "@/lib/dukkan/faq";
import { vitrinSubpageContainerClass } from "@/lib/utils/layout";
import type { Dukkan, FaqItem } from "@/types/database.types";
import type { ReactNode } from "react";

export function IletisimPageContent({
  dukkan,
  faqItems,
}: {
  dukkan: Dukkan;
  faqItems: FaqItem[];
}) {
  const hasSocial =
    dukkan.instagram_url || dukkan.tiktok_url || dukkan.facebook_url;

  const hasHours = Boolean(dukkan.calisma_saatleri?.trim());

  const hasFaq = hasVisibleFaqItems(faqItems);

  return (
    <div className="relative pb-16 pt-8 lg:pb-24 lg:pt-14">
      <VitrinDotGrid />

      <div className={vitrinSubpageContainerClass}>
        <ScrollReveal>
          <header className="mb-10 lg:mb-14">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-600">
              {dukkan.dukkan_adi}
            </p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-emerald-700 lg:text-4xl xl:text-5xl">
              İletişim
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-relaxed text-gray-500 lg:text-base">
              Sorularınız, siparişleriniz ve ziyaret planlarınız için bize
              ulaşın.
            </p>
          </header>
        </ScrollReveal>

        <ScrollReveal delay={0.04}>
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-start lg:gap-16 xl:gap-24">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:gap-6">
              {dukkan.telefon && (
                <ContactCard
                  label="Telefon"
                  icon={<PhoneIcon />}
                  className="sm:col-span-1"
                >
                  <a
                    href={`tel:${dukkan.telefon.replace(/\s/g, "")}`}
                    className="break-all text-base font-semibold text-gray-800 transition hover:text-emerald-700"
                  >
                    {dukkan.telefon}
                  </a>
                </ContactCard>
              )}

              {dukkan.whatsapp && (
                <ContactCard label="WhatsApp" icon={<WhatsAppIcon />}>
                  <a
                    href={buildWhatsAppUrl(
                      dukkan.whatsapp,
                      `Merhaba ${dukkan.dukkan_adi}, bilgi almak istiyorum.`
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-10 items-center text-base font-semibold text-[#128C7E] transition hover:text-[#0f7a6e]"
                  >
                    WhatsApp ile yazın
                  </a>
                </ContactCard>
              )}

              {hasHours && (
                <div className="sm:col-span-2">
                  <CalismaSaatleriDisplay raw={dukkan.calisma_saatleri} />
                </div>
              )}

              {dukkan.adres && (
                <ContactCard
                  label="Adres"
                  icon={<MapPinIcon />}
                  className="sm:col-span-2"
                >
                  <address className="not-italic text-base leading-relaxed text-gray-700">
                    {dukkan.adres}
                  </address>
                </ContactCard>
              )}

              {hasSocial && (
                <ContactCard
                  label="Sosyal Medya"
                  icon={<ShareIcon />}
                  className="sm:col-span-2"
                >
                  <SocialLinks
                    instagram={dukkan.instagram_url}
                    tiktok={dukkan.tiktok_url}
                    facebook={dukkan.facebook_url}
                  />
                </ContactCard>
              )}
            </div>

            <div className="lg:sticky lg:top-28">
              <div className="mb-4">
                <h2 className="text-xl font-bold tracking-tight text-emerald-700 lg:text-2xl">
                  Konum
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-gray-500">
                  Haritaya veya yol tarifi butonuna tıklayarak navigasyonu
                  açabilirsiniz.
                </p>
              </div>
              <VitrinMap
                enlem={dukkan.enlem}
                boylam={dukkan.boylam}
                adres={dukkan.adres}
                label={dukkan.dukkan_adi}
              />
            </div>
          </div>
        </ScrollReveal>

        {hasFaq && (
          <ScrollReveal className="mt-16 lg:mt-24" delay={0.08}>
            <section className="border-t border-gray-100 pt-14 lg:pt-20">
              <FaqSection items={faqItems} variant="open" />
            </section>
          </ScrollReveal>
        )}
      </div>
    </div>
  );
}

function ContactCard({
  label,
  icon,
  children,
  className,
}: {
  label: string;
  icon: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-gray-100 bg-white p-5 shadow-sm lg:p-6 ${className ?? ""}`}
    >
      <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
        {icon}
      </div>
      <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-400">
        {label}
      </p>
      <div className="mt-2">{children}</div>
    </div>
  );
}

function PhoneIcon() {
  return (
    <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg className="size-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
    </svg>
  );
}

function MapPinIcon() {
  return (
    <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z" />
    </svg>
  );
}
