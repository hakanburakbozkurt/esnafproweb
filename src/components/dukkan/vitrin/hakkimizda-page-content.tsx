"use client";

import { ScrollReveal } from "@/components/motion/scroll-reveal";
import { FaqSection } from "@/components/dukkan/faq-section";
import { VitrinDotGrid } from "@/components/dukkan/vitrin/vitrin-open-section";
import { hasVisibleFaqItems } from "@/lib/dukkan/faq";
import { vitrinSubpageContainerClass } from "@/lib/utils/layout";
import type { Dukkan, FaqItem } from "@/types/database.types";

export function HakkimizdaPageContent({
  dukkan,
  faqItems,
}: {
  dukkan: Dukkan;
  faqItems: FaqItem[];
}) {
  const images = (dukkan.dukkan_fotograflari ?? []).slice(0, 4);
  const hasFaq = hasVisibleFaqItems(faqItems);

  return (
    <div className="relative pb-16 pt-8 lg:pb-24 lg:pt-14">
      <VitrinDotGrid />

      <div className={vitrinSubpageContainerClass}>
        <ScrollReveal>
          <header className="max-w-3xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-600">
              {dukkan.dukkan_adi}
            </p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-emerald-700 lg:text-4xl xl:text-5xl">
              Hakkımızda
            </h1>
          </header>

          <div className="mt-8 max-w-3xl lg:mt-10">
            {dukkan.aciklama ? (
              <div className="whitespace-pre-wrap text-base leading-relaxed text-gray-700 lg:text-lg lg:leading-loose">
                {dukkan.aciklama}
              </div>
            ) : (
              <p className="text-base leading-relaxed text-gray-400 lg:text-lg">
                Henüz hikaye metni eklenmemiş.
              </p>
            )}
          </div>
        </ScrollReveal>

        {images.length > 0 && (
          <ScrollReveal className="mt-12 lg:mt-16" delay={0.06}>
            <section className="border-t border-gray-100 pt-10 lg:pt-14">
              <div className="mb-6 lg:mb-8">
                <h2 className="text-xl font-bold tracking-tight text-emerald-700 lg:text-2xl">
                  Mağazamızdan Kareler
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-gray-500 lg:text-base">
                  Mağazamızın atmosferini yansıtan seçili kareler.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:gap-6">
                {images.map((url, index) => (
                  <div
                    key={`${url}-${index}`}
                    className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={url}
                      alt={`${dukkan.dukkan_adi} hakkımızda ${index + 1}`}
                      className="aspect-square h-full w-full object-cover object-center transition duration-300 hover:scale-[1.01]"
                      draggable={false}
                    />
                  </div>
                ))}
              </div>
            </section>
          </ScrollReveal>
        )}

        {hasFaq && (
          <ScrollReveal className="mt-12 lg:mt-16" delay={0.08}>
            <section className="border-t border-gray-100 pt-10 lg:pt-14">
              <FaqSection items={faqItems} variant="open" />
            </section>
          </ScrollReveal>
        )}
      </div>
    </div>
  );
}
