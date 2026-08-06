import { getVisibleFaqItems } from "@/lib/dukkan/faq";
import type { FaqItem } from "@/types/database.types";

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
  dukkan_fotograflari?: string[] | null;
  anasayfa_sss?: FaqItem[] | null;
  iletisim_sss?: FaqItem[] | null;
  hakkimizda_sss?: FaqItem[] | null;
  teknik_servis_sss?: FaqItem[] | null;
};

export type ProfileHealthResult = {
  score: number;
  message: string;
  breakdown: { label: string; points: number; max: number; filled: boolean }[];
};

const WEIGHTS = {
  logo: 15,
  banner: 15,
  aciklama: 15,
  social: 10,
  contact: 10,
  location: 15,
  faq: 10,
  gallery: 10,
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

function hasLocation(input: ProfileHealthInput): boolean {
  const hasAddress = hasText(input.adres);
  const hasCoords = input.enlem != null && input.boylam != null;
  return hasAddress && hasCoords;
}

function hasAnyFaq(input: ProfileHealthInput): boolean {
  const pools = [
    input.anasayfa_sss,
    input.iletisim_sss,
    input.hakkimizda_sss,
    input.teknik_servis_sss,
  ];

  return pools.some((pool) => getVisibleFaqItems(pool).length > 0);
}

function hasGallery(input: ProfileHealthInput): boolean {
  return (input.dukkan_fotograflari?.filter(Boolean).length ?? 0) > 0;
}

export function calculateProfileHealthScore(
  input: ProfileHealthInput
): ProfileHealthResult {
  const breakdown = [
    {
      label: "Logo",
      points: hasText(input.logo_url) ? WEIGHTS.logo : 0,
      max: WEIGHTS.logo,
      filled: hasText(input.logo_url),
    },
    {
      label: "Kapak fotoğrafı",
      points: hasText(input.banner_url) ? WEIGHTS.banner : 0,
      max: WEIGHTS.banner,
      filled: hasText(input.banner_url),
    },
    {
      label: "Hakkımızda metni",
      points: hasText(input.aciklama) ? WEIGHTS.aciklama : 0,
      max: WEIGHTS.aciklama,
      filled: hasText(input.aciklama),
    },
    {
      label: "Sosyal medya",
      points: hasAnySocial(input) ? WEIGHTS.social : 0,
      max: WEIGHTS.social,
      filled: hasAnySocial(input),
    },
    {
      label: "Telefon / WhatsApp",
      points: hasContact(input) ? WEIGHTS.contact : 0,
      max: WEIGHTS.contact,
      filled: hasContact(input),
    },
    {
      label: "Konum bilgisi",
      points: hasLocation(input) ? WEIGHTS.location : 0,
      max: WEIGHTS.location,
      filled: hasLocation(input),
    },
    {
      label: "SSS içeriği",
      points: hasAnyFaq(input) ? WEIGHTS.faq : 0,
      max: WEIGHTS.faq,
      filled: hasAnyFaq(input),
    },
    {
      label: "Mağaza galerisi",
      points: hasGallery(input) ? WEIGHTS.gallery : 0,
      max: WEIGHTS.gallery,
      filled: hasGallery(input),
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
    return "👑 Tebrikler, profilin %100! Artık Google algoritmasının gözdesisin, bölendeki aramalarda en önde çıkmayı garantiledin.";
  }

  if (score >= 80) {
    return "🔥 Harika gidiyorsun! Profil gücün %80'in üzerinde. Şu an yerel aramalarda (SEO konusunda) diğer esnaf arkadaşlarından çok daha ileridesin!";
  }

  if (score < 50) {
    return "⚠️ Profil gücün düşük. Bölendeki diğer esnaf seni aramalarda geçiyor, vitrinini güçlendir.";
  }

  return "Vitrinini biraz daha doldurarak yerel aramalardaki görünürlüğünü artırabilirsin.";
}
