import type { ShopSubscriptionTier } from "@/lib/local-yonetim/subscriptions/types";
import { tutarlarEsit } from "@/lib/odeme/tutar";

export const SATIN_ALINABILIR_PAKETLER = ["buyume", "pro"] as const;
export type SatinAlinabilirPaket = (typeof SATIN_ALINABILIR_PAKETLER)[number];

export const ABONELIK_SURELERI = [1, 3, 12] as const;
export type AbonelikSuresi = (typeof ABONELIK_SURELERI)[number];

export const SURE_ETIKETLERI: Record<AbonelikSuresi, string> = {
  1: "1 Ay",
  3: "3 Ay",
  12: "12 Ay",
};

export function isSatinAlinabilirPaket(value: unknown): value is SatinAlinabilirPaket {
  return value === "buyume" || value === "pro";
}

export function isAbonelikSuresi(value: unknown): value is AbonelikSuresi {
  return value === 1 || value === 3 || value === 12;
}

type PlanFiyatlari = {
  price_monthly: number;
  price_quarterly: number | null;
  price_yearly: number;
};

/** KDV dahil tutar. 3 aylık fiyat girilmemişse aylık x 3, yıllık girilmemişse aylık x 12. */
export function hesaplaAbonelikTutari(plan: PlanFiyatlari, sure: AbonelikSuresi): number {
  const aylik = Number(plan.price_monthly);
  let tutar: number;
  if (sure === 1) tutar = aylik;
  else if (sure === 3) tutar = plan.price_quarterly != null && plan.price_quarterly > 0 ? Number(plan.price_quarterly) : aylik * 3;
  else tutar = plan.price_yearly > 0 ? Number(plan.price_yearly) : aylik * 12;
  return Math.round(tutar * 100) / 100;
}

const PAKET_SIRASI: Record<ShopSubscriptionTier, number> = {
  free: 0,
  buyume: 1,
  pro: 2,
  ultra: 3,
};

/** Daha yüksek aktif paket varken düşük paket satın alınamaz (veritabanı fonksiyonuyla aynı kural). */
export function satinAlmaEngeli(
  mevcut: { tier: ShopSubscriptionTier; ucretliAktif: boolean },
  hedef: SatinAlinabilirPaket
): string | null {
  if (mevcut.ucretliAktif && PAKET_SIRASI[mevcut.tier] > PAKET_SIRASI[hedef]) {
    return "Daha yüksek bir paketiniz aktif. Süresi bitince bu paketi satın alabilirsiniz.";
  }
  return null;
}

export type OdemeAkisiModu = "kapali" | "admin" | "acik";

/** ABONELIK_ODEME_AKTIF: "on" herkese açık, "admin" yalnızca süper admin (test), diğer her şey kapalı. */
export function getOdemeAkisiModu(env: Record<string, string | undefined> = process.env): OdemeAkisiModu {
  const v = env.ABONELIK_ODEME_AKTIF?.trim().toLowerCase();
  if (v === "on") return "acik";
  if (v === "admin") return "admin";
  return "kapali";
}

export function odemeKullanilabilir(mod: OdemeAkisiModu, superAdmin: boolean): boolean {
  return mod === "acik" || (mod === "admin" && superAdmin);
}

// ---------- Fatura bilgileri ----------

export type FaturaTipi = "bireysel" | "kurumsal";

export type FaturaBilgileri = {
  tip: FaturaTipi;
  adUnvan: string;
  kimlikNo: string;
  vergiDairesi: string | null;
  adres: string;
  il: string;
  ilce: string;
  eposta: string;
  telefon: string;
};

/** T.C. kimlik numarası algoritma kontrolü */
export function isGecerliTckn(value: string): boolean {
  if (!/^[1-9]\d{10}$/.test(value)) return false;
  const d = value.split("").map(Number);
  const tek = d[0] + d[2] + d[4] + d[6] + d[8];
  const cift = d[1] + d[3] + d[5] + d[7];
  const onuncu = (((tek * 7 - cift) % 10) + 10) % 10;
  if (onuncu !== d[9]) return false;
  const onBirinci = d.slice(0, 10).reduce((a, b) => a + b, 0) % 10;
  return onBirinci === d[10];
}

export function isGecerliVkn(value: string): boolean {
  return /^\d{10}$/.test(value);
}

/** 05xx / 5xx / +905xx → +905xxxxxxxxx; geçersizse null */
export function normalizeTrCepTelefonu(raw: string): string | null {
  const digits = raw.replace(/\D/g, "");
  let yerel: string;
  if (digits.length === 12 && digits.startsWith("90")) yerel = digits.slice(2);
  else if (digits.length === 11 && digits.startsWith("0")) yerel = digits.slice(1);
  else if (digits.length === 10) yerel = digits;
  else return null;
  if (!/^5\d{9}$/.test(yerel)) return null;
  return `+90${yerel}`;
}

function isGecerliEposta(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.length <= 254;
}

