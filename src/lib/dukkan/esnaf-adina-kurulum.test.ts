import { describe, expect, it } from "vitest";
import {
  buildDavetMesaji,
  buildVarsayilanAciklama,
  buildVarsayilanMetaDescription,
  buildVarsayilanMetaTitle,
  buildWhatsAppPaylasimUrl,
  isGuvenliGorselUrl,
  normalizeTelefon,
  parseEsnafKurulumFormData,
} from "./esnaf-adina-kurulum";

const SUPABASE = "https://abc.supabase.co";
const GORSEL = `${SUPABASE}/storage/v1/object/public/dukkan-gorselleri/store-assets/xmobile/logo/1.webp`;

function form(alanlar: Record<string, string | string[]>): FormData {
  const fd = new FormData();
  for (const [k, v] of Object.entries(alanlar)) {
    for (const deger of Array.isArray(v) ? v : [v]) fd.append(k, deger);
  }
  return fd;
}

describe("parseEsnafKurulumFormData", () => {
  it("geçerli bilgileri ayrıştırır, slug'ı addan üretir ve WhatsApp'ı telefondan alır", () => {
    const sonuc = parseEsnafKurulumFormData(
      form({
        dukkan_adi: "X Mobile Bağlar",
        email: "Esnaf@Gmail.com",
        telefon: "0555 123 45 67",
        semt: "Bağlar",
        sehir: "Diyarbakır",
        logo_url: GORSEL,
        dukkan_fotograflari: [GORSEL, "https://kotu.site/a.jpg"],
      }),
      SUPABASE
    );
    expect("data" in sonuc).toBe(true);
    if (!("data" in sonuc)) return;
    expect(sonuc.data.slug).toBe("x-mobile-baglar");
    expect(sonuc.data.email).toBe("esnaf@gmail.com");
    expect(sonuc.data.telefon).toBe("0555 123 45 67");
    expect(sonuc.data.whatsapp).toBe("905551234567");
    expect(sonuc.data.logo_url).toBe(GORSEL);
    expect(sonuc.data.dukkan_fotograflari).toEqual([GORSEL]);
  });

  it("e-posta yoksa hata verir", () => {
    expect(parseEsnafKurulumFormData(form({ dukkan_adi: "X Mobile" }), SUPABASE)).toHaveProperty("error");
  });

  it("geçersiz telefonu reddeder", () => {
    expect(
      parseEsnafKurulumFormData(
        form({ dukkan_adi: "X Mobile", email: "a@b.co", telefon: "123" }),
        SUPABASE
      )
    ).toHaveProperty("error");
  });
});

describe("isGuvenliGorselUrl", () => {
  it("yalnızca kendi depomuzdaki herkese açık görselleri kabul eder", () => {
    expect(isGuvenliGorselUrl(GORSEL, SUPABASE)).toBe(true);
    expect(isGuvenliGorselUrl("https://evil.com/storage/v1/object/public/x.jpg", SUPABASE)).toBe(false);
    expect(isGuvenliGorselUrl(`${SUPABASE}/rest/v1/dukkanlar`, SUPABASE)).toBe(false);
  });
});

describe("varsayılan metinler", () => {
  const girdi = {
    dukkan_adi: "X Mobile",
    semt: "Bağlar",
    sehir: "Diyarbakır",
    teknik_servis_aktif: true,
  };

  it("açıklamaya ad, konum ve servis bilgisi girer", () => {
    const metin = buildVarsayilanAciklama(girdi);
    expect(metin).toContain("X Mobile");
    expect(metin).toContain("Bağlar, Diyarbakır");
    expect(metin).toContain("teknik servis");
  });

  it("meta başlık 60, açıklama 160 karakteri aşmaz", () => {
    expect(buildVarsayilanMetaTitle(girdi)).toBe("X Mobile | Bağlar Telefoncu");
    expect(buildVarsayilanMetaTitle({ ...girdi, dukkan_adi: "A".repeat(70) }).length).toBeLessThanOrEqual(60);
    expect(buildVarsayilanMetaDescription(girdi).length).toBeLessThanOrEqual(160);
  });
});

describe("davet", () => {
  it("telefonu Türkiye biçimine getirir", () => {
    expect(normalizeTelefon("+90 555 123 4567")).toBe("0555 123 45 67");
    expect(normalizeTelefon("12")).toBeNull();
  });

  it("mesajda iki bağlantı da bulunur ve WhatsApp adresi kodlanır", () => {
    const mesaj = buildDavetMesaji({
      dukkanAdi: "X Mobile",
      vitrinUrl: "https://www.esnafpro.app/xmobile",
      davetUrl: "https://www.esnafpro.app/auth/davet?token_hash=t&type=invite",
    });
    expect(mesaj).toContain("/xmobile");
    expect(mesaj).toContain("/auth/davet?");
    expect(buildWhatsAppPaylasimUrl("905551234567", mesaj)).toMatch(/^https:\/\/wa\.me\/905551234567\?text=/);
    expect(buildWhatsAppPaylasimUrl(null, "a b")).toBe("https://wa.me/?text=a%20b");
  });
});
