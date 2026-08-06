"use client";

import { ScrollReveal } from "@/components/motion/scroll-reveal";
import { AutoScrollCarousel } from "@/components/dukkan/vitrin/auto-scroll-carousel";
import { getUrunPhotoUrls } from "@/lib/dukkan/urun-photos";
import type { DukkanUrunu } from "@/types/database.types";
import {
  VitrinDotGrid,
  vitrinSectionLabelClass,
} from "@/components/dukkan/vitrin/vitrin-open-section";

function ProductRow({
  urun,
  index,
}: {
  urun: DukkanUrunu;
  index: number;
}) {
  const photos = getUrunPhotoUrls(urun);

  return (
    <ScrollReveal delay={index * 0.04}>
      <article className="grid grid-cols-1 items-center gap-10 border-b border-slate-200/50 py-12 last:border-b-0 lg:grid-cols-2 lg:gap-16 lg:py-20 xl:gap-20">
        <div className="min-w-0 lg:pr-6">
          <h2 className="text-3xl font-black leading-[1.08] tracking-tight text-emerald-700 sm:text-4xl lg:text-5xl xl:text-6xl">
            {urun.urun_adi}
          </h2>
          {urun.urun_aciklama && (
            <p className="mt-6 max-w-md text-base leading-relaxed text-slate-500 lg:mt-8 lg:text-lg">
              {urun.urun_aciklama}
            </p>
          )}
        </div>

        <div className="w-full min-w-0">
          {photos.length > 0 ? (
            <AutoScrollCarousel
              images={photos}
              altPrefix={urun.urun_adi}
              gorselOrani={urun.gorsel_orani}
              autoplayDelay={3600}
            />
          ) : (
            <div className="flex aspect-square w-full items-center justify-center rounded-xl bg-slate-100 text-sm text-slate-400">
              Fotoğraf yok
            </div>
          )}
        </div>
      </article>
    </ScrollReveal>
  );
}

export function ProductShowcase({ urunler }: { urunler: DukkanUrunu[] }) {
  return (
    <div className="flex flex-col">
      {urunler.map((urun, index) => (
        <ProductRow key={urun.id} urun={urun} index={index} />
      ))}
    </div>
  );
}

export function ProductShowcaseSection({
  urunler,
}: {
  urunler: DukkanUrunu[];
}) {
  return (
    <section id="urunler" className="relative">
      <VitrinDotGrid />

      <ScrollReveal>
        <p className={vitrinSectionLabelClass}>Ürün & Hizmetler</p>
      </ScrollReveal>

      <ProductShowcase urunler={urunler} />
    </section>
  );
}
