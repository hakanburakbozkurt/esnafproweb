import {
  DAY_LABELS,
  DAY_ORDER,
  formatDayHours,
  getLegacyCalismaSaatleriLines,
  isLegacyCalismaSaatleri,
  parseCalismaSaatleri,
} from "@/lib/dukkan/calisma-saatleri";

export type FaqPlaceholderContext = {
  dukkan_adi: string;
  il: string | null;
  ilce: string | null;
  adres: string | null;
  calisma_saatleri: string | null;
  telefon: string | null;
  whatsapp: string | null;
};

export type FaqPlaceholderSource = {
  dukkan_adi?: string | null;
  adres?: string | null;
  calisma_saatleri?: string | null;
  telefon?: string | null;
  whatsapp?: string | null;
};

const PLACEHOLDER_PATTERN = /\{([a-z_]+)\}/g;

const TURKIYE_ILLER = [
  "Adana",
  "Adıyaman",
  "Afyonkarahisar",
  "Ağrı",
  "Amasya",
  "Ankara",
  "Antalya",
  "Artvin",
  "Aydın",
  "Balıkesir",
  "Bilecik",
  "Bingöl",
  "Bitlis",
  "Bolu",
  "Burdur",
  "Bursa",
  "Çanakkale",
  "Çankırı",
  "Çorum",
  "Denizli",
  "Diyarbakır",
  "Edirne",
  "Elazığ",
  "Erzincan",
  "Erzurum",
  "Eskişehir",
  "Gaziantep",
  "Giresun",
  "Gümüşhane",
  "Hakkari",
  "Hatay",
  "Isparta",
  "Mersin",
  "İstanbul",
  "İzmir",
  "Kars",
  "Kastamonu",
  "Kayseri",
  "Kırklareli",
  "Kırşehir",
  "Kocaeli",
  "Konya",
  "Kütahya",
  "Malatya",
  "Manisa",
  "Kahramanmaraş",
  "Mardin",
  "Muğla",
  "Muş",
  "Nevşehir",
  "Niğde",
  "Ordu",
  "Rize",
  "Sakarya",
  "Samsun",
  "Siirt",
  "Sinop",
  "Sivas",
  "Tekirdağ",
  "Tokat",
  "Trabzon",
  "Tunceli",
  "Şanlıurfa",
  "Uşak",
  "Van",
  "Yozgat",
  "Zonguldak",
  "Aksaray",
  "Bayburt",
  "Karaman",
  "Kırıkkale",
  "Batman",
  "Şırnak",
  "Bartın",
  "Ardahan",
  "Iğdır",
  "Yalova",
  "Karabük",
  "Kilis",
  "Osmaniye",
  "Düzce",
] as const;

const IL_LOOKUP = new Map(
  TURKIYE_ILLER.map((il) => [normalizeLocationToken(il), il])
);

function normalizeLocationToken(value: string): string {
  return value
    .trim()
    .toLocaleLowerCase("tr-TR")
    .replace(/ı/g, "i")
    .replace(/İ/g, "i");
}

function findIl(value: string): string | null {
  const normalized = normalizeLocationToken(value);
  return IL_LOOKUP.get(normalized) ?? null;
}

export function parseLocationFromAdres(
  adres: string | null | undefined
): { il: string | null; ilce: string | null } {
  if (!adres?.trim()) {
    return { il: null, ilce: null };
  }

  const trimmed = adres.trim();

  const slashMatch = trimmed.match(/([^/,\n]+)\s*\/\s*([^/,\n]+)\s*$/);
  if (slashMatch) {
    const ilceCandidate = slashMatch[1].trim();
    const ilCandidate = slashMatch[2].trim();
    const il = findIl(ilCandidate);

    if (il) {
      return { il, ilce: ilceCandidate || null };
    }
  }

  const parts = trimmed
    .split(/[,/\n]/)
    .map((part) => part.trim())
    .filter(Boolean);

  for (let index = parts.length - 1; index >= 0; index -= 1) {
    const il = findIl(parts[index]);
    if (!il) continue;

    const ilce = index > 0 ? parts[index - 1] : null;
    return { il, ilce };
  }

  return { il: null, ilce: null };
}

