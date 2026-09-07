export type ProfileHealthBreakdownItem = {
  label: string;
  points: number;
  max: number;
  filled: boolean;
};

export type ProfileHealthInput = {
  logo_url?: string | null;
  banner_url?: string | null;
  aciklama?: string | null;
  instagram_url?: string | null;
  tiktok_url?: string | null;
  facebook_url?: string | null;
  telefon?: string | null;
  whatsapp?: string | null;
  adres?: string | null;
  enlem?: number | null;
  boylam?: number | null;
  google_business_url?: string | null;
  /** Tüm vitrin SSS havuzlarındaki toplam soru sayısı */
  faqQuestionCount?: number;
  /** dukkan_blog_yazilari kayıt sayısı */
  blogPostCount?: number;
};

export type ProfileHealthResult = {
  score: number;
  message: string;
  breakdown: ProfileHealthBreakdownItem[];
};

export const SCORE_WEIGHTS = {
  logo: 5,
  banner: 5,
  about: 10,
  contactSocial: 10,
  location: 15,
  faqPerQuestion: 2,
  faqMaxQuestions: 15,
  faqMax: 30,
  blogPerPost: 5,
  blogMaxPosts: 5,
  blogMax: 25,
} as const;

function hasText(value: string | null | undefined): boolean {
  return Boolean(value?.trim());
}

function hasAnySocial(input: ProfileHealthInput): boolean {
  return (
    hasText(input.instagram_url) ||
    hasText(input.tiktok_url) ||
    hasText(input.facebook_url)
  );
}

function hasContact(input: ProfileHealthInput): boolean {
  return hasText(input.telefon) || hasText(input.whatsapp);
}

function hasContactAndSocial(input: ProfileHealthInput): boolean {
  return hasContact(input) && hasAnySocial(input);
}

function hasLocationAndMap(input: ProfileHealthInput): boolean {
  const hasAddress = hasText(input.adres);
  const hasCoords = input.enlem != null && input.boylam != null;
  const hasGoogleBusiness = hasText(input.google_business_url);
  return hasAddress && (hasCoords || hasGoogleBusiness);
}

function scoreFaq(questionCount: number): number {
  const capped = Math.min(
    Math.max(questionCount, 0),
    SCORE_WEIGHTS.faqMaxQuestions
  );
  return capped * SCORE_WEIGHTS.faqPerQuestion;
}

function scoreBlog(postCount: number): number {
  const capped = Math.min(Math.max(postCount, 0), SCORE_WEIGHTS.blogMaxPosts);
  return capped * SCORE_WEIGHTS.blogPerPost;
}

export function calculateProfileHealthScore(
  input: ProfileHealthInput
): ProfileHealthResult {
  const faqCount = Math.max(input.faqQuestionCount ?? 0, 0);
  const blogCount = Math.max(input.blogPostCount ?? 0, 0);
  const faqPoints = scoreFaq(faqCount);
  const blogPoints = scoreBlog(blogCount);
  const faqCappedCount = Math.min(faqCount, SCORE_WEIGHTS.faqMaxQuestions);
  const blogCappedCount = Math.min(blogCount, SCORE_WEIGHTS.blogMaxPosts);

  const breakdown: ProfileHealthBreakdownItem[] = [
    {
      label: "Logo",
      points: hasText(input.logo_url) ? SCORE_WEIGHTS.logo : 0,
      max: SCORE_WEIGHTS.logo,
      filled: hasText(input.logo_url),
    },
    {
      label: "Kapak fotoğrafı",
      points: hasText(input.banner_url) ? SCORE_WEIGHTS.banner : 0,
      max: SCORE_WEIGHTS.banner,
      filled: hasText(input.banner_url),
    },
    {
      label: "Hakkımızda metni",
      points: hasText(input.aciklama) ? SCORE_WEIGHTS.about : 0,
      max: SCORE_WEIGHTS.about,
      filled: hasText(input.aciklama),
    },
    {
      label: "İletişim / sosyal medya",
      points: hasContactAndSocial(input) ? SCORE_WEIGHTS.contactSocial : 0,
      max: SCORE_WEIGHTS.contactSocial,
      filled: hasContactAndSocial(input),
    },
    {
      label: "Konum & harita",
      points: hasLocationAndMap(input) ? SCORE_WEIGHTS.location : 0,
      max: SCORE_WEIGHTS.location,
      filled: hasLocationAndMap(input),
    },
    {
      label: `SSS (${faqCappedCount}/${SCORE_WEIGHTS.faqMaxQuestions} soru)`,
      points: faqPoints,
      max: SCORE_WEIGHTS.faqMax,
      filled: faqCount >= SCORE_WEIGHTS.faqMaxQuestions,
    },
    {
      label: `Yerel blog / duyuru (${blogCappedCount}/${SCORE_WEIGHTS.blogMaxPosts} yazı)`,
      points: blogPoints,
      max: SCORE_WEIGHTS.blogMax,
      filled: blogCount >= SCORE_WEIGHTS.blogMaxPosts,
    },
  ];

  const score = breakdown.reduce((sum, item) => sum + item.points, 0);

  return {
    score,
    message: getProfileHealthMessage(score),
    breakdown,
  };
}

