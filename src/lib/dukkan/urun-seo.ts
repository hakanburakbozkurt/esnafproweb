import { kisaKonumEtiketi } from "@/lib/dukkan/konum";
import { buildLocalAreaLabel } from "@/lib/dukkan/metadata";
import { formatUrunFiyatiGosterim } from "@/lib/dukkan/urun-fiyat";

/** Google arama sonucunda açıklamanın görünen yaklaşık uzunluğu */
export const URUN_META_ACIKLAMA_UZUNLUGU = 155;

type UrunSeoKaynagi = {
  urun_adi: string;
  urun_aciklama: string | null;
  fiyat: string | null;
  stok_adedi: number | null;
};

type DukkanSeoKaynagi = {
  dukkan_adi: string;
  adres?: string | null;
  semt?: string | null;
};

function kisalt(metin: string, uzunluk: number): string {
  const tek = metin.replace(/\s+/g, " ").trim();
  if (tek.length <= uzunluk) return tek;
  const kesik = tek.slice(0, uzunluk - 1);
  const sonBosluk = kesik.lastIndexOf(" ");
  return `${(sonBosluk > uzunluk * 0.6 ? kesik.slice(0, sonBosluk) : kesik).trim()}…`;
}

/**
 * Ürün sayfası başlığı: "Hayalet Cam — Esenkent, Esenyurt".
 * Arama terimi (ürün + semt/ilçe) birlikte geçsin, başlık kısa kalsın diye il
 * yazılmaz (ilçe bulunamazsa il). Sonuna "| Mağaza | EsnafPRO" eklenir.
 */
export function urunSeoBasligi(urun: Pick<UrunSeoKaynagi, "urun_adi">, dukkan: DukkanSeoKaynagi): string {
  const alan = kisaKonumEtiketi(dukkan);
  const ad = urun.urun_adi.trim();
  return alan ? `${ad} — ${alan}` : ad;
}

/**
 * Arama sonucunda kesilmeden görünmesi gereken bilgi (ürün, fiyat, mağaza,
 * ilçe) başa yazılır; esnafın açıklaması kalan yere sığdırılır.
 * Örnek: "Hayalet Cam 250 TL — Beep Mobile Store, Esenyurt, İstanbul. …"
 */
export function urunMetaAciklamasi(urun: UrunSeoKaynagi, dukkan: DukkanSeoKaynagi): string {
  const alan = buildLocalAreaLabel(dukkan);
  const fiyat = urun.stok_adedi === 0 ? null : formatUrunFiyatiGosterim(urun.fiyat);
  const urunKismi = `${urun.urun_adi.trim()}${fiyat ? ` ${fiyat}` : ""}`;
  const magazaKismi = `${dukkan.dukkan_adi}${alan ? `, ${alan}` : ""}`;
  const bas = `${urunKismi} — ${magazaKismi}.`;

  const aciklama = urun.urun_aciklama?.trim();
  const kalan = URUN_META_ACIKLAMA_UZUNLUGU - bas.length - 1;
  if (aciklama && kalan >= 40) return `${bas} ${kisalt(aciklama, kalan)}`;

  const kapanis =
    urun.stok_adedi === 0
      ? "Şu an tükendi; yeniden gelince haber almak için WhatsApp'tan yazın."
      : "Stok ve fiyat için WhatsApp'tan hemen bilgi alın.";
  return kisalt(`${bas} ${kapanis}`, URUN_META_ACIKLAMA_UZUNLUGU);
}
