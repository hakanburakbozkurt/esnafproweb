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
      "{dukkan_adi} olarak arıza tespiti sonrası çoğu işlemi 1–3 iş günü içinde tamamlıyoruz. Yoğun dönemlerde süre değişebilir; cihazınızı teslim alırken tahmini teslim tarihini paylaşırız.",
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
    id: "ts-4",
    category: "teknik_servis",
    pages: ["teknik_servis"],
    soru: "Ekran değişimi ne kadar sürer?",
    cevap:
      "{ilce} bölgesinde ekran değişim işlemlerini genellikle aynı gün veya en geç ertesi iş günü tamamlıyoruz. Stok durumuna göre süre değişebilir; öncesinde net bilgi verilir.",
  },
  {
    id: "ts-5",
    category: "teknik_servis",
    pages: ["teknik_servis"],
    soru: "Batarya değişimi yapıyor musunuz?",
    cevap:
      "Evet. Orijinal ve uyumlu batarya seçenekleriyle değişim yapıyoruz. Değişim sonrası kısa test sürecinin ardından cihazınızı teslim ediyoruz.",
  },
  {
    id: "ts-6",
    category: "teknik_servis",
    pages: ["teknik_servis"],
    soru: "Servis sonrası garanti veriyor musunuz?",
    cevap:
      "{dukkan_adi} olarak yapılan işlemler için parça ve işçilik garantisi sunuyoruz. Garanti süresi işlem türüne göre değişir; teslim sırasında yazılı olarak paylaşılır.",
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
      "Stoktaki ürünlerde aynı gün veya ertesi iş günü kargoya verilir. {il} ve çevresine teslimat genellikle 1–3 iş günü sürer.",
  },
  {
    id: "aks-1",
    category: "aksesuar",
    pages: ["anasayfa", "hakkimizda"],
    soru: "Orijinal ve yan sanayi ürün farkını nasıl anlarım?",
    cevap:
      "{dukkan_adi} mağazasında ürünlerin uyumluluk ve kalite bilgisi etiketlerde belirtilir. Satış öncesi cihazınıza uygun seçenekleri birlikte değerlendiririz.",
  },
  {
    id: "aks-2",
    category: "aksesuar",
    pages: ["anasayfa"],
    soru: "Hangi marka ve modellere uyumlu aksesuar satıyorsunuz?",
    cevap:
      "Güncel telefon, tablet ve aksesuar modellerine uyumlu geniş bir ürün yelpazemiz bulunmaktadır. Modelinizi {whatsapp} üzerinden paylaşabilirsiniz.",
  },
  {
    id: "saat-1",
    category: "acilis_saatleri",
    pages: ["iletisim", "anasayfa"],
    soru: "Çalışma saatleriniz nedir?",
    cevap: "Çalışma saatlerimiz: {calisma_saatleri}",
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
      "{telefon} numarasından, {whatsapp} WhatsApp hattından veya mağaza ziyareti ile bize ulaşabilirsiniz.",
  },
  {
    id: "ilet-2",
    category: "iletisim",
    pages: ["iletisim", "anasayfa"],
    soru: "Mağazanızın adresi ve konumu nerede?",
    cevap:
      "{dukkan_adi} adresimiz: {adres}. {bolge} konumundaki mağazamıza iletişim sayfasındaki harita üzerinden kolayca ulaşabilirsiniz.",
  },
  {
    id: "ilet-3",
    category: "iletisim",
    pages: ["iletisim"],
    soru: "{ilce} bölgesinden nasıl ulaşabilirim?",
    cevap:
      "{adres} adresinde hizmet veriyoruz. Toplu taşıma, araç veya yürüyüş rotası için iletişim sayfasındaki harita pinini kullanabilirsiniz.",
  },
  {
    id: "hk-1",
    category: "hakkimizda",
    pages: ["hakkimizda"],
    soru: "Mağazanız ne kadar süredir hizmet veriyor?",
    cevap:
      "{dukkan_adi}, {bolge} bölgesinde yılların deneyimiyle güvenilir satış ve teknik destek sunuyor. Detaylı hikayemizi Hakkımızda sayfasında okuyabilirsiniz.",
  },
  {
    id: "hk-2",
    category: "hakkimizda",
    pages: ["hakkimizda", "anasayfa"],
    soru: "Neden sizi tercih etmeliyim?",
    cevap:
      "Şeffaf fiyatlandırma, hızlı servis, orijinal parça seçenekleri ve satış sonrası destek ile {ilce} bölgesindeki müşteri memnuniyetini ön planda tutuyoruz.",
  },
  {
    id: "hk-3",
    category: "hakkimizda",
    pages: ["hakkimizda"],
    soru: "Orijinal parça kullanıyor musunuz?",
    cevap:
      "Evet. Mümkün olduğunca orijinal veya üretici onaylı yedek parça kullanıyoruz. Alternatif seçenekler varsa fiyat ve kalite farkını satış öncesi açıkça paylaşıyoruz.",
  },
  {
    id: "hk-4",
    category: "hakkimizda",
    pages: ["hakkimizda"],
    soru: "Satış sonrası destek sunuyor musunuz?",
    cevap:
      "{dukkan_adi} olarak satış ve servis sonrası da yanınızdayız. Sorularınız için {telefon} veya mağaza ziyareti ile destek alabilirsiniz.",
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

export function getPresetsByIds(ids: string[]): FaqPreset[] {
  const lookup = new Map(FAQ_PRESETS.map((preset) => [preset.id, preset]));
  return ids
    .map((id) => lookup.get(id))
    .filter((preset): preset is FaqPreset => Boolean(preset));
}