export function parseFaturaBilgileri(
  formData: FormData
): { ok: true; fatura: FaturaBilgileri } | { ok: false; error: string } {
  const al = (key: string, max = 300) => String(formData.get(key) ?? "").trim().slice(0, max);
  const tipRaw = al("fatura_tipi");
  if (tipRaw !== "bireysel" && tipRaw !== "kurumsal") {
    return { ok: false, error: "Fatura tipini seçin." };
  }
  const tip: FaturaTipi = tipRaw;

  const adUnvan = al("fatura_ad_unvan", 200);
  const kimlikNo = al("fatura_kimlik_no", 11).replace(/\s/g, "");
  const vergiDairesi = al("fatura_vergi_dairesi", 100) || null;
  const adres = al("fatura_adres", 400);
  const il = al("fatura_il", 60);
  const ilce = al("fatura_ilce", 60);
  const eposta = al("fatura_eposta", 254).toLowerCase();
  const telefon = normalizeTrCepTelefonu(al("fatura_telefon", 20));

  if (tip === "bireysel") {
    if (adUnvan.split(/\s+/).filter(Boolean).length < 2) {
      return { ok: false, error: "Ad ve soyadınızı birlikte yazın." };
    }
    if (!isGecerliTckn(kimlikNo)) return { ok: false, error: "Geçerli bir T.C. kimlik numarası girin." };
  } else {
    if (adUnvan.length < 2) return { ok: false, error: "Şirket ünvanını yazın." };
    if (!isGecerliVkn(kimlikNo)) return { ok: false, error: "Vergi numarası 10 haneli olmalıdır." };
    if (!vergiDairesi) return { ok: false, error: "Vergi dairesini yazın." };
  }

  if (adres.length < 10) return { ok: false, error: "Fatura adresini eksiksiz yazın." };
  if (!il || !ilce) return { ok: false, error: "İl ve ilçe zorunludur." };
  if (!isGecerliEposta(eposta)) return { ok: false, error: "Geçerli bir e-posta adresi girin." };
  if (!telefon) return { ok: false, error: "Geçerli bir cep telefonu girin (05xx xxx xx xx)." };

  return {
    ok: true,
    fatura: { tip, adUnvan, kimlikNo, vergiDairesi, adres, il, ilce, eposta, telefon },
  };
}

/** İyzico alıcısı için ad/soyad. Kurumsal faturada ad/soyad yetkili kişi olarak ünvandan türetilir. */
export function adSoyadAyir(adUnvan: string): { ad: string; soyad: string } {
  const parcalar = adUnvan.trim().split(/\s+/).filter(Boolean);
  if (parcalar.length < 2) return { ad: parcalar[0] ?? "-", soyad: parcalar[0] ?? "-" };
  return { ad: parcalar.slice(0, -1).join(" "), soyad: parcalar[parcalar.length - 1] };
}

// ---------- İyzico sonucu doğrulama ----------

export type OdemeKaydiOzeti = {
  id: string;
  conversation_id: string;
  tutar: number;
  para_birimi: string;
};

export type IyzicoSonucOzeti = {
  status: string;
  paymentStatus: string | null;
  paymentId: string | null;
  paidPrice: string | null;
  currency: string | null;
  basketId: string | null;
  conversationId: string | null;
  fraudStatus: number | null;
  errorMessage: string | null;
};

export type DogrulamaSonucu =
  | { karar: "basarili"; paymentId: string }
  | { karar: "basarisiz"; neden: string }
  | { karar: "inceleme"; neden: string };

/** İyzico'dan dönen sonucun bizim kayıtla birebir eşleştiğini doğrular. */
export function dogrulaIyzicoSonucu(kayit: OdemeKaydiOzeti, sonuc: IyzicoSonucOzeti): DogrulamaSonucu {
  if (sonuc.status !== "success") {
    return { karar: "basarisiz", neden: sonuc.errorMessage ?? "Ödeme sonucu alınamadı." };
  }
  if (sonuc.paymentStatus !== "SUCCESS") {
    return { karar: "basarisiz", neden: sonuc.errorMessage ?? "Ödeme tamamlanmadı." };
  }
  // Buradan sonrası: para çekilmiş olabilir. Uyuşmazlıkta paket atanmaz, kayıt admin incelemesine kalır.
  if (!sonuc.paymentId) return { karar: "inceleme", neden: "Ödeme numarası yok." };
  if (sonuc.basketId !== kayit.id) return { karar: "inceleme", neden: "Sepet eşleşmedi." };
  if (sonuc.conversationId !== kayit.conversation_id) {
    return { karar: "inceleme", neden: "İşlem numarası eşleşmedi." };
  }
  if ((sonuc.currency ?? "TRY") !== kayit.para_birimi) {
    return { karar: "inceleme", neden: "Para birimi eşleşmedi." };
  }
  if (sonuc.paidPrice === null || !tutarlarEsit(sonuc.paidPrice, kayit.tutar)) {
    return { karar: "inceleme", neden: "Ödenen tutar eşleşmedi." };
  }
  if (sonuc.fraudStatus !== null && sonuc.fraudStatus !== 1) {
    return { karar: "inceleme", neden: "Ödeme İyzico güvenlik incelemesinde." };
  }
  return { karar: "basarili", paymentId: sonuc.paymentId };
}
