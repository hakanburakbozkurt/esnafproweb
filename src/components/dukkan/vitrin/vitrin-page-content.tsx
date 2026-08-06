"use client";

import {
  ScrollReveal,
} from "@/components/motion/scroll-reveal";
import { FaqSection } from "@/components/dukkan/faq-section";
import { ProductShowcaseSection } from "@/components/dukkan/vitrin/product-showcase";
import { QrServiceView } from "@/components/dukkan/vitrin/qr-service-view";
import {
  VitrinDotGrid,
  VitrinOpenSection,
} from "@/components/dukkan/vitrin/vitrin-open-section";
import { VitrinCover } from "@/components/dukkan/vitrin/vitrin-cover";
import { hasVisibleFaqItems } from "@/lib/dukkan/faq";
import { desktopContainerClass } from "@/lib/utils/layout";
import type { Dukkan, DukkanUrunu, FaqItem, PublicServiceDevice } from "@/types/database.types";

type VitrinPageContentProps = {
  dukkan: Dukkan;
  urunler: DukkanUrunu[] | null;
  qrDevice: PublicServiceDevice | null;
  faqItems: FaqItem[];
};

export function VitrinPageContent({
  dukkan,
  urunler,
  qrDevice,
  faqItems,
}: VitrinPageContentProps) {
  const hasFaq = hasVisibleFaqItems(faqItems);

  return (
    <>
      <VitrinCover bannerUrl={dukkan.banner_url} shopName={dukkan.dukkan_adi} />

      <div className={`${desktopContainerClass} relative pt-4 sm:pt-5 lg:pt-6`}>
        <VitrinDotGrid />

        {!!urunler?.length && <ProductShowcaseSection urunler={urunler} />}

        {qrDevice && (
          <ScrollReveal className="mt-6 lg:mt-10">
            <VitrinOpenSection id="qr-servis">
              <QrServiceView device={qrDevice} />
            </VitrinOpenSection>
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
