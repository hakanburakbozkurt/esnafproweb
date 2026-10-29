/**
 * Trendyol ürün gönderimi için saf (yan etkisiz) yardımcılar.
 * Sunucu ve test ortamında çalışır; ağ çağrısı yapmaz.
 */
import { URUN_BARKOD_PATTERN } from "@/lib/dukkan/form-data";
import type { DukkanUrunu } from "@/types/database.types";

export const TRENDYOL_KDV_ORANLARI = [0, 1, 10, 20] as const;
export type TrendyolKdvOrani = (typeof TRENDYOL_KDV_ORANLARI)[number];

export const TRENDYOL_MAX_TITLE = 100;
export const TRENDYOL_MAX_STOK = 20000;

export type TrendyolOzellikSecimi = {
  attributeId: number;
  attributeValueId?: number;
  customAttributeValue?: string;
};

export type TrendyolKategoriOzelligi = {
  attributeId: number;
  name: string;
  required: boolean;
  allowCustom: boolean;
};

export type TrendyolUrunItem = {
  barcode: string;
  title: string;
  productMainId: string;
  brandId: number;
  categoryId: number;
  quantity: number;
  stockCode: string;
  description: string;
  listPrice: number;
  salePrice: number;
  vatRate: TrendyolKdvOrani;
  images: { url: string }[];
  attributes: TrendyolOzellikSecimi[];
};

export type TrendyolGonderimBilgisi = {
  markaId: number | null;
  kategoriId: number | null;
  kdvOrani: number | null;
  ozellikler: TrendyolOzellikSecimi[];
};

type UrunKaynak = Pick<
  DukkanUrunu,
  | "urun_adi"
  | "urun_aciklama"
  | "fiyat"
  | "stok_adedi"
  | "barkod"
  | "fotograf_url"
  | "fotograf_url_2"
  | "fotograf_url_3"
  | "fotograf_url_4"
  | "fotograf_url_5"
  | "fotograf_url_6"
  | "fotograf_url_7"
  | "fotograf_url_8"
>;

/**
 * Serbest yazılmış fiyatı sayıya çevirir.
 * "1.250 TL" → 1250, "1.250,50 ₺" → 1250.5, "250" → 250, "12.5" → 12.5.
 * Okunamazsa veya 0'dan küçük/eşitse null.
 */
