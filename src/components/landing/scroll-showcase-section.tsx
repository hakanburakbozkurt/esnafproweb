"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { ESNAF_ROLE, getSignupHref } from "@/lib/auth/roles";
import { cn } from "@/lib/utils/cn";

type ShowcaseStep = {
  id: string;
  label: string;
  title: string;
  description: string;
  points: readonly string[];
  image: string;
  alt: string;
  note?: string;
};

// Gerçek mağaza ekranlarından (telefon görüntüsü). Saat çubuğu kırpıldı, 600px webp.
const STEPS: readonly ShowcaseStep[] = [
  {
    id: "vitrin",
    label: "Mağaza sayfan",
    title: "Dükkanın kendi adresinde, telefonda tam ekran",
    description:
      "Mağazan esnafpro.app/dukkan-adin adresinde açılır. Ürünlerin ve cihazların kendiliğinden kategorilere ayrılır. Müşteri tek dokunuşla WhatsApp'tan yazar, arar ya da yol tarifi alır.",
    points: [
      "Kılıf, telefon, tablet gibi kategoriler kendiliğinden oluşur",
      "WhatsApp, ara ve yol tarifi butonları hep ekranın altında",
      "Google'da bulunman için hazır başlık ve açıklamalar",
    ],
    image: "/assets/web-tanitim/vitrin.webp",
    alt: "Telefonda açılmış mağaza sayfası: kapak görseli, Kılıf ve Telefonlar kategorileri, WhatsApp ve Ara butonları",
  },
  {
    id: "kategori",
    label: "Kategori sayfaları",
    title: "Her kategorinin kendi sayfası var",
    description:
      "Müşteri Kılıf'a dokunduğunda yalnızca kılıfları görür. Fiyat ve stok durumu kartın üzerinde yazar, az kalan üründe \"Son 1 adet\" uyarısı kendiliğinden çıkar.",
    points: [
      "Her kategori ve her ürün için ayrı, Google'a uygun sayfa",
      "Fiyat ve kalan stok kartta görünür",
      "Telefonun geri tuşuyla mağazaya kolayca dönülür",
    ],
    image: "/assets/web-tanitim/kategori.webp",
    alt: "Kılıf kategorisi sayfası: iki kılıf ürünü, fiyatları ve Son 1 adet stok uyarısı",
  },
  {
    id: "trendyol",
    label: "Trendyol entegrasyonu",
    title: "Ürünlerini Trendyol'a buradan gönder",
    description:
      "Barkodu olan ürünü tek dokunuşla Trendyol'a iletirsin. Stoğu ve fiyatı tek tuşla eşitlersin, ürünün durumunu panelden takip edersin. Ürünü iki yere ayrı ayrı girmekle uğraşmazsın.",
    points: [
      "Tek dokunuşla Trendyol'a gönderme",
      "Stok ve fiyatı tek tuşla eşitleme",
      "Barkodu eksik ürünler için uyarı",
    ],
    note: "Trendyol satıcı hesabı gerekir. Trendyol ürünleri kendi onayından geçirir; onay birkaç saat ile birkaç gün sürebilir.",
    image: "/assets/web-tanitim/trendyol.webp",
    alt: "Trendyol ürün listesi: Trendyol'a iletildi etiketi, Stok ve fiyatı eşitle ve Trendyol'a gönder butonları",
  },
  {
    id: "panel",
    label: "Yönetim paneli",
    title: "Dükkanının işleri tek ekranda",
    description:
      "Ürün eklemek, servis kayıtlarına bakmak ve mağaza adresini paylaşmak panelin ilk ekranında. Sayfanda neyin eksik olduğunu da burada görürsün.",
    points: [
      "Fotoğraf, fiyat ve stokla ürün ekleme",
      "Teknik servis kayıtlarını arama ve durum takibi",
      "Mağaza adresini tek dokunuşla paylaşma",
    ],
    image: "/assets/web-tanitim/panel.webp",
    alt: "Yönetim paneli: Ürün ekle, Servis kayıtları ve Vitrini paylaş kısayolları",
  },
  {
    id: "ayarlar",
    label: "Mağaza ayarları",
    title: "Sayfanı kendin düzenle, kimseyi beklemeden",
    description:
      "Mağaza adı, sayfa adresi, logo, kapak, galeri, iletişim bilgileri ve sık sorulan sorular. Hepsini telefondan değiştirirsin, değişiklik sayfana hemen yansır.",
    points: [
      "Mağaza adı ve sayfa adresi",
      "Logo, kapak ve galeri fotoğrafları",
      "İletişim bilgileri ve sık sorulan sorular",
    ],
    image: "/assets/web-tanitim/ayarlar.webp",
    alt: "Mağaza ayarları ekranı: mağaza adı ve sayfa adresi alanları",
  },
] as const;

const SIGNUP_HREF = getSignupHref(ESNAF_ROLE, "/dukkan-ac");
const DESKTOP_QUERY = "(min-width: 1024px)";
// lg:gap-16 ile aynı boşluk (4rem)
const DESKTOP_GAP_PX = 64;

const ctaClass =
  "inline-flex min-h-12 items-center justify-center rounded-full bg-emerald-600 px-7 py-3 text-base font-bold text-white shadow-lg shadow-emerald-600/25 transition hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 focus-visible:ring-offset-2";

