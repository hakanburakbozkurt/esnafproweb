import {
  parseCalismaSaatleri,
  serializeCalismaSaatleri,
  validateWeeklySchedule,
} from "@/lib/dukkan/calisma-saatleri";
import {
  parseCoordinateInput,
  validateCoordinates,
} from "@/lib/dukkan/location";
import type { FaqItem } from "@/types/database.types";
import { slugify } from "@/lib/utils/slug";
import { validateDukkanAdi, validateSlug } from "@/lib/utils/reserved-slugs";
import {
  isMarkaTermsAccepted,
  MARKA_TERMS_REQUIRED_ERROR,
} from "@/lib/dukkan/marka-terms";
import {
  normalizeSocialUrl,
  normalizeWhatsAppNumber,
  validateSocialUrl,
  validateWhatsAppNumber,
} from "@/lib/dukkan/contact";
import {
  parseGoogleMapsInput,
  validateGoogleMapsReferenceInput,
} from "@/lib/google-reviews/place-id";
import {
  MAX_GALLERY_PHOTOS,
  MAX_PRODUCT_PHOTOS,
} from "@/lib/supabase/storage.constants";

export const MAX_FAQ_ITEMS = 10;

export type ParsedUrun = {
  id?: string;
  urun_adi: string;
  urun_aciklama: string | null;
  fotograf_url: string | null;
  fotograf_url_2: string | null;
  fotograf_url_3: string | null;
  gorsel_orani: "yatay" | "dikey";
};

export type ParsedDukkanForm = {
  dukkan_adi: string;
  slug: string;
  telefon: string | null;
  whatsapp: string | null;
  calisma_saatleri: string | null;
  instagram_url: string | null;
  tiktok_url: string | null;
  facebook_url: string | null;
  adres: string | null;
  enlem: number | null;
  boylam: number | null;
  aciklama: string | null;
  meta_title: string | null;
  meta_description: string | null;
  logo_url: string | null;
  banner_url: string | null;
  dukkan_fotograflari: string[];
  sss: FaqItem[];
  iletisim_sss_goster: boolean;
  teknik_servis_aktif: boolean;
  katalog_modu_aktif: boolean;
  teknik_servis_fotograf_1: string | null;
  teknik_servis_fotograf_2: string | null;
  teknik_servis_fotograf_3: string | null;
  teknik_servis_aciklama: string | null;
  teknik_servis_sss: FaqItem[];
  hakkimizda_sss: FaqItem[];
  anasayfa_sss: FaqItem[];
  urunler: ParsedUrun[];
  markaTermsAccepted: boolean;
  google_place_id: string | null;
  google_reviews_enabled: boolean;
};

export function parseFaqFromFormData(
  formData: FormData,
  prefix = "faq"
): FaqItem[] {
  const items: FaqItem[] = [];

  for (let i = 0; i < MAX_FAQ_ITEMS; i++) {
    const soru = String(formData.get(`${prefix}_soru_${i}`) ?? "").trim();
    const cevap = String(formData.get(`${prefix}_cevap_${i}`) ?? "").trim();
    if (soru && cevap) {
      items.push({ soru, cevap });
    }
  }

  return items;
}

export function parseGalleryFromFormData(formData: FormData): string[] {
  const urls: string[] = [];

  for (let i = 0; i < MAX_GALLERY_PHOTOS; i++) {
    const url = String(formData.get(`dukkan_fotografi_${i}`) ?? "").trim();
    if (url) urls.push(url);
  }

  return urls;
}

export function parseUrunlerFromFormData(formData: FormData): ParsedUrun[] {
  const items: ParsedUrun[] = [];

  for (let i = 0; i < MAX_PRODUCT_PHOTOS; i++) {
    const foto1 = String(formData.get(`fotograf_url_${i}`) ?? "").trim();
    const foto2 = String(formData.get(`fotograf_url_${i}_2`) ?? "").trim();
    const foto3 = String(formData.get(`fotograf_url_${i}_3`) ?? "").trim();

    if (!foto1 && !foto2 && !foto3) continue;

    const ad = String(formData.get(`urun_adi_${i}`) ?? "").trim();
    const aciklama = String(formData.get(`urun_aciklama_${i}`) ?? "").trim();
    const id = String(formData.get(`urun_id_${i}`) ?? "").trim();
    const gorselOraniRaw = String(formData.get(`gorsel_orani_${i}`) ?? "yatay").trim();
    const gorsel_orani = gorselOraniRaw === "dikey" ? "dikey" : "yatay";

    items.push({
      id: id || undefined,
      urun_adi: ad || `Ürün ${items.length + 1}`,
      urun_aciklama: aciklama || null,
      fotograf_url: foto1 || null,
      fotograf_url_2: foto2 || null,
      fotograf_url_3: foto3 || null,
      gorsel_orani,
    });
  }

  return items;
}