export function getProfileHealthMessage(score: number): string {
  if (score >= 100) {
    return "Tebrikler — vitrinin tam puan. Yerel aramalarda güçlü bir görünürlük için tüm temel alanları tamamladın.";
  }

  if (score >= 80) {
    return "Harika gidiyorsun. Profilin güçlü; birkaç küçük ekleme ile tam puana ulaşabilirsin.";
  }

  if (score < 50) {
    return "Profil gücün düşük. SSS, blog ve iletişim alanlarını doldurarak yerel görünürlüğünü artır.";
  }

  return "Vitrinini adım adım doldurarak yerel aramalardaki görünürlüğünü yükseltebilirsin.";
}

export type EsnafKocuTip = {
  message: string;
  href?: string;
  cta?: string;
};

export function buildEsnafKocuTips(result: ProfileHealthResult): EsnafKocuTip[] {
  const tips: EsnafKocuTip[] = [];
  const { score, breakdown } = result;

  const faqItem = breakdown.find((item) => item.label.startsWith("SSS"));
  const blogItem = breakdown.find((item) => item.label.startsWith("Yerel blog"));
  const locationItem = breakdown.find((item) => item.label === "Konum & harita");
  const contactItem = breakdown.find((item) => item.label === "İletişim / sosyal medya");
  const aboutItem = breakdown.find((item) => item.label === "Hakkımızda metni");

  if (faqItem && faqItem.points < SCORE_WEIGHTS.faqMax) {
    const currentQuestions = faqItem.points / SCORE_WEIGHTS.faqPerQuestion;
    const needed = Math.min(
      SCORE_WEIGHTS.faqMaxQuestions - currentQuestions,
      3
    );
    tips.push({
      message: `Profil skorun ${score}/100. Yapay zeka aramalarında öne çıkmak için ${Math.max(1, Math.ceil(needed))} SSS sorusu daha ekle.`,
      href: "/dukkan-ayarlari",
      cta: "SSS Ekle",
    });
  }

  if (locationItem && !locationItem.filled) {
    tips.push({
      message: `Profil skorun ${score}/100. Google Haritalar ve yerel aramalarda görünmek için adres ve harita pinini tamamla.`,
      href: "/dukkan-ayarlari",
      cta: "Konumu Güncelle",
    });
  }

  if (aboutItem && !aboutItem.filled) {
    tips.push({
      message: `Profil skorun ${score}/100. Hakkımızda metnini doldur; ilçe ve hizmet anahtar kelimelerini doğal şekilde ekle.`,
      href: "/dukkan-ayarlari",
      cta: "Metni Güçlendir",
    });
  }

  if (blogItem && blogItem.points < SCORE_WEIGHTS.blogMax) {
    tips.push({
      message: `Profil skorun ${score}/100. Bölgenizdeki müşteriler seni daha kolay bulsun diye yerel blog yazısı ekle.`,
      href: "/yonetim/blog/yeni",
      cta: "Blog Yazısı Ekle",
    });
  }

  if (contactItem && !contactItem.filled) {
    tips.push({
      message: `Profil skorun ${score}/100. Telefon veya WhatsApp ile en az bir sosyal medya bağlantısını birlikte ekle.`,
      href: "/dukkan-ayarlari",
      cta: "İletişimi Tamamla",
    });
  }

  if (score >= 80) {
    return [
      {
        message: `Profil skorun ${score}/100. Harika gidiyorsun — yerel aramalarda rakiplerinin önündesin!`,
      },
    ];
  }

  return tips.slice(0, 2);
}
