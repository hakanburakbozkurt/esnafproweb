import type { Dukkan } from "@/types/database.types";

type TeknikServisPhotoFields = Pick<
  Dukkan,
  | "teknik_servis_fotograf_1"
  | "teknik_servis_fotograf_2"
  | "teknik_servis_fotograf_3"
>;

export function getTeknikServisPhotos(
  dukkan: TeknikServisPhotoFields
): string[] {
  return [
    dukkan.teknik_servis_fotograf_1,
    dukkan.teknik_servis_fotograf_2,
    dukkan.teknik_servis_fotograf_3,
  ].filter((url): url is string => Boolean(url?.trim()));
}