export function parseDukkanFormData(formData: FormData):
  | { data: ParsedDukkanForm }
  | { error: string } {
  const dukkanAdi = String(formData.get("dukkan_adi") ?? "").trim();
  const slugInput = String(formData.get("slug") ?? "").trim();
  const telefon = String(formData.get("telefon") ?? "").trim();
  const whatsappInput = String(formData.get("whatsapp") ?? "").trim();
  const calismaSaatleriRaw = String(formData.get("calisma_saatleri") ?? "").trim();
  const instagramInput = String(formData.get("instagram_url") ?? "").trim();
  const tiktokInput = String(formData.get("tiktok_url") ?? "").trim();
  const facebookInput = String(formData.get("facebook_url") ?? "").trim();
  const adres = String(formData.get("adres") ?? "").trim();
  const enlem = parseCoordinateInput(formData.get("enlem"));
  const boylam = parseCoordinateInput(formData.get("boylam"));
  const aciklama = String(formData.get("aciklama") ?? "").trim();
  const metaTitle = String(formData.get("meta_title") ?? "").trim();
  const metaDescription = String(formData.get("meta_description") ?? "").trim();
  const logoUrl = String(formData.get("logo_url") ?? "").trim();
  const bannerUrl = String(formData.get("banner_url") ?? "").trim();
  const iletisimSssGoster =
    String(formData.get("iletisim_sss_goster") ?? "true") === "true";
  const teknikServisAktif =
    String(formData.get("teknik_servis_aktif") ?? "false") === "true";
  const katalogModuAktif =
    String(formData.get("katalog_modu_aktif") ?? "false") === "true";
  const googleReviewsEnabled =
    String(formData.get("google_reviews_enabled") ?? "false") === "true";
  const googleMapsReference = String(
    formData.get("google_maps_reference") ?? ""
  ).trim();
  const googlePlaceId = parseGoogleMapsInput(googleMapsReference);
  const teknikServisFoto1 = String(
    formData.get("teknik_servis_fotograf_1") ?? ""
  ).trim();
  const teknikServisFoto2 = String(
    formData.get("teknik_servis_fotograf_2") ?? ""
  ).trim();
  const teknikServisFoto3 = String(
    formData.get("teknik_servis_fotograf_3") ?? ""
  ).trim();
  const teknikServisAciklama = String(
    formData.get("teknik_servis_aciklama") ?? ""
  ).trim();

  if (!dukkanAdi) {
    return { error: "Mağaza adı zorunludur." };
  }

  const dukkanAdiError = validateDukkanAdi(dukkanAdi);
  if (dukkanAdiError) {
    return { error: dukkanAdiError };
  }

  const slug = slugify(slugInput || dukkanAdi);
  const slugError = validateSlug(slug);
  if (slugError) {
    return { error: slugError };
  }

  const markaTermsAccepted = isMarkaTermsAccepted(formData);
  if (!markaTermsAccepted) {
    return { error: MARKA_TERMS_REQUIRED_ERROR };
  }

  const whatsappError = validateWhatsAppNumber(whatsappInput);
  if (whatsappError) {
    return { error: whatsappError };
  }

  for (const [value, label] of [
    [instagramInput, "Instagram"],
    [tiktokInput, "TikTok"],
    [facebookInput, "Facebook"],
  ] as const) {
    const socialError = validateSocialUrl(value);
    if (socialError) {
      return { error: `${label}: ${socialError}` };
    }
  }

  const coordinateError = validateCoordinates(enlem, boylam);
  if (coordinateError) {
    return { error: coordinateError };
  }

  let calisma_saatleri: string | null = null;
  if (calismaSaatleriRaw) {
    const schedule = parseCalismaSaatleri(calismaSaatleriRaw);
    if (!schedule) {
      return { error: "Çalışma saatleri geçersiz formatta." };
    }

    const scheduleError = validateWeeklySchedule(schedule);
    if (scheduleError) {
      return { error: scheduleError };
    }

    calisma_saatleri = serializeCalismaSaatleri(schedule);
  }

  if (googleReviewsEnabled) {
    if (!googleMapsReference) {
      return {
        error: "Google yorumları için Google Maps linki veya Place ID girin.",
      };
    }

    if (!googlePlaceId) {
      return {
        error:
          "Google Maps linki tanınmadı. Lütfen işletme sayfanızın tam linkini veya geçerli bir Place ID (ChIJ...) yapıştırın.",
      };
    }
  }

  return {
    data: {
      dukkan_adi: dukkanAdi,
      slug,
      telefon: telefon || null,
      whatsapp: whatsappInput ? normalizeWhatsAppNumber(whatsappInput) : null,
      calisma_saatleri,
      instagram_url: normalizeSocialUrl(instagramInput, "instagram"),
      tiktok_url: normalizeSocialUrl(tiktokInput, "tiktok"),
      facebook_url: normalizeSocialUrl(facebookInput, "facebook"),
      adres: adres || null,
      enlem,
      boylam,
      aciklama: aciklama || null,
      meta_title: metaTitle || null,
      meta_description: metaDescription || null,
      logo_url: logoUrl || null,
      banner_url: bannerUrl || null,
      dukkan_fotograflari: parseGalleryFromFormData(formData),
      sss: parseFaqFromFormData(formData, "iletisim_faq"),
      iletisim_sss_goster: iletisimSssGoster,
      teknik_servis_aktif: teknikServisAktif,
      katalog_modu_aktif: katalogModuAktif,
      teknik_servis_fotograf_1: teknikServisFoto1 || null,
      teknik_servis_fotograf_2: teknikServisFoto2 || null,
      teknik_servis_fotograf_3: teknikServisFoto3 || null,
      teknik_servis_aciklama: teknikServisAciklama || null,
      teknik_servis_sss: parseFaqFromFormData(formData, "servis_faq"),
      hakkimizda_sss: parseFaqFromFormData(formData, "hakkimizda_faq"),
      anasayfa_sss: parseFaqFromFormData(formData, "anasayfa_faq"),
      urunler: parseUrunlerFromFormData(formData),
      markaTermsAccepted,
      google_place_id: googlePlaceId,
      google_reviews_enabled: googleReviewsEnabled,
    },
  };
}

export function emptyFaqItem(): FaqItem {
  return { soru: "", cevap: "" };
}

export function normalizeFaqItems(items: FaqItem[] | null | undefined): FaqItem[] {
  if (!items?.length) return [emptyFaqItem()];
  return items.slice(0, MAX_FAQ_ITEMS);
}
