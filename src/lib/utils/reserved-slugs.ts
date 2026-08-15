import { slugify } from "@/lib/utils/slug";

/** Dükkan adı / slug için yasaklı kelime veya marka kullanıldığında gösterilir */
export const RESERVED_SLUG_VIOLATION_MESSAGE =
  "Bu isim tescilli bir marka veya sistem kelimesi olduğu için dükkan adı/slug olarak kullanılamaz.";

// --- ESNAFPRO DÜKKAN SLUG KORUMA HAVUZU ---
const USER_RESERVED_SLUGS = [
  // 1. Sistem & Teknik Rotalar
  "admin",
  "api",
  "auth",
  "login",
  "register",
  "dashboard",
  "settings",
  "pazaryeri",
  "root",
  "support",
  "help",
  "shop",
  "store",
  "cart",
  "checkout",
  "odeme",
  "panel",
  "yonetim",
  "kasa",
  "stok",

  // 2. Telefon Üreticileri & Donanım Devleri
  "apple",
  "samsung",
  "xiaomi",
  "huawei",
  "oppo",
  "vivo",
  "realme",
  "oneplus",
  "redmi",
  "poco",
  "tecno",
  "infinix",
  "honor",
  "motorola",
  "nokia",
  "sony",
  "lg",
  "asus",
  "lenovo",
  "zte",
  "meizu",
  "htc",
  "blackberry",
  "reeder",
  "vestel",
  "casper",
  "generalmobile",
  "tcl",
  "nothing",

  // 3. Operatörler & Büyük Elektronik Zincirleri
  "turkcell",
  "vodafone",
  "turktelekom",
  "bimcell",
  "teknosa",
  "mediamarkt",
  "vatan",
  "boyner",
  "migros",
  "carrefour",
  "hepsiburada",
  "trendyol",
  "n11",
  "gittigidiyor",
  "amazon",
  "pazarama",
  "eptm",
  "eptt",
  "bimeks",

  // 4. Aksesuar, Ses & Batarya Markaları
  "spigen",
  "baseus",
  "anker",
  "buff",
  "wildblood",
  "krusell",
  "mcdodo",
  "ugreen",
  "ringke",
  "otterbox",
  "belkin",
  "jbl",
  "marshall",
  "xiaomitr",
  "appletr",
  "samsungtr",
  "jabra",
  "sennheiser",
  "beats",
  "promate",
  "remax",
  "baseustr",
] as const;

/** Uygulama rotaları — kullanıcı listesine ek koruma */
const APP_RESERVED_SLUGS = [
  "ayarlar",
  "blog",
  "config",
  "destek",
  "dukkan-ac",
  "dukkan-ayarlari",
  "fiyatlandirma",
  "giris",
  "hakkimizda",
  "iletisim",
  "katalog",
  "logout",
  "magaza",
  "servis-takip",
  "signin",
  "signup",
  "sifre-sifirla",
  "sistem",
  "teknik-servis",
  "toptanci",
  "toptanci-ac",
  "toptanci-ayarlari",
  "www",
  "yeni-sifre",
] as const;

/** Küçük harfe normalize edilmiş, tekrarsız havuz */
export const RESERVED_SLUGS = [
  ...new Set(
    [...USER_RESERVED_SLUGS, ...APP_RESERVED_SLUGS].map((item) =>
      item.trim().toLowerCase()
    )
  ),
];

const RESERVED_SLUG_SET = new Set(RESERVED_SLUGS);

export type ReservedSlug = (typeof USER_RESERVED_SLUGS)[number];

/** Yalnızca küçük harf, rakam ve tire; tire ile başlayıp bitemez */
export const SLUG_FORMAT_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * Yasaklı slug kontrolü — yalnızca tam eşleşme.
 * Örn: "apple", "samsung", "admin" engellenir;
 * "apple-servis", "ahmet-samsung-teknik" serbesttir.
 */
export function findReservedSlugConflict(input: string): string | null {
  const slugForm = slugify(input.trim());
  if (!slugForm) return null;

  if (RESERVED_SLUG_SET.has(slugForm)) {
    return slugForm;
  }

  return null;
}

export function isReservedSlug(input: string): boolean {
  return findReservedSlugConflict(input) !== null;
}

export function validateSlugFormat(slug: string): string | null {
  if (!slug) {
    return "Geçerli bir vitrin adresi (slug) girin.";
  }

  if (slug.length < 2) {
    return "Vitrin adresi en az 2 karakter olmalıdır.";
  }

  if (slug.length > 64) {
    return "Vitrin adresi en fazla 64 karakter olabilir.";
  }

  if (!SLUG_FORMAT_REGEX.test(slug)) {
    return "Vitrin adresi yalnızca küçük harf, rakam ve tire (-) içerebilir; tire ile başlayıp bitemez.";
  }

  return null;
}

export function validateReservedSlugContent(input: string): string | null {
  if (!findReservedSlugConflict(input)) return null;
  return RESERVED_SLUG_VIOLATION_MESSAGE;
}

export function validateSlugNotReserved(slug: string): string | null {
  return validateReservedSlugContent(slug);
}

export function validateSlug(slug: string): string | null {
  return validateSlugFormat(slug) ?? validateReservedSlugContent(slug);
}

/** Mağaza adı için yasaklı kelime / marka kontrolü */
export function validateDukkanAdi(dukkanAdi: string): string | null {
  const trimmed = dukkanAdi.trim();
  if (!trimmed) return null;
  return validateReservedSlugContent(trimmed);
}
