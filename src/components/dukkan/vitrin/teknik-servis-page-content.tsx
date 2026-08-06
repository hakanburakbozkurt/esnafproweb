"use client";

import { ScrollReveal } from "@/components/motion/scroll-reveal";
import { FaqSection } from "@/components/dukkan/faq-section";
import { AutoScrollCarousel } from "@/components/dukkan/vitrin/auto-scroll-carousel";
import { QrServiceView } from "@/components/dukkan/vitrin/qr-service-view";
import { ServiceTrackForm } from "@/components/dukkan/vitrin/service-track-form";
import {
  VitrinDotGrid,
  VitrinOpenSection,
} from "@/components/dukkan/vitrin/vitrin-open-section";
import { getTeknikServisPhotos } from "@/lib/dukkan/teknik-servis-photos";
import { desktopContainerClass } from "@/lib/utils/layout";
import type { Dukkan, FaqItem, PublicServiceDevice } from "@/types/database.types";

function TeknikServisDetailSplit({
  dukkan,
  photos,
}: {
  dukkan: Dukkan;
  photos: string[];
}) {
  const aciklama = dukkan.teknik_servis_aciklama?.trim();
  const hasImage = photos.length > 0;

  return (
    <article className="min-w-0">
      <h2 className="text-2xl font-bold tracking-tight text-emerald-700 sm:text-3xl lg:text-4xl">
        Hizmet Detayları
      </h2>

      <div className="mt-6 lg:mt-8">
        {hasImage && (
          <figure
            className="mb-6 w-full max-w-md lg:float-right lg:mb-6 lg:ml-8 lg:mt-1 lg:w-[min(100%,24rem)] lg:max-w-[42%]"
          >
            <AutoScrollCarousel
              images={photos}
              altPrefix={`${dukkan.dukkan_adi} teknik servis`}
              autoplayDelay={3600}
            />
          </figure>
        )}

        {aciklama ? (
          <div className="whitespace-pre-wrap text-base leading-relaxed text-slate-500 lg:text-lg">
            {aciklama}
          </div>
        ) : (
          <p className="text-base leading-relaxed text-slate-400 lg:text-lg">
            Henüz servis açıklaması eklenmemiş.
          </p>
        )}

        <div className="clear-both" aria-hidden />
      </div>
    </article>
  );
}

export function TeknikServisPageContent({
  dukkan,
  faqItems,
  qrDevice,
}: {
  dukkan: Dukkan;
  faqItems: FaqItem[];
  qrDevice: PublicServiceDevice | null;
}) {
  const photos = getTeknikServisPhotos(dukkan);
  const hasFaq = faqItems.some(
    (item) => item.soru.trim() && item.cevap.trim()
  );
  const hasDetailSection = photos.length > 0 || Boolean(dukkan.teknik_servis_aciklama?.trim());

  return (
    <div className={`${desktopContainerClass} relative pb-10 pt-8 lg:pb-16 lg:pt-12`}>
      <VitrinDotGrid />

      <ScrollReveal>
        <header className="mb-10 lg:mb-14">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
            Teknik Servis
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-emerald-700 lg:text-4xl xl:text-5xl">
            Cihaz Takip & Servis Hizmetleri
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-slate-500 lg:text-base">
            Takip kodunuzla cihazınızın servis durumunu sorgulayabilir, hizmet
            detaylarımızı inceleyebilirsiniz.
          </p>
        </header>
      </ScrollReveal>

      <ScrollReveal delay={0.04}>
        <VitrinOpenSection id="servis-takip" className="!pt-0">
          <h2 className="mb-6 text-xl font-bold text-emerald-700 lg:text-2xl">
            Cihaz Takip Sorgulama
          </h2>
          <ServiceTrackForm slug={dukkan.slug} teknikServisPage />
        </VitrinOpenSection>
      </ScrollReveal>

      {qrDevice && (
        <ScrollReveal className="mt-8 lg:mt-10" delay={0.05}>
          <VitrinOpenSection id="qr-servis">
            <QrServiceView device={qrDevice} />
          </VitrinOpenSection>
        </ScrollReveal>
      )}

      {hasDetailSection && (
        <ScrollReveal className="mt-10 lg:mt-14" delay={0.06}>
          <VitrinOpenSection id="servis-detay" className="!pt-0">
            <TeknikServisDetailSplit dukkan={dukkan} photos={photos} />
          </VitrinOpenSection>
        </ScrollReveal>
      )}

      {hasFaq && (
        <ScrollReveal className="mt-10 lg:mt-14" delay={0.1}>
          <VitrinOpenSection id="servis-sss" className="!pt-0">
            <FaqSection items={faqItems} variant="open" />
          </VitrinOpenSection>
        </ScrollReveal>
      )}
    </div>
  );
}
