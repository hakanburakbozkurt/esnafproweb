import {
  normalizeSocialUrl,
  normalizeWhatsAppNumber,
  validateSocialUrl,
} from "@/lib/dukkan/contact";
import { normalizeSemt } from "@/lib/dukkan/konum";
import { MAX_GALLERY_PHOTOS } from "@/lib/supabase/storage.constants";
import { sanitizeSlugInput } from "@/lib/utils/slug";
import { validateDukkanAdi, validateSlug } from "@/lib/utils/reserved-slugs";

/**
 * Admin'in, telefoncu adına (WhatsApp'tan gelen bilgilerle) dükkan kurması.
 * Bu dosya saf fonksiyonlar içerir; veritabanı işlemleri esnaf-adina-actions.ts'te.
 *
 * Kural: admin dükkanı kurar, ama kullanım koşullarını ve şifreyi esnaf kendisi
 * belirler. Bu yüzden kurulan dükkanın terms_accepted_at alanı boş kalır;
 * esnaf davet bağlantısıyla girip koşulları onaylayınca dükkan yayına alınır.
 */

export const ESNAF_KURULUM_FOTO_TURLERI = ["logo", "banner", "galeri"] as const;
export type EsnafKurulumFotoTuru = (typeof ESNAF_KURULUM_FOTO_TURLERI)[number];

export const ESNAF_KURULUM_MAX_GALERI = MAX_GALLERY_PHOTOS;

