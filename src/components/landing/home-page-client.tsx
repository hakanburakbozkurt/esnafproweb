"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils/cn";
import { LandingFaqSection } from "@/components/landing/landing-faq-section";
import type { FaqItem } from "@/types/database.types";

const ASSETS = {
  onboarding: "/assets/2e1b06bc-478a-4790-9492-4009adab4f62.png",
  stock: "/assets/0efb3ca7-4bc5-4568-a16b-52f83f33fd13.png",
  kasa: "/assets/7950dffd-6ab9-48ce-9a44-1cb909187623.png",
  service: "/assets/6e3dee91-7061-4fa7-969c-1e126439e2be.png",
  analytics: "/assets/84c55db4-d07f-4999-bf3c-c8c41e7a7c7f.png",
  analyticsCharts: "/assets/b3bb643f-b413-481c-8606-3651f336aade.png",
  settings: "/assets/1986088d-4c9b-4c06-8644-096a44c1d329.png",
  kargola: "/assets/kargola.PNG",
  toptanci: "/assets/toptanci.PNG",
};

const features = [
  {
    id: "stok",
    title: "Stok Yönetimi",
    description: "Barkod okuma, kategori envanteri ve düşük stok uyarıları.",
    icon: "box",
    side: "left" as const,
    y: "18%",
  },
  {
    id: "servis",
    title: "Teknik Servis",
    description: "Dijital servis formu, IMEI tanıma ve müşteri takibi.",
    icon: "wrench",
    side: "left" as const,
    y: "58%",
  },
  {
    id: "kasa",
    title: "Esnaf Kasa",
    description: "QR ile satış, müşteri kaydı ve anlık ciro takibi.",
    icon: "wallet",
    side: "right" as const,
    y: "18%",
  },
  {
    id: "analiz",
    title: "Satış Analizi",
    description: "Aylık hedef, kâr dengesi ve en çok satan ürünler.",
    icon: "chart",
    side: "right" as const,
    y: "58%",
  },
];

const galleryModules = [
  {
    id: "stok",
    label: "Stok",
    subtitle: "Envanter ve barkod yönetimi",
    description:
      "Telefon kılıfından ekran koruyucuya binlerce kalemi excel derdi olmadan barkodla okut, kritik stok seviyesinde otomatik uyarıl.",
    features: [
      "Excel'den Hızlı Ürün Yükleme",
      "Kritik Stok Seviyesi Uyarıları",
      "Barkod ile Satış ve Envanter Takibi",
    ],
    image: ASSETS.stock,
  },
  {
    id: "kasa",
    label: "Kasa",
    subtitle: "Hızlı satış ve ödeme",
    description:
      "Kart, nakit, parçalı veya veresiye... Müşterinin durumuna göre esnek satış yap, barkodla anında kasayı kapat.",
    features: [
      "Kart, Nakit, Parçalı ve Veresiye Satış",
      "Barkodlu Hızlı Satış",
      "Cihaz ve Müşteri Seçimi Ekranı",
    ],
    image: ASSETS.kasa,
  },
  {
    id: "servis",
    label: "Servis",
    subtitle: "Teknik servis takibi",
    description:
      "Hangi cihaz kime ait, aşaması ne derdi bitti. Müşteri, esnafpro.app üzerinden cihazının durumunu anlık takip etsin.",
    features: [
      "WhatsApp ile Otomatik Bilgilendirme",
      "esnafpro.app Üzerinden Canlı Takip",
      "IMEI ve Parça Bazlı Servis Geçmişi",
    ],
    image: ASSETS.service,
  },
  {
    id: "analiz",
    label: "Analiz",
    subtitle: "Ciro ve kâr raporları",
    description:
      "Dükkanının nabzını tut; kâr şampiyonu ürünleri, en yoğun saatleri ve son 7 günlük ciroyu tek ekranda gör.",
    features: [
      "Kâr Şampiyonu Ürünler",
      "En Yoğun Saatler ve Genel Satışlar",
      "Son 7 Günlük Takvim Filtresi",
    ],
    image: ASSETS.analytics,
  },
  {
    id: "ayarlar",
    label: "Ayarlar",
    subtitle: "İşletme ve panel yönetimi",
    description:
      "Dükkanının bilgilerini, personel yetkilerini ve WhatsApp entegrasyonlarını tek merkezden yönet.",
    features: [
      "Personel Yetkilendirme",
      "Mağaza Şablonu Ayarları",
      "Bildirim ve WhatsApp Entegrasyonu",
    ],
    image: ASSETS.settings,
  },
] as const;

