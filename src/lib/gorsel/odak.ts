/**
 * Görsel odak noktası (esnafın "fotoğrafı ortala" seçimi).
 *
 * Veritabanında ayrı sütun açmamak için odak, görsel adresinin sonuna
 * `#odak=50,30` şeklinde eklenir. `#` sonrası sunucuya hiç gitmez; görsel
 * aynı dosyadan yüklenir. Adresi dışarı verirken (Google, site haritası,
 * paylaşım) mutlaka `gorselAdresi` ile temizlenir.
 */

export type GorselOdak = { x: number; y: number };

export const VARSAYILAN_ODAK: GorselOdak = { x: 50, y: 50 };

const ODAK_DESENI = /#odak=(\d{1,3}(?:\.\d+)?),(\d{1,3}(?:\.\d+)?)$/;

function sinirla(deger: number): number {
  if (!Number.isFinite(deger)) return 50;
  return Math.min(100, Math.max(0, Math.round(deger)));
}

/** Odak işaretini atılmış, dışarıya verilebilir görsel adresi. */
export function gorselAdresi(url: string): string {
  return url.replace(ODAK_DESENI, "");
}

/** Adresteki odak noktası; yoksa ortası. */
export function gorselOdagi(url: string): GorselOdak {
  const eslesme = url.match(ODAK_DESENI);
  if (!eslesme) return VARSAYILAN_ODAK;
  return { x: sinirla(Number(eslesme[1])), y: sinirla(Number(eslesme[2])) };
}

/** Adrese odak ekler; tam ortaysa işaret hiç eklenmez. */
export function odakliGorselAdresi(url: string, odak: GorselOdak): string {
  const temiz = gorselAdresi(url);
  const x = sinirla(odak.x);
  const y = sinirla(odak.y);
  if (x === 50 && y === 50) return temiz;
  return `${temiz}#odak=${x},${y}`;
}

/** CSS `object-position` değeri. */
export function odakKonumu(url: string): string {
  const { x, y } = gorselOdagi(url);
  return `${x}% ${y}%`;
}

export type OdakliGorsel = { src: string; konum: string };

export function odakliGorsel(url: string): OdakliGorsel {
  return { src: gorselAdresi(url), konum: odakKonumu(url) };
}
