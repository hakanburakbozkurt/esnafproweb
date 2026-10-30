"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils/cn";

type ShowcaseStep = {
  id: string;
  number: string;
  title: string;
  description: string;
  points: readonly string[];
  image: string;
  alt: string;
};

// Ekran görüntüleri şimdilik mevcut modül görselleri. Gerçek uygulama
// ekranları geldiğinde yalnızca `image` ve `alt` alanları değişir.
const STEPS: readonly ShowcaseStep[] = [
  {
    id: "stok",
    number: "01",
    title: "Stoğun her zaman elinde",
    description:
      "Ürünlerini barkodla ekle, kritik seviyeye düşünce uyarı al. Excel'le uğraşmadan envanterini düzenli tut.",
    points: ["Excel'den hızlı ürün yükleme", "Kritik stok uyarıları", "Barkodla envanter takibi"],
    image: "/assets/0efb3ca7-4bc5-4568-a16b-52f83f33fd13.png",
    alt: "EsnafPRO stok yönetimi ekranı",
  },
  {
    id: "kasa",
    number: "02",
    title: "Satışı birkaç dokunuşla kapat",
    description:
      "Kart, nakit, parçalı ya da veresiye. Müşterinin durumuna göre satışını yap, kasayı anında kapat.",
    points: ["Kart, nakit, parçalı ve veresiye", "Barkodla hızlı satış", "Müşteri kaydı"],
    image: "/assets/7950dffd-6ab9-48ce-9a44-1cb909187623.png",
    alt: "EsnafPRO kasa ve satış ekranı",
  },
  {
    id: "servis",
    number: "03",
    title: "Teknik servisini takip et",
    description:
      "Hangi cihaz kime ait, hangi aşamada bilmek artık tek ekranda. Müşteri de durumunu kendi takip edebilir.",
    points: ["WhatsApp ile bilgilendirme", "Canlı servis takibi", "IMEI ve parça geçmişi"],
    image: "/assets/6e3dee91-7061-4fa7-969c-1e126439e2be.png",
    alt: "EsnafPRO teknik servis takip ekranı",
  },
  {
    id: "analiz",
    number: "04",
    title: "Dükkanının nabzını gör",
    description:
      "Ciro, kâr ve en çok satan ürünler tek ekranda. Hangi günlerin yoğun olduğunu fark et, kararlarını buna göre ver.",
    points: ["Kâr odaklı ürün raporları", "En yoğun saatler", "Son 7 günlük takvim"],
    image: "/assets/84c55db4-d07f-4999-bf3c-c8c41e7a7c7f.png",
    alt: "EsnafPRO satış analizi ekranı",
  },
] as const;

const DESKTOP_QUERY = "(min-width: 1024px)";
// lg:gap-16 ile aynı boşluk (4rem)
const DESKTOP_GAP_PX = 64;

function PhoneFrame({ step, className }: { step: ShowcaseStep; className?: string }) {
  return (
    <div
      className={cn(
        "relative mx-auto w-[220px] shrink-0 rounded-[38px] border border-emerald-100 bg-white p-[6px] shadow-xl shadow-emerald-900/10 sm:w-[250px] lg:w-[270px]",
        className
      )}
    >
      <div className="relative aspect-[9/19.5] overflow-hidden rounded-[32px] bg-emerald-50">
        <Image
          src={step.image}
          alt={step.alt}
          fill
          sizes="(max-width:1024px) 250px, 270px"
          className="object-cover object-top"
        />
      </div>
    </div>
  );
}