export function parseFiyat(raw: string | null | undefined): number | null {
  if (!raw) return null;
  const cleaned = raw.replace(/[^\d.,]/g, "");
  if (!cleaned || !/\d/.test(cleaned)) return null;

  let normalized: string;
  if (cleaned.includes(",")) {
    // Türkçe biçim: nokta binlik, virgül ondalık
    normalized = cleaned.replace(/\./g, "").replace(",", ".").replace(/,/g, "");
  } else {
    const parts = cleaned.split(".");
    const last = parts[parts.length - 1];
    const looksLikeThousands =
      parts.length > 1 && last.length === 3 && parts.slice(1).every((p) => p.length === 3);
    normalized = looksLikeThousands ? parts.join("") : cleaned;
    if (!looksLikeThousands && parts.length > 2) return null;
  }

  const value = Number(normalized);
  if (!Number.isFinite(value) || value <= 0) return null;
  return Math.round(value * 100) / 100;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function buildTrendyolDescription(urun: Pick<UrunKaynak, "urun_adi" | "urun_aciklama">) {
  const text = (urun.urun_aciklama ?? "").trim() || urun.urun_adi.trim();
  return escapeHtml(text).replace(/\r?\n/g, "<br>").slice(0, 30000);
}

export function getUrunGorselleri(urun: UrunKaynak): string[] {
  return [
    urun.fotograf_url,
    urun.fotograf_url_2,
    urun.fotograf_url_3,
    urun.fotograf_url_4,
    urun.fotograf_url_5,
    urun.fotograf_url_6,
    urun.fotograf_url_7,
    urun.fotograf_url_8,
  ]
    .map((url) => (url ?? "").trim())
    .filter((url) => url.startsWith("https://"))
    .slice(0, 8);
}

export function isTrendyolKdvOrani(value: unknown): value is TrendyolKdvOrani {
  return TRENDYOL_KDV_ORANLARI.includes(value as TrendyolKdvOrani);
}

/** Gönderim öncesi kontrol. Eksikleri Türkçe ve tek tek döndürür. */
export function validateTrendyolGonderim(
  urun: UrunKaynak,
  bilgi: TrendyolGonderimBilgisi,
  kategoriOzellikleri: TrendyolKategoriOzelligi[]
): string[] {
  const hatalar: string[] = [];

  if (!urun.barkod || !URUN_BARKOD_PATTERN.test(urun.barkod)) {
    hatalar.push("Ürünün barkodu yok. Ürünler sayfasından barkod ekleyin.");
  }
  if (!urun.urun_adi.trim()) {
    hatalar.push("Ürün adı boş.");
  }
  if (parseFiyat(urun.fiyat) === null) {
    hatalar.push("Fiyat okunamadı. Fiyatı “1250” veya “1.250 TL” gibi yazın.");
  }
  if (getUrunGorselleri(urun).length === 0) {
    hatalar.push("En az bir ürün fotoğrafı gerekli.");
  }
  if (!bilgi.markaId) hatalar.push("Trendyol markası seçilmedi.");
  if (!bilgi.kategoriId) hatalar.push("Trendyol kategorisi seçilmedi.");
  if (!isTrendyolKdvOrani(bilgi.kdvOrani)) hatalar.push("KDV oranı seçilmedi.");

  const secilenler = new Map(bilgi.ozellikler.map((o) => [o.attributeId, o]));
  for (const ozellik of kategoriOzellikleri) {
    if (!ozellik.required) continue;
    const secim = secilenler.get(ozellik.attributeId);
    const dolu =
      secim &&
      (typeof secim.attributeValueId === "number" ||
        (ozellik.allowCustom && Boolean(secim.customAttributeValue?.trim())));
    if (!dolu) hatalar.push(`Zorunlu özellik eksik: ${ozellik.name}.`);
  }

  return hatalar;
}

/** Doğrulanmış ürün ve seçimlerden Trendyol create v2 öğesi üretir. */
export function buildTrendyolUrunItem(
  urun: UrunKaynak,
  bilgi: TrendyolGonderimBilgisi
): TrendyolUrunItem {
  const barkod = urun.barkod as string;
  const fiyat = parseFiyat(urun.fiyat) as number;
  const stok = Math.min(Math.max(urun.stok_adedi ?? 0, 0), TRENDYOL_MAX_STOK);

  return {
    barcode: barkod,
    title: urun.urun_adi.trim().slice(0, TRENDYOL_MAX_TITLE),
    productMainId: barkod,
    brandId: bilgi.markaId as number,
    categoryId: bilgi.kategoriId as number,
    quantity: stok,
    stockCode: barkod,
    description: buildTrendyolDescription(urun),
    listPrice: fiyat,
    salePrice: fiyat,
    vatRate: bilgi.kdvOrani as TrendyolKdvOrani,
    images: getUrunGorselleri(urun).map((url) => ({ url })),
    attributes: bilgi.ozellikler
      .filter(
        (o) =>
          typeof o.attributeValueId === "number" || Boolean(o.customAttributeValue?.trim())
      )
      .map((o) =>
        typeof o.attributeValueId === "number"
          ? { attributeId: o.attributeId, attributeValueId: o.attributeValueId }
          : { attributeId: o.attributeId, customAttributeValue: o.customAttributeValue!.trim() }
      ),
  };
}

/** Stok-fiyat güncellemesi için öğe. */
export function buildTrendyolStokFiyatItem(urun: Pick<UrunKaynak, "barkod" | "fiyat" | "stok_adedi">) {
  const fiyat = parseFiyat(urun.fiyat);
  if (!urun.barkod || fiyat === null) return null;
  return {
    barcode: urun.barkod,
    quantity: Math.min(Math.max(urun.stok_adedi ?? 0, 0), TRENDYOL_MAX_STOK),
    salePrice: fiyat,
    listPrice: fiyat,
  };
}

/** Ağaçtan yalnızca son seviye (ürün eklenebilir) kategorileri yolu ile çıkarır. */
export type TrendyolKategoriDugumu = {
  id: number;
  name: string;
  subCategories?: TrendyolKategoriDugumu[];
};

export type TrendyolYaprakKategori = { id: number; ad: string; yol: string };

export function flattenTrendyolKategoriler(
  dugumler: TrendyolKategoriDugumu[],
  ust: string[] = []
): TrendyolYaprakKategori[] {
  const sonuc: TrendyolYaprakKategori[] = [];
  for (const dugum of dugumler) {
    const yol = [...ust, dugum.name];
    if (!dugum.subCategories?.length) {
      sonuc.push({ id: dugum.id, ad: dugum.name, yol: yol.join(" › ") });
    } else {
      sonuc.push(...flattenTrendyolKategoriler(dugum.subCategories, yol));
    }
  }
  return sonuc;
}

export function searchTrendyolKategoriler(
  kategoriler: TrendyolYaprakKategori[],
  sorgu: string,
  limit = 30
): TrendyolYaprakKategori[] {
  const terimler = sorgu
    .toLocaleLowerCase("tr")
    .split(/\s+/)
    .filter(Boolean);
  if (!terimler.length) return [];
  return kategoriler
    .filter((k) => {
      const metin = k.yol.toLocaleLowerCase("tr");
      return terimler.every((t) => metin.includes(t));
    })
    .slice(0, limit);
}
