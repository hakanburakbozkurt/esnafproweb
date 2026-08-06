import { DAY_ORDER, parseCalismaSaatleri } from "@/lib/dukkan/calisma-saatleri";
import { getVisibleFaqItems } from "@/lib/dukkan/faq";
import type { FaqItem } from "@/types/database.types";

export type SeoGeoScoreInput = {
  adres?: string | null;
  enlem?: number | null;
  boylam?: number | null;
  aciklama?: string | null;
  anasayfa_sss?: FaqItem[] | null;
  iletisim_sss?: FaqItem[] | null;
  hakkimizda_sss?: FaqItem[] | null;
  teknik_servis_sss?: FaqItem[] | null;
  calisma_saatleri?: string | null;
  whatsapp?: string | null;
  blogPostCount: number;
};

export type SeoGeoBreakdownItem = {
  label: string;
  points: number;
  max: number;
  filled: boolean;
};

export type SeoGeoScoreResult = {
  score: number;
  breakdown: SeoGeoBreakdownItem[];
};

const WEIGHTS = {
  districtMap: 25,
  aboutKeywords: 20,
  faq: 20,
  blog: 20,
  schemaContact: 15,
} as const;

const HAKKIMIZDA_MIN_LENGTH = 100;

function hasText(value: string | null | undefined): boolean {
  return Boolean(value?.trim());
}

function hasDistrictAndMap(input: SeoGeoScoreInput): boolean {
  const adres = input.adres?.trim() ?? "";
  const hasDistrictHint = adres.length >= 8;
  const hasCoords = input.enlem != null && input.boylam != null;
  return hasDistrictHint && hasCoords;
}

function hasKeywordRichAbout(input: SeoGeoScoreInput): boolean {
  return (input.aciklama?.trim().length ?? 0) >= HAKKIMIZDA_MIN_LENGTH;
}

function countAllVisibleFaq(input: SeoGeoScoreInput): number {
  const pools = [
    input.anasayfa_sss,
    input.iletisim_sss,
    input.hakkimizda_sss,
    input.teknik_servis_sss,
  ];

  return pools.reduce(
    (sum, pool) => sum + getVisibleFaqItems(pool).length,
    0
  );
}

function scoreFaq(count: number): number {
  if (count >= 3) return WEIGHTS.faq;
  if (count >= 1) return 10;
  return 0;
}

function hasSchemaHoursAndWhatsapp(input: SeoGeoScoreInput): boolean {
  if (!hasText(input.whatsapp)) return false;

  const schedule = parseCalismaSaatleri(input.calisma_saatleri);
  if (!schedule) return false;

  return DAY_ORDER.every((day) => {
    const entry = schedule.gunler[day];
    return Boolean(entry?.baslangic && entry?.bitis);
  });
}

export function calculateSeoGeoScore(input: SeoGeoScoreInput): SeoGeoScoreResult {
  const faqCount = countAllVisibleFaq(input);
  const faqPoints = scoreFaq(faqCount);
  const districtMap = hasDistrictAndMap(input);
  const aboutKeywords = hasKeywordRichAbout(input);
  const blogFilled = input.blogPostCount >= 1;
  const schemaContact = hasSchemaHoursAndWhatsapp(input);

  const breakdown: SeoGeoBreakdownItem[] = [
    {
      label: "İlçe ve harita konumu",
      points: districtMap ? WEIGHTS.districtMap : 0,
      max: WEIGHTS.districtMap,
      filled: districtMap,
    },
    {
      label: "Anahtar kelime uyumlu Hakkımızda",
      points: aboutKeywords ? WEIGHTS.aboutKeywords : 0,
      max: WEIGHTS.aboutKeywords,
      filled: aboutKeywords,
    },
    {
      label: "SSS modülü",
      points: faqPoints,
      max: WEIGHTS.faq,
      filled: faqPoints >= WEIGHTS.faq,
    },
    {
      label: "Yerel blog / duyuru",
      points: blogFilled ? WEIGHTS.blog : 0,
      max: WEIGHTS.blog,
      filled: blogFilled,
    },
    {
      label: "Çalışma saatleri & WhatsApp schema",
      points: schemaContact ? WEIGHTS.schemaContact : 0,
      max: WEIGHTS.schemaContact,
      filled: schemaContact,
    },
  ];

  const score = breakdown.reduce((sum, item) => sum + item.points, 0);

  return { score, breakdown };
}

export type EsnafKocuTip = {
  message: string;
  href?: string;
  cta?: string;
};

export function buildEsnafKocuTips(
  seo: SeoGeoScoreResult,
  profileScore: number
): EsnafKocuTip[] {
  const tips: EsnafKocuTip[] = [];
  const seoScore = seo.score;

  const faqItem = seo.breakdown.find((item) => item.label === "SSS modülü");
  const faqPoints = faqItem?.points ?? 0;

  if (faqPoints < 20) {
    const needed = faqPoints === 0 ? 2 : 1;
    tips.push({
      message: `SEO skorun ${seoScore}'ta. Yapay zeka aramalarında öne çıkmak için hemen ${needed} SSS sorusu daha ekle!`,
      href: "/dukkan-ayarlari",
      cta: "SSS Ekle",
    });
  }

  if (!seo.breakdown.find((item) => item.label === "İlçe ve harita konumu")?.filled) {
    tips.push({
      message: `Profil gücün %${profileScore}, SEO skorun ${seoScore}. Google Haritalar ve yerel aramalarda görünmek için adres (ilçe dahil) ve harita pinini tamamla.`,
      href: "/dukkan-ayarlari",
      cta: "Konumu Güncelle",
    });
  }

  if (!seo.breakdown.find((item) => item.label === "Anahtar kelime uyumlu Hakkımızda")?.filled) {
    tips.push({
      message: `SEO skorun ${seoScore}. Hakkımızda metnini en az ${HAKKIMIZDA_MIN_LENGTH} karaktere çıkar; ilçe ve hizmet anahtar kelimelerini doğal şekilde ekle.`,
      href: "/dukkan-ayarlari",
      cta: "Metni Güçlendir",
    });
  }

  if (!seo.breakdown.find((item) => item.label === "Yerel blog / duyuru")?.filled) {
    tips.push({
      message: `SEO skorun ${seoScore}. Bölgenizdeki müşteriler seni Google'da daha kolay bulsun diye ilk yerel blog yazını hemen oluştur!`,
      href: "/yonetim/blog/yeni",
      cta: "İlk Yazımı Ekle",
    });
  }

  if (!seo.breakdown.find((item) => item.label === "Çalışma saatleri & WhatsApp schema")?.filled) {
    tips.push({
      message: `SEO skorun ${seoScore}. Schema uyumu için 7 günlük çalışma saatlerini yapılandır ve WhatsApp numaranı ekle.`,
      href: "/dukkan-ayarlari",
      cta: "İletişimi Tamamla",
    });
  }

  if (profileScore < 50 && tips.length < 3) {
    tips.push({
      message: `Profil gücün %${profileScore}. Vitrin fotoğrafları ve iletişim bilgilerini tamamlayarak yerel aramalardaki güvenilirliğini artır.`,
      href: "/dukkan-ayarlari",
      cta: "Profili Güçlendir",
    });
  }

  if (seoScore >= 80 && profileScore >= 80) {
    return [
      {
        message: `Profil gücün %${profileScore}, SEO skorun ${seoScore}. Harika gidiyorsun — yerel aramalarda rakiplerinin önündesin!`,
      },
    ];
  }

  return tips.slice(0, 2);
}
