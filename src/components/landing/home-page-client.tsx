"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils/cn";
import { ESNAF_ROLE, getSignupHref } from "@/lib/auth/roles";
import { LandingFaqSection } from "@/components/landing/landing-faq-section";
import { LandingBlogSection } from "@/components/landing/landing-blog-section";
import { FeaturedStoresSection } from "@/components/landing/featured-stores-section";
import { ScrollShowcaseSection } from "@/components/landing/scroll-showcase-section";
import type { PublicBlogPost } from "@/lib/blog/public-blog-post.types";
import type { PublicStoreCard } from "@/lib/dukkan/public-store.types";
import type { FaqItem } from "@/types/database.types";

const HERO_BROWSER_URL = "esnafpro.app/dukkanin";

const HERO_SLIDES = [
  { src: "/assets/teknik-servis.PNG", title: "Teknik Servis" },
  { src: "/assets/hakkimizda.PNG", title: "Hakkımızda" },
  { src: "/assets/pazaryeri.PNG", title: "Pazaryeri" },
] as const;

const HERO_BROWSER_SLIDE_MS = 4000;

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
            Ücretsiz mağazanı kur,{" "}
            <span className="text-emerald-600">dükkanın bugün internette olsun</span>
          </h1>
          <p className="mt-6 text-base leading-relaxed text-slate-500 sm:text-lg">
            Kendi sayfa adresinle ürünlerini, cihazlarını ve teknik servisini tek yerde göster.
            Müşterin WhatsApp&apos;tan yazsın, arasın, yol tarifi alsın. Ürünlerini Trendyol&apos;a
            da aynı panelden gönder.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <a
              href={getSignupHref(ESNAF_ROLE, "/dukkan-ac")}
              className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-500 px-7 py-3.5 text-center text-sm font-bold text-white shadow-lg shadow-emerald-500/30 transition hover:shadow-xl hover:shadow-emerald-500/40 sm:w-auto md:hover:scale-[1.02] sm:text-base"
            >
              Ücretsiz Mağazanı Aç
            </a>
            <Link
              href="/fiyatlandirma"
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-emerald-200 hover:text-emerald-700"
            >
              Fiyatlandırmayı İncele
            </Link>
            <a
              href="#magaza-tanitim"
              className="inline-flex min-h-12 items-center justify-center px-2 py-3 text-sm font-semibold text-emerald-600 transition hover:text-emerald-700"
            >
              Mağaza nasıl görünür? →
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

export function HomePageClient({
  faqItems = [],
  featuredStores = [],
  featuredStoresHasMore = false,
  blogPosts = [],
}: {
  faqItems?: FaqItem[];
  featuredStores?: PublicStoreCard[];
  featuredStoresHasMore?: boolean;
  blogPosts?: PublicBlogPost[];
}) {
  return (
    <div className="min-w-0 max-w-full overflow-x-hidden">
      <HeroSection />
      <ScrollShowcaseSection />
      <FeaturedStoresSection
        stores={featuredStores}
        hasMore={featuredStoresHasMore}
      />
      <LandingBlogSection posts={blogPosts} />
      <LandingFaqSection items={faqItems} />
    </div>
  );
}
