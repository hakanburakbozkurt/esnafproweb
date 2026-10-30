"use client";

import {
  ScrollReveal,
} from "@/components/motion/scroll-reveal";
import { FaqSection } from "@/components/dukkan/faq-section";
import { VitrinKlasorKartlari, type VitrinKlasor } from "@/components/dukkan/vitrin/vitrin-klasor-kartlari";
import { QrServiceView } from "@/components/dukkan/vitrin/qr-service-view";
import { VitrinMap } from "@/components/dukkan/vitrin/vitrin-map";
import {
  VitrinDotGrid,
  VitrinOpenSection,
} from "@/components/dukkan/vitrin/vitrin-open-section";
import { VitrinCover } from "@/components/dukkan/vitrin/vitrin-cover";
import { hasVisibleFaqItems } from "@/lib/dukkan/faq";
import { hasCompleteCoordinates } from "@/lib/dukkan/location";
import { desktopContainerClass } from "@/lib/utils/layout";
import type { Dukkan, FaqItem, PublicServiceDevice } from "@/types/database.types";

type VitrinPageContentProps = {
  dukkan: Dukkan;
  klasorler: VitrinKlasor[];
  qrDevice: PublicServiceDevice | null;
  faqItems: FaqItem[];
};

export function VitrinPageContent({
  dukkan,
  klasorler,
  qrDevice,
  faqItems,
}: VitrinPageContentProps) {
  const hasFaq = hasVisibleFaqItems(faqItems);
  const hasLocation = hasCompleteCoordinates(dukkan.enlem, dukkan.boylam);

  return (
    <>
      <VitrinCover bannerUrl={dukkan.banner_url} shopName={dukkan.dukkan_adi} />

      <div className={`${desktopContainerClass} relative pt-4 sm:pt-5 lg:pt-6`}>
        <VitrinDotGrid />

        {klasorler.length > 0 && (
          <ScrollReveal>
            <VitrinKlasorKartlari shopSlug={dukkan.slug} klasorler={klasorler} />
          </ScrollReveal>
        )}

        {qrDevice && (
          <ScrollReveal className="mt-6 lg:mt-10">
            <VitrinOpenSection id="qr-servis">
              <QrServiceView device={qrDevice} />
            </VitrinOpenSection>
          </ScrollReveal>
        )}

        {hasLocation && (
          <ScrollReveal className="mt-12 lg:mt-16" delay={0.04}>
            <section id="konum" className="border-t border-slate-200/60 pt-10 lg:pt-14">
              <div className="mb-6">
                <h2 className="text-xl font-bold tracking-tight text-slate-900 lg:text-2xl">
                  Konum
                </h2>
                <p className="mt-2 text-sm text-slate-600">
                  Mağazamıza kolayca ulaşmak için haritadan yol tarifi alabilirsiniz.
                </p>
              </div>
              <VitrinMap
                enlem={dukkan.enlem}
                boylam={dukkan.boylam}
                adres={dukkan.adres}
                label={dukkan.dukkan_adi}
              />
            </section>
          </ScrollReveal>
        )}

        {hasFaq && (
          <ScrollReveal className="mt-12 lg:mt-16" delay={0.08}>
            <section
              id="sss"
              className="border-t border-slate-200/60 pt-10 lg:pt-14"
            >
              <FaqSection items={faqItems} variant="card" />
            </section>
          </ScrollReveal>
        )}
      </div>
    </>
  );
}
