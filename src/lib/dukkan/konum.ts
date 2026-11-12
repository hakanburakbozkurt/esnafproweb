import { parseLocationFromAdres } from "@/lib/dukkan/faq-placeholders";
import { sadeKonumMetni, semtBulAdresten } from "@/lib/dukkan/ilce-verisi";

/**
 * Dükkanın konum bilgisi. Esnaf "Semt" alanına bölge adını (Esenkent,
 * Bahçeşehir…) yazabilir; boşsa semt adresten bulunmaya çalışılır.
 * Eski çağrılar için düz adres metni de kabul edilir.
 */
export type KonumGirdisi =
  | string
  | null
  | undefined
  | { adres?: string | null; semt?: string | null };

export type DukkanKonumu = { il: string | null; ilce: string | null; semt: string | null };

export const MAX_SEMT_LENGTH = 40;

/** Formdan gelen semt: tek satır, kısa, baş/son boşluksuz. */
export function normalizeSemt(value: string | null | undefined): string | null {
  const temiz = value?.replace(/\s+/g, " ").trim().slice(0, MAX_SEMT_LENGTH).trim();
  return temiz || null;
}

export function cozKonum(girdi: KonumGirdisi): DukkanKonumu {
  const adres = typeof girdi === "object" && girdi !== null ? girdi.adres : girdi;
  const elleSemt = typeof girdi === "object" && girdi !== null ? normalizeSemt(girdi.semt) : null;
  const { il, ilce } = parseLocationFromAdres(adres);
  let semt = elleSemt ?? (adres?.trim() ? semtBulAdresten(adres, ilce) : null);
  // Semt ilçe ya da il ile aynıysa tekrar yazılmaz
  if (semt && [ilce, il].some((ad) => ad && sadeKonumMetni(ad) === sadeKonumMetni(semt as string))) {
    semt = null;
  }
  return { il, ilce, semt };
}

/** "Esenkent, Esenyurt, İstanbul" — açıklama ve JSON-LD için tam etiket */
export function konumEtiketi(girdi: KonumGirdisi): string | null {
  const { il, ilce, semt } = cozKonum(girdi);
  const parcalar = [semt, ilce, il].filter(Boolean);
  return parcalar.length ? parcalar.join(", ") : null;
}

/** "Esenkent, Esenyurt" — başlık için kısa etiket (il yazılmaz, yer kazanılır) */
export function kisaKonumEtiketi(girdi: KonumGirdisi): string | null {
  const { il, ilce, semt } = cozKonum(girdi);
  const parcalar = [semt, ilce ?? il].filter(Boolean);
  return parcalar.length ? parcalar.join(", ") : null;
}

/** Metin semt veya ilçeyi zaten içeriyorsa konum yeniden eklenmez. */
export function metinKonumIceriyor(metin: string, girdi: KonumGirdisi): boolean {
  const { il, ilce, semt } = cozKonum(girdi);
  const sade = ` ${sadeKonumMetni(metin).replace(/[^a-z0-9]+/g, " ")} `;
  return [semt, ilce ?? il]
    .filter((ad): ad is string => Boolean(ad))
    .some((ad) => sade.includes(` ${sadeKonumMetni(ad).replace(/[^a-z0-9]+/g, " ").trim()} `));
}
