import type { DukkanUrunu } from "@/types/database.types";

type UrunPhotoFields = Pick<
  DukkanUrunu,
  "fotograf_url" | "fotograf_url_2" | "fotograf_url_3"
>;

export function getUrunPhotoUrls(urun: UrunPhotoFields): string[] {
  return [urun.fotograf_url, urun.fotograf_url_2, urun.fotograf_url_3].filter(
    (url): url is string => Boolean(url?.trim())
  );
}
