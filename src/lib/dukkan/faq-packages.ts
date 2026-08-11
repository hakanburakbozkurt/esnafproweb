import type { FaqPageContext } from "@/lib/dukkan/faq-presets";

export type FaqPackage = {
  id: string;
  name: string;
  description: string;
  pages: FaqPageContext[];
  presetIds: string[];
};

export const FAQ_PACKAGES: FaqPackage[] = [
  {
    id: "paket-teknik-servis",
    name: "Teknik Servis Paketi",
    description:
      "Onarım süreleri, ekran/batarya değişimi, garanti ve servis takibi soruları.",
    pages: ["teknik_servis"],
    presetIds: ["ts-1", "ts-2", "ts-3", "ts-4", "ts-5", "ts-6"],
  },
  {
    id: "paket-guven-garanti",
    name: "Güven & Garanti Paketi",
    description:
      "Orijinal parça, güvenilirlik, deneyim ve müşteri memnuniyeti odaklı sorular.",
    pages: ["hakkimizda"],
    presetIds: ["hk-1", "hk-2", "hk-3", "hk-4", "aks-1"],
  },
  {
    id: "paket-konum-iletisim",
    name: "Konum & İletişim Paketi",
    description:
      "Adres, ulaşım, çalışma saatleri ve iletişim kanallarına dair sorular.",
    pages: ["iletisim"],
    presetIds: ["ilet-1", "ilet-2", "ilet-3", "saat-1", "saat-2"],
  },
  {
    id: "paket-anasayfa-genel",
    name: "Ana Sayfa Genel Paketi",
    description:
      "Ödeme, iade, kargo ve genel mağaza bilgilerini kapsayan sorular.",
    pages: ["anasayfa"],
    presetIds: ["gen-1", "gen-2", "kargo-1", "kargo-2", "aks-2", "hk-2"],
  },
];

export function getPackagesForPage(page: FaqPageContext): FaqPackage[] {
  return FAQ_PACKAGES.filter((pkg) => pkg.pages.includes(page));
}