export type EsnafKurulumGirdisi = {
  dukkan_adi: string;
  slug: string;
  email: string;
  telefon: string | null;
  whatsapp: string | null;
  adres: string | null;
  semt: string | null;
  sehir: string | null;
  aciklama: string | null;
  instagram_url: string | null;
  logo_url: string | null;
  banner_url: string | null;
  dukkan_fotograflari: string[];
  teknik_servis_aktif: boolean;
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function metin(formData: FormData, alan: string): string {
  return String(formData.get(alan) ?? "").trim();
}

function bosIseNull(deger: string): string | null {
  return deger ? deger : null;
}

/** Yalnızca kendi Supabase depomuzdaki herkese açık görsel adreslerini kabul eder. */
export function isGuvenliGorselUrl(url: string, supabaseUrl: string | undefined): boolean {
  if (!url || !supabaseUrl) return false;
  try {
    const hedef = new URL(url);
    const kaynak = new URL(supabaseUrl);
    return (
      hedef.protocol === "https:" &&
      hedef.host === kaynak.host &&
      hedef.pathname.startsWith("/storage/v1/object/public/")
    );
  } catch {
    return false;
  }
}

/** Türkiye telefon numarasını 0 5xx xxx xx xx biçimine getirir; geçersizse null. */
export function normalizeTelefon(girdi: string): string | null {
  const normal = normalizeWhatsAppNumber(girdi);
  if (!normal) return null;
  const yerel = `0${normal.slice(2)}`;
  return `${yerel.slice(0, 4)} ${yerel.slice(4, 7)} ${yerel.slice(7, 9)} ${yerel.slice(9, 11)}`;
}

export function parseEsnafKurulumFormData(
  formData: FormData,
  supabaseUrl: string | undefined
): { data: EsnafKurulumGirdisi } | { error: string } {
  const dukkanAdi = metin(formData, "dukkan_adi");
  if (dukkanAdi.length < 2) {
    return { error: "Dükkan adını yazın." };
  }
  const adHatasi = validateDukkanAdi(dukkanAdi);
  if (adHatasi) return { error: adHatasi };

  const slug = sanitizeSlugInput(metin(formData, "slug") || dukkanAdi);
  const slugHatasi = validateSlug(slug);
  if (slugHatasi) return { error: slugHatasi };

  const email = metin(formData, "email").toLowerCase();
  if (!EMAIL_REGEX.test(email)) {
    return {
      error:
        "Esnafın e-posta adresini yazın. Giriş bağlantısı ve şifre bu adrese bağlanır.",
    };
  }

  const telefonGirdi = metin(formData, "telefon");
  const telefon = telefonGirdi ? normalizeTelefon(telefonGirdi) : null;
  if (telefonGirdi && !telefon) {
    return { error: "Telefon numarası geçersiz (örn: 0555 123 45 67)." };
  }

  const whatsappGirdi = metin(formData, "whatsapp") || telefonGirdi;
  const whatsapp = whatsappGirdi ? normalizeWhatsAppNumber(whatsappGirdi) : null;
  if (metin(formData, "whatsapp") && !whatsapp) {
    return { error: "WhatsApp numarası geçersiz (örn: 0555 123 45 67)." };
  }

  const instagramGirdi = metin(formData, "instagram_url");
  if (instagramGirdi) {
    const igHatasi = validateSocialUrl(instagramGirdi);
    if (igHatasi) return { error: igHatasi };
  }

  const gorsel = (alan: string): string | null => {
    const url = metin(formData, alan);
    return url && isGuvenliGorselUrl(url, supabaseUrl) ? url : null;
  };

  const galeri = formData
    .getAll("dukkan_fotograflari")
    .map((deger) => String(deger).trim())
    .filter((url) => isGuvenliGorselUrl(url, supabaseUrl))
    .slice(0, ESNAF_KURULUM_MAX_GALERI);

  return {
    data: {
      dukkan_adi: dukkanAdi,
      slug,
      email,
      telefon,
      whatsapp,
      adres: bosIseNull(metin(formData, "adres")),
      semt: normalizeSemt(metin(formData, "semt")),
      sehir: bosIseNull(metin(formData, "sehir")),
      aciklama: bosIseNull(metin(formData, "aciklama")),
      instagram_url: instagramGirdi ? normalizeSocialUrl(instagramGirdi, "instagram") : null,
      logo_url: gorsel("logo_url"),
      banner_url: gorsel("banner_url"),
      dukkan_fotograflari: galeri,
      teknik_servis_aktif: formData.get("teknik_servis_aktif") === "on",
    },
  };
}

function konumMetni(girdi: Pick<EsnafKurulumGirdisi, "semt" | "sehir">): string | null {
  const parcalar = [girdi.semt, girdi.sehir].filter(Boolean);
  return parcalar.length ? parcalar.join(", ") : null;
}

/**
 * Admin açıklama yazmadıysa dükkana özel kısa bir tanıtım metni üretir.
 * Her dükkanda aynı cümle olmasın diye ad, semt, şehir ve hizmet bilgisi kullanılır.
 */
export function buildVarsayilanAciklama(
  girdi: Pick<EsnafKurulumGirdisi, "dukkan_adi" | "semt" | "sehir" | "teknik_servis_aktif">
): string {
  const konum = konumMetni(girdi);
  const yer = konum ? `${konum} bölgesinde` : "bölgenizde";
  const hizmet = girdi.teknik_servis_aktif
    ? "cep telefonu, aksesuar ve teknik servis"
    : "cep telefonu ve aksesuar";
  return `${girdi.dukkan_adi}, ${yer} ${hizmet} hizmeti veren bir telefoncudur. Ürünlerimizi ve cihazlarımızı bu sayfadan inceleyebilir, WhatsApp'tan yazarak ya da arayarak bize hemen ulaşabilirsiniz.`;
}

/** Google'da görünecek başlık: "Dükkan Adı | Semt Telefoncu" (60 karakteri aşmaz). */
export function buildVarsayilanMetaTitle(
  girdi: Pick<EsnafKurulumGirdisi, "dukkan_adi" | "semt" | "sehir">
): string {
  const bolge = girdi.semt ?? girdi.sehir;
  const tam = bolge ? `${girdi.dukkan_adi} | ${bolge} Telefoncu` : `${girdi.dukkan_adi} | Telefoncu`;
  return tam.length <= 60 ? tam : girdi.dukkan_adi.slice(0, 60);
}

export function buildVarsayilanMetaDescription(
  girdi: Pick<EsnafKurulumGirdisi, "dukkan_adi" | "semt" | "sehir" | "teknik_servis_aktif">
): string {
  const konum = konumMetni(girdi);
  const yer = konum ? `${konum}'da ` : "";
  const servis = girdi.teknik_servis_aktif ? ", ekran ve batarya değişimi" : "";
  const metinTam = `${yer}${girdi.dukkan_adi}: telefon, aksesuar${servis}. Ürünleri inceleyin, WhatsApp'tan yazın veya yol tarifi alın.`;
  return metinTam.length <= 160 ? metinTam : `${metinTam.slice(0, 157).trimEnd()}...`;
}

/** Esnafa WhatsApp'tan gönderilecek mesaj. */
export function buildDavetMesaji(params: {
  dukkanAdi: string;
  vitrinUrl: string;
  davetUrl: string;
}): string {
  return [
    `Merhaba, ${params.dukkanAdi} için EsnafPRO mağaza sayfanız hazır:`,
    params.vitrinUrl,
    "",
    "Hesabınıza girmek için bu bağlantıya tıklayıp kendi şifrenizi belirleyin ve kullanım koşullarını onaylayın:",
    params.davetUrl,
    "",
    "Onayladıktan sonra sayfanız Google'a açılır. Ürün ve cihazlarınızı panelden ekleyebilirsiniz.",
  ].join("\n");
}

export function buildWhatsAppPaylasimUrl(numara: string | null, mesaj: string): string {
  const metinParam = encodeURIComponent(mesaj);
  return numara
    ? `https://wa.me/${numara}?text=${metinParam}`
    : `https://wa.me/?text=${metinParam}`;
}
