"use client";

import { ScrollReveal } from "@/components/motion/scroll-reveal";
import { SecondHandDeviceCard } from "@/components/dukkan/vitrin/second-hand-device-card";
import { VitrinDotGrid } from "@/components/dukkan/vitrin/vitrin-open-section";
import type { PublicSecondHandDevice } from "@/lib/dukkan/second-hand-devices";
import { desktopContainerClass } from "@/lib/utils/layout";
import type { Dukkan } from "@/types/database.types";

export function PazaryeriPageContent({
  dukkan,
  devices,
}: {
  dukkan: Dukkan;
  devices: PublicSecondHandDevice[];
}) {
  return (
    <div className={`${desktopContainerClass} relative pb-10 pt-8 lg:pb-16 lg:pt-12`}>
      <VitrinDotGrid />

      <ScrollReveal>
        <header className="mb-10 lg:mb-14">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
            Pazaryeri
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-emerald-700 lg:text-4xl xl:text-5xl">
            İkinci El Cihazlar
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-slate-500 lg:text-base">
            {dukkan.dukkan_adi} vitrininde yayınlanan ikinci el cihazları
            inceleyebilir, WhatsApp üzerinden hızlıca bilgi alabilirsiniz.
          </p>
        </header>
      </ScrollReveal>

      {devices.length === 0 ? (
        <ScrollReveal delay={0.04}>
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white/70 px-6 py-16 text-center">
            <p className="text-base font-medium text-slate-600">
              Henüz yayınlanmış ikinci el cihaz bulunmuyor.
            </p>
            <p className="mt-2 text-sm text-slate-400">
              Yeni ilanlar eklendiğinde bu sayfada görünecektir.
            </p>
          </div>
        </ScrollReveal>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-4 md:grid-cols-3 md:gap-5 lg:grid-cols-4 lg:gap-6">
          {devices.map((device, index) => (
            <ScrollReveal
              key={device.id ?? index}
              delay={index * 0.04}
              className="h-full min-w-0"
            >
              <SecondHandDeviceCard
                device={device}
                shopSlug={dukkan.slug}
                shopName={dukkan.dukkan_adi}
                whatsapp={dukkan.whatsapp}
              />
            </ScrollReveal>
          ))}
        </div>
      )}
    </div>
  );
}