function StepText({ step }: { step: ShowcaseStep }) {
  return (
    <div className="min-w-0">
      <p aria-hidden className="text-5xl font-bold tracking-tight text-emerald-200 sm:text-6xl">
        {step.number}
      </p>
      <h3 className="mt-3 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
        {step.title}
      </h3>
      <p className="mt-4 max-w-md text-base leading-relaxed text-slate-600 sm:text-lg">
        {step.description}
      </p>
      <ul className="mt-6 space-y-3">
        {step.points.map((point) => (
          <li key={point} className="flex items-start gap-3 text-sm font-medium text-slate-700 sm:text-base">
            <span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-full bg-emerald-400" />
            {point}
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Sol telefon kutusunu kaydırmaya göre konumlandırır. CSS sticky kullanılmaz:
 * layout'taki body/html overflow-x-hidden, sticky'yi bozar. Üç durum vardır:
 * bölüm henüz ekrana girmedi (üstte), bölüm ekrandayken (sabit), bölüm bitti (altta).
 */
function usePinnedPhone(
  wrapperRef: React.RefObject<HTMLDivElement | null>,
  boxRef: React.RefObject<HTMLDivElement | null>
) {
  useEffect(() => {
    const wrapper = wrapperRef.current;
    const box = boxRef.current;
    if (!wrapper || !box) return;

    const mq = window.matchMedia(DESKTOP_QUERY);
    let frame = 0;

    const update = () => {
      frame = 0;
      if (!mq.matches) return;

      const rect = wrapper.getBoundingClientRect();
      const vh = window.innerHeight;
      const colWidth = (wrapper.clientWidth - DESKTOP_GAP_PX) / 2;

      if (rect.top > 0) {
        box.style.position = "absolute";
        box.style.top = "0px";
        box.style.left = "0px";
      } else if (rect.bottom > vh) {
        box.style.position = "fixed";
        box.style.top = "0px";
        box.style.left = `${rect.left}px`;
      } else {
        box.style.position = "absolute";
        box.style.top = `${rect.height - vh}px`;
        box.style.left = "0px";
      }
      box.style.width = `${colWidth}px`;
      box.style.height = `${vh}px`;
    };

    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [wrapperRef, boxRef]);
}

export function ScrollShowcaseSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const boxRef = useRef<HTMLDivElement | null>(null);

  usePinnedPhone(wrapperRef, boxRef);

  // Aktif adım: ekranın ortasından geçen metin bloğu.
  useEffect(() => {
    const elements = stepRefs.current.filter(
      (el): el is HTMLDivElement => el !== null
    );
    if (elements.length === 0 || !("IntersectionObserver" in window)) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const index = Number((entry.target as HTMLElement).dataset.index);
            if (!Number.isNaN(index)) setActiveIndex(index);
          }
        }
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const active = STEPS[activeIndex] ?? STEPS[0];

  return (
    <section
      aria-labelledby="kaydirmali-baslik"
      className="overflow-x-hidden bg-white px-4 py-20 sm:px-6 md:py-28"
    >
      <div className="mx-auto w-full max-w-6xl">
        <div className="max-w-2xl">
          <h2
            id="kaydirmali-baslik"
            className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl"
          >
            Dükkanının her ihtiyacı <span className="text-emerald-600">tek uygulamada</span>
          </h2>
          <p className="mt-4 text-base leading-relaxed text-slate-600 sm:text-lg">
            Stok, kasa, servis ve raporlar birbirine bağlı çalışır. Aşağı kaydırdıkça ekranları
            gör.
          </p>
        </div>

        {/* Mobil ve tablet: her adım kendi telefonuyla alt alta */}
        <div className="mt-12 space-y-20 lg:hidden">
          {STEPS.map((step) => (
            <div
              key={step.id}
              className="flex flex-col items-center gap-10 sm:flex-row sm:gap-12"
            >
              <PhoneFrame step={step} className="sm:order-2" />
              <div className="w-full sm:order-1">
                <StepText step={step} />
              </div>
            </div>
          ))}
        </div>

        {/* Desktop: sol tarafta kaydırmayla sabit kalan telefon, sağda adımlar */}
        <div
          ref={wrapperRef}
          className="relative mt-16 hidden lg:grid lg:grid-cols-2 lg:gap-16"
        >
          <div aria-hidden />
          <div>
            {STEPS.map((step, index) => (
              <div
                key={step.id}
                ref={(el) => {
                  stepRefs.current[index] = el;
                }}
                data-index={index}
                className={cn(
                  "flex min-h-[90vh] items-center transition-opacity duration-500 motion-reduce:transition-none",
                  index === activeIndex ? "opacity-100" : "opacity-40"
                )}
              >
                <StepText step={step} />
              </div>
            ))}
          </div>

          <div
            ref={boxRef}
            className="absolute left-0 top-0 hidden h-screen w-1/2 items-center justify-center lg:flex"
          >
            <PhoneFrame step={active} />
          </div>
        </div>
      </div>
    </section>
  );
}
