import type {
  FaqPageContext,
  FaqPresetCategory,
} from "@/lib/dukkan/faq-presets";

export type FaqPackage = {
  id: string;
  name: string;
  description: string;
  pages: FaqPageContext[];
  categories: FaqPresetCategory[];
  sampleSize?: number;
};

export const FAQ_PACKAGES: FaqPackage[] = [
  {
    id: "paket-teknik-servis",
    name: "Teknik Servis Paketi",
    description:
      "Onarım süreleri, ekran/batarya değişimi, garanti ve servis takibi soruları.",
    pages: ["teknik_servis"],
    categories: ["teknik_servis"],
    sampleSize: 5,
  },
  {
    id: "paket-guven-garanti",
    name: "Güven & Garanti Paketi",
    description:
      "Orijinal parça, güvenilirlik, deneyim ve müşteri memnuniyeti odaklı sorular.",
    pages: ["hakkimizda"],
    categories: ["genel", "aksesuar"],
    sampleSize: 5,
  },
  {
    id: "paket-konum-iletisim",
    name: "Konum & İletişim Paketi",
    description:
      "Adres, ulaşım, çalışma saatleri ve iletişim kanallarına dair sorular.",
    pages: ["iletisim"],
    categories: ["lokasyon_iletisim"],
    sampleSize: 5,
  },
  {
    id: "paket-anasayfa-genel",
    name: "Ana Sayfa Genel Paketi",
    description:
      "Ödeme, iade, kargo ve genel mağaza bilgilerini kapsayan sorular.",
    pages: ["anasayfa"],
    categories: ["genel", "aksesuar", "ikinci_el_takas"],
    sampleSize: 5,
  },
  {
    id: "paket-ikinci-el",
    name: "İkinci El & Takas Paketi",
    description:
      "Alım-satım, takas, kondisyon ve garanti odaklı pazaryeri soruları.",
    pages: ["anasayfa", "hakkimizda"],
    categories: ["ikinci_el_takas"],
    sampleSize: 5,
  },
];

export function getPackagesForPage(page: FaqPageContext): FaqPackage[] {
  return FAQ_PACKAGES.filter((pkg) => pkg.pages.includes(page));
}
