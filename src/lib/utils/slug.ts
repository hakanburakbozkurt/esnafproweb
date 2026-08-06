import { SLUG_FORMAT_REGEX } from "@/lib/utils/reserved-slugs";

const TR_MAP: Record<string, string> = {
  ç: "c",
  Ç: "c",
  ğ: "g",
  Ğ: "g",
  ı: "i",
  İ: "i",
  ö: "o",
  Ö: "o",
  ş: "s",
  Ş: "s",
  ü: "u",
  Ü: "u",
};

function transliterateTurkish(value: string): string {
  return value
    .split("")
    .map((char) => TR_MAP[char] ?? char)
    .join("");
}

/**
 * Metni vitrin slug'ına çevirir:
 * küçük harf, Türkçe karakter dönüşümü, boşluk/özel karakter → tire.
 */
export function slugify(value: string): string {
  return sanitizeSlugInput(value);
}

/** Canlı giriş ve slugify için ortak temizleme */
export function sanitizeSlugInput(value: string): string {
  return transliterateTurkish(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function isValidSlugFormat(slug: string): boolean {
  return SLUG_FORMAT_REGEX.test(slug);
}