const MODULE_AUTOPLAY_MS = 7000;

const HERO_BROWSER_URL = "esnafpro.app/dukkanin";

const HERO_SLIDES = [
  { src: "/assets/teknik-servis.PNG", title: "Teknik Servis" },
  { src: "/assets/hakkimizda.PNG", title: "Hakkımızda" },
  { src: "/assets/pazaryeri.PNG", title: "Pazaryeri" },
] as const;

const HERO_BROWSER_SLIDE_MS = 4000;

function ModuleCheckIcon() {
  return (
    <svg className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
    </svg>
  );
}

function ModuleFeatureList({ features }: { features: readonly string[] }) {
  return (
    <ul className="mt-4 space-y-2.5">
      {features.map((feature) => (
        <li key={feature} className="flex items-start gap-2.5 text-sm leading-relaxed text-slate-600">
          <ModuleCheckIcon />
          <span>{feature}</span>
        </li>
      ))}
    </ul>
  );
}

function ModuleExpandedContent({
  mod,
  className,
}: {
  mod: (typeof galleryModules)[number];
  className?: string;
}) {
  return (
    <div className={className}>
      <p className="mt-2 text-sm font-medium text-emerald-700/80">{mod.subtitle}</p>
      <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-[15px]">{mod.description}</p>
      <ModuleFeatureList features={mod.features} />
    </div>
  );
}

function FeatureIcon({ type }: { type: string }) {
  const className = "h-5 w-5 text-emerald-600";

  if (type === "box") {
    return (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m21 7.5-9-5.25L3 7.5m18 0-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
      </svg>
    );
  }
  if (type === "wrench") {
    return (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03a2.652 2.652 0 1 0-3.633-3.633L6.75 11.42M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l5.653-4.655" />
      </svg>
    );
  }
  if (type === "wallet") {
    return (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 0 0-2.25-2.25H15a3 3 0 1 1-6 0H5.25A2.25 2.25 0 0 0 3 12m18 0v6a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 9m18 0V6a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 6v3" />
      </svg>
    );
  }
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
    </svg>
  );
}

function PhoneMockup({
  src,
  alt,
  size = "md",
  className = "",
  elevated = false,
}: {
  src: string;
  alt: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  elevated?: boolean;
}) {
  const config = {
    sm: { width: "w-[150px]", island: "top-[7px] h-[18px] w-[58px]", radius: "rounded-[32px]", screen: "rounded-[29px]" },
    md: { width: "w-[190px]", island: "top-[9px] h-[20px] w-[64px]", radius: "rounded-[36px]", screen: "rounded-[33px]" },
    lg: { width: "w-[240px]", island: "top-[11px] h-[22px] w-[72px]", radius: "rounded-[40px]", screen: "rounded-[37px]" },
    xl: { width: "w-[280px]", island: "top-[12px] h-[24px] w-[80px]", radius: "rounded-[44px]", screen: "rounded-[41px]" },
  }[size];

  return (
    <div className={cn("relative shrink-0", config.width, className)}>
      <div
        className={cn(
          `${config.radius} bg-gradient-to-b from-slate-600 via-slate-800 to-slate-950 p-[3px] ring-1 ring-black/10`,
          elevated
            ? "border border-gray-100/80 shadow-2xl shadow-slate-900/15"
            : "shadow-xl shadow-slate-900/10"
        )}
      >
        <div
          className={`relative aspect-[9/19.5] overflow-hidden ${config.screen} bg-black`}
        >
          <Image
            src={src}
            alt={alt}
            fill
            sizes="(max-width:768px) 150px, 280px"
            className="object-cover object-top"
          />
          <div
            className={`absolute left-1/2 z-10 -translate-x-1/2 ${config.island} rounded-full bg-black ring-1 ring-white/5`}
          />
        </div>
      </div>
    </div>
  );
}