export function formatCalismaSaatleriForFaq(
  raw: string | null | undefined
): string | null {
  if (!raw?.trim()) return null;

  if (isLegacyCalismaSaatleri(raw)) {
    const lines = getLegacyCalismaSaatleriLines(raw);
    return lines.length ? lines.join(", ") : null;
  }

  const schedule = parseCalismaSaatleri(raw);
  if (!schedule) return null;

  const openDays = DAY_ORDER.filter((day) => schedule.gunler[day].acik === true);
  if (!openDays.length) return null;

  const weekdayHours = formatDayHours(schedule.gunler.pazartesi);
  const allWeekdaysSame = ["sali", "carsamba", "persembe", "cuma"].every(
    (day) =>
      formatDayHours(schedule.gunler[day as (typeof DAY_ORDER)[number]]) ===
      weekdayHours
  );

  if (
    allWeekdaysSame &&
    openDays.includes("pazartesi") &&
    openDays.includes("cuma") &&
    weekdayHours !== "Kapalı"
  ) {
    const parts = [`Hafta içi ${weekdayHours}`];

    if (schedule.gunler.cumartesi.acik) {
      parts.push(`cumartesi ${formatDayHours(schedule.gunler.cumartesi)}`);
    } else {
      parts.push("cumartesi kapalı");
    }

    if (schedule.gunler.pazar.acik) {
      parts.push(`pazar ${formatDayHours(schedule.gunler.pazar)}`);
    } else {
      parts.push("pazar kapalı");
    }

    return `${parts.join(", ")}.`;
  }

  return DAY_ORDER.map(
    (day) => `${DAY_LABELS[day]}: ${formatDayHours(schedule.gunler[day])}`
  ).join(", ");
}

export function buildFaqPlaceholderContext(
  source: FaqPlaceholderSource
): FaqPlaceholderContext {
  const adres = source.adres?.trim() || null;
  const { il, ilce } = parseLocationFromAdres(adres);

  return {
    dukkan_adi: source.dukkan_adi?.trim() || "Mağazamız",
    il,
    ilce,
    adres,
    calisma_saatleri: source.calisma_saatleri?.trim() || null,
    telefon: source.telefon?.trim() || null,
    whatsapp: source.whatsapp?.trim() || null,
  };
}

function resolvePlaceholderValue(
  key: string,
  context: FaqPlaceholderContext
): string {
  switch (key) {
    case "dukkan_adi":
      return context.dukkan_adi;
    case "il":
      return context.il ?? "şehrinizde";
    case "ilce":
      return context.ilce ?? "bölgenizde";
    case "bolge":
      return context.ilce && context.il
        ? `${context.ilce}, ${context.il}`
        : context.ilce ?? context.il ?? "bölgenizde";
    case "adres":
      return (
        context.adres ??
        "İletişim sayfamızdaki güncel adres bilgilerinden"
      );
    case "calisma_saatleri":
      return (
        formatCalismaSaatleriForFaq(context.calisma_saatleri) ??
        "Hafta içi 09:00–19:00, cumartesi 10:00–18:00 (detaylar için iletişim sayfamıza bakın)"
      );
    case "telefon":
      return context.telefon ?? "telefon numaramızdan";
    case "whatsapp":
      return context.whatsapp ?? context.telefon ?? "WhatsApp hattımızdan";
    default:
      return `{${key}}`;
  }
}

export function resolveFaqPlaceholders(
  text: string,
  context: FaqPlaceholderContext
): string {
  if (!text.includes("{")) return text;

  return text.replace(PLACEHOLDER_PATTERN, (_, key: string) =>
    resolvePlaceholderValue(key, context)
  );
}

export function hasFaqPlaceholders(text: string): boolean {
  return /\{[a-z_]+\}/.test(text);
}
