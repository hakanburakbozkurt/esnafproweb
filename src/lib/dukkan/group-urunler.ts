import { getPublicSiteUrl } from "@/lib/auth/site-url";
import { buildWhatsAppUrl } from "@/lib/dukkan/contact";
import type { DukkanUrunu } from "@/types/database.types";

export type UrunKategoriGrubu = {
  /** DOM kimliği olarak kullanılabilir */
  id: string;
  /** null: tek grup varken başlık gösterilmez */
  title: string | null;
  urunler: DukkanUrunu[];
};

const DIGER_BASLIK = "Diğer ürünler";

/** Kategoriler ilk görünme sırasına göre; kategorisizler en sonda. */
export function groupUrunlerByKategori(urunler: DukkanUrunu[]): UrunKategoriGrubu[] {
  const groups = new Map<string, DukkanUrunu[]>();
  const uncategorized: DukkanUrunu[] = [];

  for (const urun of urunler) {
    const kategori = urun.urun_kategorisi?.trim();
    if (!kategori) {
      uncategorized.push(urun);
      continue;
    }
    const list = groups.get(kategori);
    if (list) list.push(urun);
    else groups.set(kategori, [urun]);
  }

  const result: UrunKategoriGrubu[] = [...groups.entries()].map(([title, list], index) => ({
    id: `urun-kategori-${index + 1}`,
    title,
    urunler: list,
  }));

  if (uncategorized.length) {
    result.push({
      id: "urun-kategori-diger",
      title: result.length ? DIGER_BASLIK : null,
      urunler: uncategorized,
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
