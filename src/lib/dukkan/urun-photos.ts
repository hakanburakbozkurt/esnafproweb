import type { DukkanUrunu } from "@/types/database.types";

export const URUN_PHOTO_KEYS = [
  "fotograf_url",
  "fotograf_url_2",
  "fotograf_url_3",
  "fotograf_url_4",
  "fotograf_url_5",
  "fotograf_url_6",
  "fotograf_url_7",
  "fotograf_url_8",
] as const;

type UrunPhotoFields = Partial<
  Pick<DukkanUrunu, (typeof URUN_PHOTO_KEYS)[number]>
>;

export function getUrunPhotoUrls(urun: UrunPhotoFields): string[] {
  return URUN_PHOTO_KEYS.map((key) => urun[key]).filter(
    (url): url is string => Boolean(url?.trim())
  );
}