function HeroBrowserFrame() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % HERO_SLIDES.length);
    }, HERO_BROWSER_SLIDE_MS);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="w-full min-w-0">
      <div className="overflow-hidden rounded-2xl border border-gray-100/80 bg-white shadow-2xl shadow-slate-900/10 ring-1 ring-slate-900/5">
        <div className="flex items-center gap-3 border-b border-slate-100 bg-slate-50/90 px-4 py-3">
          <div className="flex shrink-0 items-center gap-1.5" aria-hidden>
            <span className="h-3 w-3 rounded-full bg-[#FF5F57]" />
            <span className="h-3 w-3 rounded-full bg-[#FEBC2E]" />
            <span className="h-3 w-3 rounded-full bg-[#28C840]" />
          </div>
          <div className="flex min-w-0 flex-1 justify-center">
            <div className="w-full max-w-md truncate rounded-lg border border-slate-200/80 bg-white px-3 py-1.5 text-center text-xs text-slate-500 sm:text-sm">
              {HERO_BROWSER_URL}
            </div>
          </div>
          <div className="hidden w-[52px] shrink-0 sm:block" aria-hidden />
        </div>

        <div className="relative h-[350px] w-full overflow-hidden bg-slate-100 sm:h-[400px]">
          {HERO_SLIDES.map((slide, index) => (
            <div
              key={slide.src}
              aria-hidden={index !== activeIndex}
              className={cn(
                "absolute inset-0 transition-opacity duration-700 ease-in-out motion-reduce:transition-none",
                index === activeIndex ? "z-10 opacity-100" : "z-0 opacity-0"
              )}
            >
              <Image
                src={slide.src}
                alt={`EsnafPRO ${slide.title} önizlemesi`}
                fill
                sizes="(max-width: 1024px) 100vw, 560px"
                className="h-full w-full object-contain object-top"
                priority={index === 0}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 flex justify-center gap-2" role="tablist" aria-label="Tarayıcı slayt göstergeleri">
        {HERO_SLIDES.map((slide, index) => (
          <button
            key={slide.src}
            type="button"
            role="tab"
            aria-selected={index === activeIndex}
            aria-label={slide.title}
            onClick={() => setActiveIndex(index)}
            className={cn(
              "h-2 w-2 rounded-full transition-colors duration-300",
              index === activeIndex ? "bg-emerald-500" : "bg-slate-300 hover:bg-slate-400"
            )}
          />
        ))}
      </div>
    </div>
  );
}

function HeroSection() {
  return (
    <section className="overflow-x-hidden px-4 pb-20 pt-12 md:pb-28 md:pt-20">
      <div className="mx-auto grid w-full min-w-0 max-w-6xl items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <div className="min-w-0 max-w-xl">
          <h1 className="text-3xl font-bold leading-[1.12] tracking-tight text-slate-900 sm:text-4xl lg:text-[2.75rem] xl:text-5xl">
            Dükkanını Dijitale Taşı,{" "}
            <span className="text-emerald-600">Kendi Slug Adresinle Anında Satışa Başla</span>
          </h1>
          <p className="mt-6 text-base leading-relaxed text-slate-500 sm:text-lg">
            Sadece bir uygulama değil; SEO uyumlu dükkan sayfanı kur, ürünlerini sergile,
            toptancınla ve müşterilerinle doğrudan ticaret yap.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <a
              href="/dukkan-ac"
              className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-500 px-7 py-3.5 text-center text-sm font-bold text-white shadow-lg shadow-emerald-500/30 transition hover:shadow-xl hover:shadow-emerald-500/40 sm:w-auto md:hover:scale-[1.02] sm:text-base"
            >
              Hemen Mağazanını Oluştur
            </a>
            <a
              href="/fiyatlandirma"
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-emerald-200 hover:text-emerald-700"
            >
              Fiyatlandırmayı İncele
            </a>
            <a
              href="#ozellikler"
              className="inline-flex min-h-12 items-center justify-center px-2 py-3 text-sm font-semibold text-emerald-600 transition hover:text-emerald-700"
            >
              Özellikleri Keşfet →
            </a>
          </div>
        </div>

        <div className="min-w-0 w-full lg:justify-self-end">
          <HeroBrowserFrame />
        </div>
      </div>
    </section>
  );
}

function FeatureCard({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: string;
}) {
  return (
    <div className="w-full max-w-[220px] rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50">
        <FeatureIcon type={icon} />
      </div>
      <h3 className="font-semibold text-slate-900">{title}</h3>
      <p className="mt-1 text-sm leading-relaxed text-slate-500">{description}</p>
    </div>
  );
}

function FeatureMapSection() {
  return (
    <section id="ozellikler" className="overflow-x-hidden px-4 py-20 sm:px-6 md:py-28">
      <div className="mx-auto w-full min-w-0 max-w-6xl">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            İşletmeniz için{" "}
            <span className="text-emerald-600">her şey bir arada</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-slate-500">
            Stok, servis, kasa ve analiz modülleri tek merkezden birbirine bağlı
            çalışır. Dükkandan çıkmadan ticaret.
          </p>
        </div>

        <div className="relative mx-auto mt-16 hidden min-h-[520px] lg:block">
          <svg
            className="pointer-events-none absolute inset-0 h-full w-full"
            viewBox="0 0 1100 520"
            fill="none"
            preserveAspectRatio="xMidYMid meet"
            aria-hidden
          >
            <path d="M 220 110 Q 400 110, 480 260" stroke="#e2e8f0" strokeWidth="1.5" strokeDasharray="4 6" />
            <path d="M 220 380 Q 400 380, 480 260" stroke="#e2e8f0" strokeWidth="1.5" strokeDasharray="4 6" />
            <path d="M 880 110 Q 700 110, 620 260" stroke="#e2e8f0" strokeWidth="1.5" strokeDasharray="4 6" />
            <path d="M 880 380 Q 700 380, 620 260" stroke="#e2e8f0" strokeWidth="1.5" strokeDasharray="4 6" />
            <circle cx="220" cy="110" r="4" fill="#10b981" fillOpacity="0.5" />
            <circle cx="220" cy="380" r="4" fill="#10b981" fillOpacity="0.5" />
            <circle cx="880" cy="110" r="4" fill="#10b981" fillOpacity="0.5" />
            <circle cx="880" cy="380" r="4" fill="#10b981" fillOpacity="0.5" />
            <circle cx="550" cy="260" r="5" fill="#10b981" fillOpacity="0.35" />
          </svg>

          <div className="absolute left-0 top-[12%]">
            <FeatureCard {...features[0]} />
          </div>
          <div className="absolute left-0 top-[58%]">
            <FeatureCard {...features[1]} />
          </div>

          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <PhoneMockup src={ASSETS.stock} alt="Stok yönetimi" size="xl" />
          </div>

          <div className="absolute right-0 top-[12%]">
            <FeatureCard {...features[2]} />
          </div>
          <div className="absolute right-0 top-[58%]">
            <FeatureCard {...features[3]} />
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center gap-10 lg:hidden">
          <div className="grid w-full max-w-sm grid-cols-1 gap-4 sm:grid-cols-2">
            {features.map((f) => (
              <FeatureCard key={f.id} title={f.title} description={f.description} icon={f.icon} />
            ))}
          </div>
          <PhoneMockup src={ASSETS.stock} alt="Stok yönetimi" size="lg" />
        </div>
      </div>
    </section>
  );
}

const supplyBenefits = {
  esnaf: {
    title: "ESNAFIN KAZANIMI",
    tagline: "Dükkandan çıkmadan tedarik",
    items: [
      "Sistemdeki toptancılardan dilediğini seç, ister parça parça ister toptan sipariş ver",
      "İster cariye yazdır, ister iyzico ile güvenli ve komisyonsuz alışveriş yap",
      "Gelen ürünleri eşleşme haritası ile kendi stok listene bağla, stokların otomatik güncellensin",
    ],
  },
  toptanci: {
    title: "TOPTANCININ KAZANIMI",
    tagline: "Anında sipariş yönetimi",
    items: [
      "Esnaftan gelen siparişler ekrana anında düşsün",
      "İster kargola ister ürünleri hazırlayıp dükkanda beklet",
      "Tek tuşla onayla, iyzico güvencesiyle ödemelerini yönet ve satışını artır",
    ],
  },
} as const;

function SupplyBenefitCard({
  title,
  tagline,
  items,
  className,
}: {
  title: string;
  tagline: string;
  items: readonly string[];
  className?: string;
}) {
  return (
    <article
      className={cn(
        "rounded-2xl border border-gray-100/80 bg-white p-5 shadow-xl shadow-slate-200/60 sm:p-6",
        className
      )}
    >
      <h3 className="text-sm font-bold uppercase tracking-[0.12em] text-emerald-600 sm:text-base">
        {title}
      </h3>
      <p className="mt-2 text-sm font-semibold leading-snug text-slate-800 sm:text-[15px]">
        {tagline}
      </p>
      <ul className="mt-4 space-y-2.5">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-2.5 text-sm leading-relaxed text-slate-600">
            <ModuleCheckIcon />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}

const SUPPLY_BRIDGE_BADGE = "SİPARİŞ ANINDA TOPTANCIDA";

function SupplyDataBridge({ orientation }: { orientation: "horizontal" | "vertical" }) {
  if (orientation === "vertical") {
    return (
      <div className="flex flex-col items-center py-5">
        <svg
          className="h-32 w-14 shrink-0"
          viewBox="0 0 56 128"
          fill="none"
          aria-hidden
        >
          <defs>
            <linearGradient id="supply-bridge-v-line" x1="28" x2="28" y1="8" y2="112" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#34d399" stopOpacity="0.45" />
              <stop offset="50%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#34d399" stopOpacity="0.45" />
            </linearGradient>
            <filter id="supply-bridge-v-glow" x="-150%" y="-150%" width="400%" height="400%">
              <feGaussianBlur stdDeviation="3.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <path
            d="M28 10 V106"
            stroke="url(#supply-bridge-v-line)"
            strokeLinecap="round"
            strokeWidth="3"
          />

          <circle cx="28" cy="10" fill="#10b981" filter="url(#supply-bridge-v-glow)" r="4.5">
            <animate attributeName="cy" dur="1.8s" repeatCount="indefinite" values="10;106;10" />
            <animate attributeName="opacity" dur="1.8s" repeatCount="indefinite" values="0.4;1;0.4" />
            <animate attributeName="r" dur="1.8s" repeatCount="indefinite" values="3.5;5;3.5" />
          </circle>

          <circle cx="28" cy="34" fill="#34d399" filter="url(#supply-bridge-v-glow)" r="3.5">
            <animate attributeName="cy" begin="0.45s" dur="1.8s" repeatCount="indefinite" values="10;106;10" />
            <animate attributeName="opacity" begin="0.45s" dur="1.8s" repeatCount="indefinite" values="0.3;0.95;0.3" />
          </circle>

          <circle cx="28" cy="58" fill="#6ee7b7" filter="url(#supply-bridge-v-glow)" r="3">
            <animate attributeName="cy" begin="0.9s" dur="1.8s" repeatCount="indefinite" values="10;106;10" />
            <animate attributeName="opacity" begin="0.9s" dur="1.8s" repeatCount="indefinite" values="0.25;0.9;0.25" />
          </circle>

          <polygon fill="#059669" points="28,118 22,106 34,106" />
        </svg>

        <div className="mx-auto mt-4 w-full max-w-xs rounded-full border border-emerald-200 bg-white px-4 py-2.5 shadow-lg shadow-emerald-200/60 sm:max-w-sm sm:px-5">
          <p className="text-center text-[11px] font-bold uppercase leading-snug tracking-[0.1em] text-emerald-700 sm:text-xs sm:tracking-[0.12em]">
            {SUPPLY_BRIDGE_BADGE}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex w-full min-w-0 shrink items-center justify-center px-1">
      <div className="relative flex h-[4.5rem] w-full min-w-[11rem] max-w-[15rem] items-center xl:max-w-[17rem]">
        <svg
          className="absolute inset-0 h-full w-full"
          viewBox="0 0 224 72"
          fill="none"
          preserveAspectRatio="none"
          aria-hidden
        >
          <defs>
            <linearGradient id="supply-bridge-h-line" x1="0" x2="224" y1="36" y2="36" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#34d399" stopOpacity="0.4" />
              <stop offset="50%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#34d399" stopOpacity="0.4" />
            </linearGradient>
            <filter id="supply-bridge-h-glow" x="-150%" y="-150%" width="400%" height="400%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <path
            d="M4 36 H220"
            stroke="url(#supply-bridge-h-line)"
            strokeLinecap="round"
            strokeWidth="3"
          />

          <circle cx="12" cy="36" fill="#10b981" filter="url(#supply-bridge-h-glow)" r="5">
            <animate attributeName="cx" dur="1.7s" repeatCount="indefinite" values="12;212;12" />
            <animate attributeName="opacity" dur="1.7s" repeatCount="indefinite" values="0.35;1;0.35" />
            <animate attributeName="r" dur="1.7s" repeatCount="indefinite" values="4;6;4" />
          </circle>

          <circle cx="212" cy="36" fill="#34d399" filter="url(#supply-bridge-h-glow)" r="4">
            <animate attributeName="cx" begin="0.4s" dur="2s" repeatCount="indefinite" values="212;12;212" />
            <animate attributeName="opacity" begin="0.4s" dur="2s" repeatCount="indefinite" values="0.3;1;0.3" />
          </circle>

          <circle cx="40" cy="36" fill="#6ee7b7" filter="url(#supply-bridge-h-glow)" r="3.5">
            <animate attributeName="cx" begin="0.85s" dur="1.5s" repeatCount="indefinite" values="20;204;20" />
            <animate attributeName="opacity" begin="0.85s" dur="1.5s" repeatCount="indefinite" values="0.25;0.95;0.25" />
          </circle>
        </svg>

        <div className="relative z-10 mx-auto max-w-[92%] rounded-full border border-emerald-200 bg-white px-3 py-2 shadow-lg shadow-emerald-200/70 xl:px-4 xl:py-2.5">
          <p className="text-center text-[9px] font-bold uppercase leading-tight tracking-[0.08em] text-emerald-700 xl:text-[10px] xl:tracking-[0.1em]">
            {SUPPLY_BRIDGE_BADGE}
          </p>
        </div>
      </div>
    </div>
  );
}

function DigitalSupplySection() {
  return (
    <section className="overflow-x-hidden px-4 py-20 sm:px-6 md:py-28">
      <div className="mx-auto w-full min-w-0 max-w-6xl">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Dijital{" "}
            <span className="text-emerald-600">Tedarik Ağı</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-slate-500">
            Esnaf ve toptancı arasında anlık sipariş akışı. Aracısız, güvenli
            ve dükkandan çıkmadan ticaret.
          </p>
        </div>

        {/* Mobil / tablet: dikey hikaye akışı */}
        <div className="mt-12 flex w-full min-w-0 flex-col items-stretch gap-8 lg:hidden">
          <SupplyBenefitCard
            title={supplyBenefits.esnaf.title}
            tagline={supplyBenefits.esnaf.tagline}
            items={supplyBenefits.esnaf.items}
            className="w-full"
          />

          <div className="flex justify-center">
            <PhoneMockup
              elevated
              src={ASSETS.kargola}
              alt="Esnaf sipariş ekranı"
              size="lg"
              className="mx-auto max-w-[240px]"
            />
          </div>

          <SupplyDataBridge orientation="vertical" />

          <div className="flex justify-center">
            <PhoneMockup
              elevated
              src={ASSETS.toptanci}
              alt="Toptancı bildirim ekranı"
              size="lg"
              className="mx-auto max-w-[240px]"
            />
          </div>

          <SupplyBenefitCard
            title={supplyBenefits.toptanci.title}
            tagline={supplyBenefits.toptanci.tagline}
            items={supplyBenefits.toptanci.items}
            className="w-full"
          />
        </div>

        {/* Masaüstü: simetrik 5 sütun grid */}
        <div className="mt-16 hidden w-full min-w-0 lg:grid lg:grid-cols-[minmax(0,1fr)_auto_auto_auto_minmax(0,1fr)] lg:items-center lg:gap-4 xl:gap-6">
          <SupplyBenefitCard
            title={supplyBenefits.esnaf.title}
            tagline={supplyBenefits.esnaf.tagline}
            items={supplyBenefits.esnaf.items}
            className="min-w-0 justify-self-end xl:max-w-[280px]"
          />

          <div className="flex shrink-0 flex-col items-center">
            <span className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
              Esnaf
            </span>
            <PhoneMockup
              elevated
              src={ASSETS.kargola}
              alt="Esnaf sipariş ekranı"
              size="lg"
            />
          </div>

          <div className="flex shrink-0 justify-center px-1">
            <SupplyDataBridge orientation="horizontal" />
          </div>

          <div className="flex shrink-0 flex-col items-center">
            <span className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
              Toptancı
            </span>
            <PhoneMockup
              elevated
              src={ASSETS.toptanci}
              alt="Toptancı bildirim ekranı"
              size="lg"
            />
          </div>

          <SupplyBenefitCard
            title={supplyBenefits.toptanci.title}
            tagline={supplyBenefits.toptanci.tagline}
            items={supplyBenefits.toptanci.items}
            className="min-w-0 justify-self-start xl:max-w-[280px]"
          />
        </div>

        <p className="mt-10 text-center text-sm text-slate-500 md:text-base">
          Esnaf siparişi verir, Toptancı anında bildirim alır
        </p>
      </div>
    </section>
  );
}

function ModulePhoneShowcase({
  activeIndex,
  mobile = false,
}: {
  activeIndex: number;
  mobile?: boolean;
}) {
  const activeModule = galleryModules[activeIndex];

  if (mobile) {
    return (
      <div className="mx-auto w-full max-w-[280px]">
        <PhoneMockup
          src={activeModule.image}
          alt={`${activeModule.label} modülü`}
          size="lg"
          className="mx-auto w-full max-w-[280px]"
        />
      </div>
    );
  }

  return (
    <div className="relative mx-auto h-[520px] w-[240px] xl:h-[560px] xl:w-[280px]">
      {galleryModules.map((mod, index) => (
        <div
          key={mod.id}
          aria-hidden={index !== activeIndex}
          className={cn(
            "absolute inset-0 flex items-center justify-center transition-opacity duration-500 ease-in-out motion-reduce:transition-none",
            index === activeIndex ? "z-10 opacity-100" : "z-0 opacity-0"
          )}
        >
          <PhoneMockup
            src={mod.image}
            alt={`${mod.label} modülü`}
            size="xl"
            className="mx-auto"
          />
        </div>
      ))}
    </div>
  );
}

function ModuleGallerySection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const activeModule = galleryModules[activeIndex];

  useEffect(() => {
    if (isPaused) return;

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % galleryModules.length);
    }, MODULE_AUTOPLAY_MS);

    return () => window.clearInterval(timer);
  }, [isPaused, activeIndex]);

  return (
    <section id="moduller" className="overflow-x-hidden bg-slate-50 px-4 py-20 sm:px-6 md:py-28">
      <div className="mx-auto w-full min-w-0 max-w-6xl">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Nasıl görünüyor?
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-slate-500">
            Her modül, esnafın günlük ihtiyaçlarına göre tasarlandı.
          </p>
        </div>

        <div
          className="mt-10 w-full min-w-0 sm:mt-14"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onFocusCapture={() => setIsPaused(true)}
          onBlurCapture={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
              setIsPaused(false);
            }
          }}
        >
          {/* Mobil / tablet: sekmeler → içerik → telefon */}
          <div className="flex flex-col space-y-6 lg:hidden">
            <div role="tablist" aria-label="Uygulama modülleri">
              <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {galleryModules.map((mod, index) => {
                  const isActive = index === activeIndex;

                  return (
                    <button
                      key={mod.id}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      aria-controls={`module-panel-${mod.id}`}
                      id={`module-tab-${mod.id}`}
                      onClick={() => setActiveIndex(index)}
                      className={cn(
                        "shrink-0 rounded-full border px-4 py-2.5 text-xs font-bold uppercase tracking-[0.12em] transition-all duration-300 sm:px-5 sm:text-sm",
                        isActive
                          ? "border-emerald-300 bg-emerald-600 text-white shadow-md shadow-emerald-200/80"
                          : "border-slate-200 bg-white text-emerald-600 hover:border-emerald-200"
                      )}
                    >
                      {mod.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div
              className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm sm:p-6"
              role="tabpanel"
              id={`module-panel-${activeModule.id}`}
              aria-labelledby={`module-tab-${activeModule.id}`}
            >
              <h3 className="text-base font-bold uppercase tracking-[0.14em] text-emerald-600 sm:text-lg">
                {activeModule.label}
              </h3>
              <ModuleExpandedContent mod={activeModule} />
            </div>

            <ModulePhoneShowcase activeIndex={activeIndex} mobile />
          </div>

          {/* Masaüstü: iki sütun SaaS layout */}
          <div className="hidden items-start gap-12 lg:grid lg:grid-cols-2 lg:gap-16 xl:items-center">
            <div role="tablist" aria-label="Uygulama modülleri">
              <div className="flex flex-col gap-3">
                {galleryModules.map((mod, index) => {
                  const isActive = index === activeIndex;

                  return (
                    <button
                      key={mod.id}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      aria-controls={`module-panel-desktop-${mod.id}`}
                      id={`module-tab-desktop-${mod.id}`}
                      onClick={() => setActiveIndex(index)}
                      className={cn(
                        "w-full rounded-2xl border px-6 text-left transition-all duration-300 ease-out",
                        isActive
                          ? "border-emerald-200 bg-white py-5 shadow-md shadow-emerald-100/70"
                          : "border-transparent bg-transparent py-4 hover:border-slate-200 hover:bg-white/70"
                      )}
                    >
                      <h3 className="text-base font-bold uppercase tracking-[0.14em] text-emerald-600">
                        {mod.label}
                      </h3>

                      <p
                        className={cn(
                          "mt-1.5 text-sm transition-colors duration-300",
                          isActive ? "font-medium text-emerald-700/80" : "text-slate-400"
                        )}
                      >
                        {mod.subtitle}
                      </p>

                      <div
                        className={cn(
                          "grid transition-all duration-300 ease-out",
                          isActive ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                        )}
                      >
                        <div className="overflow-hidden">
                          <p className="mt-3 text-sm leading-relaxed text-slate-600">{mod.description}</p>
                          <ModuleFeatureList features={mod.features} />
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div
              className="flex justify-center lg:sticky lg:top-24 lg:justify-end"
              role="tabpanel"
              id={`module-panel-desktop-${activeModule.id}`}
              aria-labelledby={`module-tab-desktop-${activeModule.id}`}
            >
              <ModulePhoneShowcase activeIndex={activeIndex} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function HomePageClient({ faqItems = [] }: { faqItems?: FaqItem[] }) {
  return (
    <div className="min-w-0 max-w-full overflow-x-hidden">
      <HeroSection />
      <FeatureMapSection />
      <DigitalSupplySection />
      <ModuleGallerySection />
      <LandingFaqSection items={faqItems} />
    </div>
  );
}
