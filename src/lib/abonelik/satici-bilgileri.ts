/** Mesafeli satış ve ön bilgilendirme metinlerinde gösterilen satıcı bilgileri (Vercel ortam değişkenleri). */
export type SaticiBilgileri = {
  unvan: string;
  adres: string;
  vergiDairesi: string;
  vergiNo: string;
  eposta: string;
  telefon: string;
};

const ALANLAR: Record<keyof SaticiBilgileri, string> = {
  unvan: "SATICI_UNVAN",
  adres: "SATICI_ADRES",
  vergiDairesi: "SATICI_VERGI_DAIRESI",
  vergiNo: "SATICI_VERGI_NO",
  eposta: "SATICI_EPOSTA",
  telefon: "SATICI_TELEFON",
};

export function getSaticiBilgileri(env: Record<string, string | undefined> = process.env): {
  bilgiler: SaticiBilgileri;
  eksikAlanlar: string[];
} {
  const eksikAlanlar: string[] = [];
  const bilgiler = {} as SaticiBilgileri;
  for (const [alan, envAdi] of Object.entries(ALANLAR) as [keyof SaticiBilgileri, string][]) {
    const deger = env[envAdi]?.trim() ?? "";
    if (!deger) eksikAlanlar.push(envAdi);
    bilgiler[alan] = deger || "[tanımlanmadı]";
  }
  return { bilgiler, eksikAlanlar };
}
