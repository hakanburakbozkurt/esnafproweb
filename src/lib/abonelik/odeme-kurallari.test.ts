import { describe, expect, it } from "vitest";
import {
  adSoyadAyir,
  dogrulaIyzicoSonucu,
  getOdemeAkisiModu,
  hesaplaAbonelikTutari,
  isGecerliTckn,
  normalizeTrCepTelefonu,
  odemeKullanilabilir,
  parseFaturaBilgileri,
  satinAlmaEngeli,
  type IyzicoSonucOzeti,
} from "@/lib/abonelik/odeme-kurallari";

const plan = { price_monthly: 249, price_quarterly: 699, price_yearly: 2490 };

describe("hesaplaAbonelikTutari", () => {
  it("1, 3 ve 12 ay fiyatlarını plandan alır", () => {
    expect(hesaplaAbonelikTutari(plan, 1)).toBe(249);
    expect(hesaplaAbonelikTutari(plan, 3)).toBe(699);
    expect(hesaplaAbonelikTutari(plan, 12)).toBe(2490);
  });

  it("3 aylık boşsa aylık x 3, yıllık 0 ise aylık x 12", () => {
    expect(hesaplaAbonelikTutari({ ...plan, price_quarterly: null }, 3)).toBe(747);
    expect(hesaplaAbonelikTutari({ ...plan, price_yearly: 0 }, 12)).toBe(2988);
  });
});

describe("satinAlmaEngeli", () => {
  it("aktif Pro varken Büyüme alınamaz, Pro uzatılabilir", () => {
    expect(satinAlmaEngeli({ tier: "pro", ucretliAktif: true }, "buyume")).not.toBeNull();
    expect(satinAlmaEngeli({ tier: "pro", ucretliAktif: true }, "pro")).toBeNull();
  });

  it("Büyüme'den Pro'ya yükseltme ve süresi dolmuş Pro'dan Büyüme serbest", () => {
    expect(satinAlmaEngeli({ tier: "buyume", ucretliAktif: true }, "pro")).toBeNull();
    expect(satinAlmaEngeli({ tier: "pro", ucretliAktif: false }, "buyume")).toBeNull();
  });

  it("Ultra aktifken satın alma engellenir", () => {
    expect(satinAlmaEngeli({ tier: "ultra", ucretliAktif: true }, "pro")).not.toBeNull();
  });
});

describe("ödeme akışı bayrağı", () => {
  it("varsayılan kapalı; admin modu yalnızca süper admin", () => {
    expect(getOdemeAkisiModu({})).toBe("kapali");
    expect(getOdemeAkisiModu({ ABONELIK_ODEME_AKTIF: "on" })).toBe("acik");
    expect(getOdemeAkisiModu({ ABONELIK_ODEME_AKTIF: "admin" })).toBe("admin");
    expect(odemeKullanilabilir("admin", false)).toBe(false);
    expect(odemeKullanilabilir("admin", true)).toBe(true);
    expect(odemeKullanilabilir("kapali", true)).toBe(false);
  });
});

describe("kimlik ve telefon", () => {
  it("TCKN algoritması", () => {
    expect(isGecerliTckn("10000000146")).toBe(true);
    expect(isGecerliTckn("10000000147")).toBe(false);
    expect(isGecerliTckn("01234567890")).toBe(false);
    expect(isGecerliTckn("123")).toBe(false);
  });

  it("cep telefonu normalize", () => {
    expect(normalizeTrCepTelefonu("0532 123 45 67")).toBe("+905321234567");
    expect(normalizeTrCepTelefonu("+90 532 123 45 67")).toBe("+905321234567");
    expect(normalizeTrCepTelefonu("5321234567")).toBe("+905321234567");
    expect(normalizeTrCepTelefonu("0212 123 45 67")).toBeNull();
  });

  it("ad soyad ayırma", () => {
    expect(adSoyadAyir("Ahmet Can Yılmaz")).toEqual({ ad: "Ahmet Can", soyad: "Yılmaz" });
    expect(adSoyadAyir("Tek")).toEqual({ ad: "Tek", soyad: "Tek" });
  });
});

