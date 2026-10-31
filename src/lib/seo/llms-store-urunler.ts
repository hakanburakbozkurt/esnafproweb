import { getUrunStokBadge } from "@/lib/dukkan/urun-stok";
import { ayirKategori } from "@/lib/dukkan/vitrin-kategorileri";
import {
  buildUrunSluglari,
  buildVitrinKlasorleri,
  vitrinKlasorPath,
  vitrinUrunPath,
} from "@/lib/dukkan/vitrin-klasorleri";

/** llms.txt dosyasında dükkan başına en fazla bu kadar ürün listelenir. */
export const LLMS_MAX_URUN = 200;

const NOT_MAX_LENGTH = 160;

export type LlmsUrunLink = { path: string; title: string; note?: string };

export type LlmsUrunKaynagi = {
  id: string;
  urun_adi: string;
  urun_aciklama: string | null;
  urun_kategorisi: string | null;
  fiyat: string | null;
  stok_adedi: number | null;
};

function kisalt(metin: string, max = NOT_MAX_LENGTH): string {
  const normalized = metin.replace(/\s+/g, " ").trim();
  if (normalized.length <= max) return normalized;
  return `${normalized.slice(0, max - 1).trim()}…`;
}

/**
 * Dükkanın ürün ve kategori bağlantılarını üretir.
 * `urunler` vitrinle aynı sırada (aktif, sira artan) verilmelidir; ürün adresleri
 * vitrindeki ile birebir aynı çıkar (çakışma eki de aynı sırayla verilir).
 */
export function buildStoreUrunLinks(
  shopSlug: string,
  urunler: LlmsUrunKaynagi[]
): { urunLinks: LlmsUrunLink[]; kategoriLinks: LlmsUrunLink[]; urunToplam: number } {
  const urunSluglari = buildUrunSluglari(urunler);

  const urunLinks: LlmsUrunLink[] = urunler.slice(0, LLMS_MAX_URUN).map((urun) => {
    const slug = urunSluglari.get(urun.id) ?? "urun";
    const { ana } = ayirKategori(urun.urun_kategorisi);
    const fiyat = urun.fiyat?.trim();
    const stok = getUrunStokBadge(urun.stok_adedi)?.label;
    const ozet = [ana || "Diğer Ürünler", fiyat || "Fiyat için sorun", stok].filter(Boolean).join(" · ");
    const aciklama = urun.urun_aciklama?.trim();

    return {
      path: vitrinUrunPath(shopSlug, slug),
      title: urun.urun_adi.trim(),
      note: kisalt([ozet, aciklama].filter(Boolean).join(". ")),
    };
  });

  const klasorler = buildVitrinKlasorleri(urunler, []);
  const kategoriLinks: LlmsUrunLink[] = klasorler.map((klasor) => {
    const altlar = klasor.altlar.map((alt) => alt.ad).join(", ");
    return {
      path: vitrinKlasorPath(shopSlug, klasor.slug),
      title: klasor.ad,
      note: kisalt(`${klasor.urunSayisi} ürün${altlar ? `. Alt kategoriler: ${altlar}` : ""}`),
    };
  });

  return { urunLinks, kategoriLinks, urunToplam: urunler.length };
}
