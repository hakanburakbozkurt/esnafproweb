import { getPublicSiteUrl } from "@/lib/auth/site-url";
import { buildWhatsAppUrl } from "@/lib/dukkan/contact";
import { ayirKategori } from "@/lib/dukkan/vitrin-kategorileri";
import type { DukkanUrunu } from "@/types/database.types";

export type UrunAltGrubu = {
  /** null: bu gruptaki ürünlerin alt kategorisi yok */
  title: string | null;
  urunler: DukkanUrunu[];
};

export type UrunKategoriGrubu = {
  /** DOM kimliği olarak kullanılabilir */
  id: string;
  /** null: tek grup varken başlık gösterilmez */
  title: string | null;
  urunler: DukkanUrunu[];
  /**
   * Alt kategori gruplari (ilk görünme sırasına göre). Yalnızca en az bir
   * ürün alt kategoriye sahipse dolu gelir; aksi halde boştur.
   */
  altGruplar: UrunAltGrubu[];
};

const DIGER_BASLIK = "Diğer ürünler";

/**
 * Ürünleri ana kategoriye göre gruplar. "Ana › Alt" biçimindeki değerlerde
 * ürünler aynı ana kategori altında toplanır, alt kategoriler ayrı ayrı tutulur.
 * Kategoriler ilk görünme sırasına göre; kategorisizler en sonda.
 */
export function groupUrunlerByKategori(urunler: DukkanUrunu[]): UrunKategoriGrubu[] {
  const groups = new Map<string, { urunler: DukkanUrunu[]; alts: Map<string, DukkanUrunu[]>; altSiz: DukkanUrunu[] }>();
  const uncategorized: DukkanUrunu[] = [];

  for (const urun of urunler) {
    const { ana, alt } = ayirKategori(urun.urun_kategorisi);
    if (!ana) {
      uncategorized.push(urun);
      continue;
    }
    let group = groups.get(ana);
    if (!group) {
      group = { urunler: [], alts: new Map(), altSiz: [] };
      groups.set(ana, group);
    }
    group.urunler.push(urun);
    if (alt) {
      const list = group.alts.get(alt);
      if (list) list.push(urun);
      else group.alts.set(alt, [urun]);
    } else {
      group.altSiz.push(urun);
    }
  }

  const result: UrunKategoriGrubu[] = [...groups.entries()].map(([title, group], index) => {
    const hasAlt = group.alts.size > 0;
    const altGruplar: UrunAltGrubu[] = hasAlt
      ? [
          ...[...group.alts.entries()].map(([altTitle, list]) => ({ title: altTitle, urunler: list })),
          ...(group.altSiz.length ? [{ title: null, urunler: group.altSiz }] : []),
        ]
      : [];
    return {
      id: `urun-kategori-${index + 1}`,
      title,
      urunler: group.urunler,
      altGruplar,
    };
  });

  if (uncategorized.length) {
    result.push({
      id: "urun-kategori-diger",
      title: result.length ? DIGER_BASLIK : null,
      urunler: uncategorized,
      altGruplar: [],
    });
  }

  return result;
}

export const URUN_QUERY_PARAM = "urun";

export function buildUrunPublicUrl(shopSlug: string, urunId: string): string {
  return `${getPublicSiteUrl()}/${shopSlug}?${URUN_QUERY_PARAM}=${encodeURIComponent(urunId)}`;
}

export function buildUrunWhatsAppUrl(
  whatsapp: string,
  shopSlug: string,
  urun: Pick<DukkanUrunu, "id" | "urun_adi">
): string {
  return buildWhatsAppUrl(
    whatsapp,
    `Merhaba, ${urun.urun_adi} ürününüzle ilgileniyorum. Detaylar: ${buildUrunPublicUrl(shopSlug, urun.id)}`
  );
}
