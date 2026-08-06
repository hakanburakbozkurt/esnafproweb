import type { FaqItem } from "@/types/database.types";

export type FaqPageContext =
  | "anasayfa"
  | "iletisim"
  | "hakkimizda"
  | "teknik_servis";

export type FaqPresetCategory =
  | "teknik_servis"
  | "kargo"
  | "aksesuar"
  | "acilis_saatleri"
  | "iletisim"
  | "hakkimizda"
  | "genel";

export type FaqPreset = FaqItem & {
  id: string;
  category: FaqPresetCategory;
  pages: FaqPageContext[];
};

export const FAQ_PRESET_CATEGORY_LABELS: Record<FaqPresetCategory, string> = {
  teknik_servis: "Teknik Servis",
  kargo: "Kargo & Teslimat",
  aksesuar: "Aksesuar & Ürün",
  acilis_saatleri: "Açılış Saatleri",
  iletisim: "İletişim",
  hakkimizda: "Hakkımızda",
  genel: "Genel",
};

export const FAQ_PRESETS: FaqPreset[] = [
  {
    id: "ts-1",
    category: "teknik_servis",
    pages: ["teknik_servis", "anasayfa"],
    soru: "Cihazım ne kadar sürede tamir edilir?",
    cevap:
      "Arıza tespiti sonrası çoğu işlem 1–3 iş günü içinde tamamlanır. Yoğun dönemlerde süre değişebilir; cihazınızı teslim alırken tahmini teslim tarihini paylaşırız.",
  },
  {
    id: "ts-2",
    category: "teknik_servis",
    pages: ["teknik_servis"],
    soru: "Garanti kapsamındaki cihazlara servis veriyor musunuz?",
    cevap:
      "Evet. Garanti belgesi ve fatura ile başvurduğunuz cihazlarda yetkili servis prosedürlerine uygun destek sağlıyoruz.",
  },
  {
    id: "ts-3",
    category: "teknik_servis",
    pages: ["teknik_servis", "iletisim"],
    soru: "Servis takibini nasıl yapabilirim?",
    cevap:
      "Cihaz tesliminde size verilen QR kod veya takip numarası ile servis durumunuzu anlık olarak kontrol edebilirsiniz.",
  },
  {
    id: "kargo-1",
    category: "kargo",
    pages: ["anasayfa", "iletisim"],
    soru: "Kargo ile gönderim yapıyor musunuz?",
    cevap:
      "Evet, anlaşmalı kargo firmaları ile Türkiye geneline güvenli gönderim yapıyoruz. Sipariş sonrası kargo takip bilgisi paylaşılır.",
  },
  {
    id: "kargo-2",
    category: "kargo",
    pages: ["anasayfa", "iletisim"],
    soru: "Teslimat süresi ne kadar?",
    cevap:
      "Stoktaki ürünlerde aynı gün veya ertesi iş günü kargoya verilir. Bölgenize göre teslimat genellikle 1–3 iş günü sürer.",
  },
  {
    id: "aks-1",
    category: "aksesuar",
    pages: ["anasayfa", "hakkimizda"],
    soru: "Orijinal ve yan sanayi ürün farkını nasıl anlarım?",
    cevap:
      "Mağazamızda ürünlerin uyumluluk ve kalite bilgisi etiketlerde belirtilir. Satış öncesi cihazınıza uygun seçenekleri birlikte değerlendiririz.",
  },
  {
    id: "aks-2",
    category: "aksesuar",
    pages: ["anasayfa"],
    soru: "Hangi marka ve modellere uyumlu aksesuar satıyorsunuz?",
    cevap:
      "Güncel telefon, tablet ve aksesuar modellerine uyumlu geniş bir ürün yelpazemiz bulunmaktadır. Modelinizi iletişim kanallarımızdan paylaşabilirsiniz.",
  },
  {
    id: "saat-1",
    category: "acilis_saatleri",
    pages: ["iletisim", "anasayfa"],
    soru: "Çalışma saatleriniz nedir?",
    cevap:
      "Hafta içi 09:00–19:00, cumartesi 10:00–18:00 arası hizmet veriyoruz. Resmi tatil ve pazar günleri kapalıyız.",
  },
  {
    id: "saat-2",
    category: "acilis_saatleri",
    pages: ["iletisim"],
    soru: "Öğle arasında mağaza açık mı?",
    cevap:
      "Evet, öğle arasında da hizmet vermeye devam ediyoruz. Yoğun saatlerde kısa bekleme olabilir.",
  },
  {
    id: "ilet-1",
    category: "iletisim",
    pages: ["iletisim"],
    soru: "Size nasıl ulaşabilirim?",
    cevap:
      "Telefon, WhatsApp ve mağaza ziyareti ile bize ulaşabilirsiniz. İletişim sayfamızdaki tüm kanallar günceldir.",
  },
  {
    id: "ilet-2",
    category: "iletisim",
    pages: ["iletisim", "anasayfa"],
    soru: "Mağazanızın adresi ve konumu nerede?",
    cevap:
      "Adres ve harita bilgilerimizi iletişim sayfasında bulabilirsiniz. Navigasyon için konum pinini kullanabilirsiniz.",
  },
  {
    id: "hk-1",
    category: "hakkimizda",
    pages: ["hakkimizda"],
    soru: "Mağazanız ne kadar süredir hizmet veriyor?",
    cevap:
      "Yılların deneyimiyle bölgedeki müşterilerimize güvenilir satış ve teknik destek sunuyoruz. Detaylı hikayemizi Hakkımızda sayfasında okuyabilirsiniz.",
  },
  {
    id: "hk-2",
    category: "hakkimizda",
    pages: ["hakkimizda", "anasayfa"],
    soru: "Neden sizi tercih etmeliyim?",
    cevap:
      "Şeffaf fiyatlandırma, hızlı servis, orijinal parça seçenekleri ve satış sonrası destek ile müşteri memnuniyetini ön planda tutuyoruz.",
  },
  {
    id: "gen-1",
    category: "genel",
    pages: ["anasayfa", "hakkimizda", "iletisim"],
    soru: "Ödeme seçenekleriniz nelerdir?",
    cevap:
      "Nakit, kredi/banka kartı ve anlaşmalı taksit seçenekleri ile ödeme kabul ediyoruz. Kampanya dönemlerinde ek taksit fırsatları sunulabilir.",
  },
  {
    id: "gen-2",
    category: "genel",
    pages: ["anasayfa", "iletisim"],
    soru: "İade ve değişim politikanız nedir?",
    cevap:
      "Yasal süreler ve ürün koşulları çerçevesinde iade/değişim işlemleri yapılır. Fatura ve ambalajın korunması gerekmektedir.",
  },
];

export function getPresetsForPage(page: FaqPageContext): FaqPreset[] {
  return FAQ_PRESETS.filter((preset) => preset.pages.includes(page));
}

export function getPresetsByCategory(
  page: FaqPageContext
): Record<FaqPresetCategory, FaqPreset[]> {
  const presets = getPresetsForPage(page);
  const grouped = {} as Record<FaqPresetCategory, FaqPreset[]>;

  for (const preset of presets) {
    if (!grouped[preset.category]) {
      grouped[preset.category] = [];
    }
    grouped[preset.category].push(preset);
  }

  return grouped;
}