function formOlustur(alanlar: Record<string, string>) {
  const fd = new FormData();
  for (const [k, v] of Object.entries(alanlar)) fd.set(k, v);
  return fd;
}

const gecerliBireysel = {
  fatura_tipi: "bireysel",
  fatura_ad_unvan: "Ahmet Yılmaz",
  fatura_kimlik_no: "10000000146",
  fatura_adres: "Esenkent Mah. Örnek Sok. No: 1",
  fatura_il: "İstanbul",
  fatura_ilce: "Esenyurt",
  fatura_eposta: "Ahmet@Ornek.com",
  fatura_telefon: "0532 123 45 67",
};

describe("parseFaturaBilgileri", () => {
  it("geçerli bireysel faturayı ayrıştırır", () => {
    const r = parseFaturaBilgileri(formOlustur(gecerliBireysel));
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.fatura.eposta).toBe("ahmet@ornek.com");
      expect(r.fatura.telefon).toBe("+905321234567");
    }
  });

  it("kurumsalda vergi dairesi ve 10 haneli VKN ister", () => {
    const kurumsal = {
      ...gecerliBireysel,
      fatura_tipi: "kurumsal",
      fatura_ad_unvan: "Örnek Ltd. Şti.",
      fatura_kimlik_no: "1234567890",
    };
    expect(parseFaturaBilgileri(formOlustur(kurumsal)).ok).toBe(false);
    expect(
      parseFaturaBilgileri(formOlustur({ ...kurumsal, fatura_vergi_dairesi: "Esenyurt" })).ok
    ).toBe(true);
  });

  it("geçersiz TCKN reddedilir", () => {
    const r = parseFaturaBilgileri(formOlustur({ ...gecerliBireysel, fatura_kimlik_no: "12345678901" }));
    expect(r.ok).toBe(false);
  });
});

describe("dogrulaIyzicoSonucu", () => {
  const kayit = { id: "odeme-1", conversation_id: "conv-1", tutar: 699, para_birimi: "TRY" };
  const basarili: IyzicoSonucOzeti = {
    status: "success",
    paymentStatus: "SUCCESS",
    paymentId: "pay-1",
    paidPrice: "699.0",
    currency: "TRY",
    basketId: "odeme-1",
    conversationId: "conv-1",
    fraudStatus: 1,
    errorMessage: null,
  };

  it("her şey eşleşirse başarılı", () => {
    expect(dogrulaIyzicoSonucu(kayit, basarili)).toEqual({ karar: "basarili", paymentId: "pay-1" });
  });

  it("ödeme başarısızsa başarısız", () => {
    expect(dogrulaIyzicoSonucu(kayit, { ...basarili, paymentStatus: "FAILURE" }).karar).toBe("basarisiz");
    expect(dogrulaIyzicoSonucu(kayit, { ...basarili, status: "failure" }).karar).toBe("basarisiz");
  });

  it("para çekildi ama tutar/sepet uyuşmuyorsa paket atanmaz, incelemeye düşer", () => {
    expect(dogrulaIyzicoSonucu(kayit, { ...basarili, paidPrice: "1.0" }).karar).toBe("inceleme");
    expect(dogrulaIyzicoSonucu(kayit, { ...basarili, basketId: "baska" }).karar).toBe("inceleme");
    expect(dogrulaIyzicoSonucu(kayit, { ...basarili, conversationId: "x" }).karar).toBe("inceleme");
  });

  it("fraud incelemesindeki ödeme atanmaz", () => {
    expect(dogrulaIyzicoSonucu(kayit, { ...basarili, fraudStatus: 0 }).karar).toBe("inceleme");
  });
});