/** Telefon gövdesi: koyu çerçeve ve üstte kamera adası. İçerik ekran alanına yerleşir. */
function PhoneBody({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "relative mx-auto w-[240px] shrink-0 rounded-[44px] bg-slate-900 p-[9px] shadow-2xl shadow-slate-900/25 ring-1 ring-slate-700/60 sm:w-[260px] lg:w-[290px]",
        className
      )}
    >
      <div className="relative aspect-[50/107] overflow-hidden rounded-[36px] bg-white">
        {/* Durum çubuğu: kamera adası ekran içeriğinin üstüne binmesin diye ayrı alan */}
        <span
          aria-hidden
          className="absolute left-1/2 top-2.5 z-10 h-[22px] w-[84px] -translate-x-1/2 rounded-full bg-slate-900"
        />
        <div className="absolute inset-x-0 bottom-0 top-[38px] overflow-hidden">{children}</div>
      </div>
    </div>
  );
}

function StepText({ step }: { step: ShowcaseStep }) {
  return (
    <div className="min-w-0">
      <p className="text-base font-semibold text-emerald-700">{step.label}</p>
      <h3 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
        {step.title}
      </h3>
      <p className="mt-4 max-w-md text-base leading-relaxed text-slate-600 sm:text-lg">
        {step.description}
      </p>
      <ul className="mt-6 space-y-3">
        {step.points.map((point) => (
          <li key={point} className="flex items-start gap-3 text-base font-medium text-slate-700">
            <span aria-hidden className="mt-2.5 size-1.5 shrink-0 rounded-full bg-emerald-500" />
            {point}
          </li>
        ))}
      </ul>
      {step.note && (
        <p className="mt-5 max-w-md border-l-2 border-emerald-200 pl-3 text-sm leading-relaxed text-slate-500">
          {step.note}
        </p>
      )}
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
    const elements = stepRefs.current.filter((el): el is HTMLDivElement => el !== null);
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

  function adimaGit(index: number) {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    stepRefs.current[index]?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
  }

  return (
    <section
      id="magaza-tanitim"
      aria-labelledby="kaydirmali-baslik"
      className="overflow-x-hidden bg-white px-4 py-20 sm:px-6 md:py-28"
    >
      <div className="mx-auto w-full max-w-6xl">
        <div className="max-w-2xl">
          <h2
            id="kaydirmali-baslik"
            className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl"
          >
            Müşterin seni telefondan bulur.{" "}
            <span className="text-emerald-600">Mağazan orada böyle görünür.</span>
          </h2>
          <p className="mt-4 text-base leading-relaxed text-slate-600 sm:text-lg">
            Aşağıdaki ekranlar gerçek bir mağazadan. Sayfanı, ürünlerini ve Trendyol
            gönderimini aynı panelden yönetirsin. Mağaza sayfası ücretsiz.
          </p>
        </div>

        {/* Mobil ve tablet: her ekran kendi telefonuyla alt alta */}
        <div className="mt-12 space-y-20 lg:hidden">
          {STEPS.map((step, index) => (
            <div key={step.id} className="flex flex-col items-center gap-10 sm:flex-row sm:gap-12">
              <PhoneBody className="sm:order-2">
                <Image
                  src={step.image}
                  alt={step.alt}
                  fill
                  sizes="260px"
                  loading={index === 0 ? "eager" : "lazy"}
                  className="object-cover object-top"
                />
              </PhoneBody>
              <div className="w-full sm:order-1">
                <StepText step={step} />
              </div>
            </div>
          ))}
        </div>

        {/* Masaüstü: solda kaydırmayla sabit kalan telefon, sağda açıklamalar */}
        <div ref={wrapperRef} className="relative mt-16 hidden lg:grid lg:grid-cols-2 lg:gap-16">
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
                  "flex min-h-[85vh] items-center transition-opacity duration-500 motion-reduce:transition-none",
                  index === activeIndex ? "opacity-100" : "opacity-35 motion-reduce:opacity-100"
                )}
              >
                <StepText step={step} />
              </div>
            ))}
          </div>

          <div
            ref={boxRef}
            className="absolute left-0 top-0 hidden h-screen w-1/2 items-center justify-center gap-8 lg:flex"
          >
            <PhoneBody>
              {STEPS.map((step, index) => (
                <Image
                  key={step.id}
                  src={step.image}
                  alt={index === activeIndex ? step.alt : ""}
                  aria-hidden={index !== activeIndex}
                  fill
                  sizes="290px"
                  loading="lazy"
                  className={cn(
                    "object-cover object-top transition duration-500 ease-out motion-reduce:transition-none",
                    index === activeIndex ? "scale-100 opacity-100" : "scale-[1.03] opacity-0"
                  )}
                />
              ))}
            </PhoneBody>

            <nav aria-label="Ekranlar" className="flex flex-col gap-1">
              {STEPS.map((step, index) => (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => adimaGit(index)}
                  aria-current={index === activeIndex ? "step" : undefined}
                  className="group flex min-h-11 items-center gap-3 text-left"
                >
                  <span
                    aria-hidden
                    className={cn(
                      "h-8 w-1 rounded-full transition-colors motion-reduce:transition-none",
                      index === activeIndex ? "bg-emerald-600" : "bg-slate-200 group-hover:bg-emerald-200"
                    )}
                  />
                  <span
                    className={cn(
                      "text-sm font-semibold transition-colors motion-reduce:transition-none",
                      index === activeIndex ? "text-slate-900" : "text-slate-400 group-hover:text-slate-600"
                    )}
                  >
                    {step.label}
                  </span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        <div className="mt-16 flex flex-col items-start gap-4 rounded-3xl bg-emerald-50 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8 lg:mt-8">
          <div>
            <p className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
              Mağaza sayfanı ücretsiz aç
            </p>
            <p className="mt-1 text-base text-slate-600">
              Kaydol, dükkanının adını yaz, ilk ürününü ekle. Sayfan hemen yayında.
            </p>
          </div>
          <a href={SIGNUP_HREF} className={cn(ctaClass, "w-full sm:w-auto")}>
            Ücretsiz kaydol
          </a>
        </div>
      </div>
    </section>
  );
}
