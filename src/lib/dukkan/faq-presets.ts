import {
  FAQ_POOL_SAMPLE_SIZE,
  createRandomSource,
  sampleFromPool,
} from "@/lib/dukkan/faq-pool-sampling";
import type { FaqItem } from "@/types/database.types";

export type FaqPageContext =
  | "anasayfa"
  | "iletisim"
  | "hakkimizda"
  | "teknik_servis";

export type FaqPresetCategory =
  | "teknik_servis"
  | "ikinci_el_takas"
  | "aksesuar"
  | "lokasyon_iletisim"
  | "genel";

export type FaqPreset = FaqItem & {
  id: string;
  category: FaqPresetCategory;
  pages: FaqPageContext[];
};

export const FAQ_PRESET_CATEGORY_LABELS: Record<FaqPresetCategory, string> = {
  teknik_servis: "Teknik Servis",
  ikinci_el_takas: "İkinci El & Takas",
  aksesuar: "Aksesuar",
  lokasyon_iletisim: "Lokasyon & İletişim",
  genel: "Genel",
};

export const FAQ_PAGE_CATEGORIES: Record<FaqPageContext, FaqPresetCategory[]> = {
  anasayfa: [
    "teknik_servis",
    "ikinci_el_takas",
    "aksesuar",
    "lokasyon_iletisim",
    "genel",
  ],
  hakkimizda: ["aksesuar", "genel", "ikinci_el_takas"],
  iletisim: ["lokasyon_iletisim", "genel"],
  teknik_servis: ["teknik_servis", "genel"],
};

export const FAQ_PRESETS: FaqPreset[] = [
  {
    id: "ts-1",
    category: "teknik_servis",
    pages: ["teknik_servis", "anasayfa"],
    soru: "Cihazım ne kadar sürede tamir edilir?",
    cevap:
      "{dukkan_adi} olarak arıza tespiti sonrası çoğu işlemi 1–3 iş günü içinde tamamlıyoruz. Yoğun dönemlerde süre değişebilir; teslim sırasında tahmini tarih paylaşılır.",
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
      "Cihaz tesliminde verilen QR kod veya takip numarası ile servis durumunuzu anlık olarak kontrol edebilirsiniz.",
  },
  {
    id: "ts-4",
    category: "teknik_servis",
    pages: ["teknik_servis"],
    soru: "Ekran değişimi ne kadar sürer?",
    cevap:
      "{ilce} bölgesinde ekran değişimlerini genellikle aynı gün veya en geç ertesi iş günü tamamlıyoruz. Stok durumuna göre süre değişebilir.",
  },
  {
    id: "ts-5",
    category: "teknik_servis",
    pages: ["teknik_servis"],
    soru: "Batarya değişimi yapıyor musunuz?",
    cevap:
      "Evet. Orijinal ve uyumlu batarya seçenekleriyle değişim yapıyoruz. Test sonrası cihazınızı teslim ediyoruz.",
  },
  {
    id: "ts-6",
    category: "teknik_servis",
    pages: ["teknik_servis"],
    soru: "Servis sonrası garanti veriyor musunuz?",
    cevap:
      "{dukkan_adi} olarak yapılan işlemler için parça ve işçilik garantisi sunuyoruz. Süre işlem türüne göre değişir.",
  },
  {
    id: "ts-7",
    category: "teknik_servis",
    pages: ["teknik_servis", "anasayfa"],
    soru: "Su teması veya düşme sonrası cihaz kurtarılabilir mi?",
    cevap:
      "Erken müdahale ile birçok cihaz kurtarılabilir. {ilce} mağazamıza en kısa sürede getirmeniz onarım şansını artırır.",
  },
  {
    id: "ts-8",
    category: "teknik_servis",
    pages: ["teknik_servis"],
    soru: "Yazılım ve veri yedekleme konusunda destek veriyor musunuz?",
    cevap:
      "Mümkün olduğunca veri korunarak yazılım işlemleri yapılır. Kritik veriler için işlem öncesi yedekleme önerilir.",
  },
  {
    id: "ie-1",
    category: "ikinci_el_takas",
    pages: ["anasayfa", "hakkimizda"],
    soru: "İkinci el telefon alım satım yapıyor musunuz?",
    cevap:
      "Evet. {dukkan_adi} olarak {bolge} bölgesinde ikinci el cihaz alım ve satış hizmeti sunuyoruz. Cihazınızı ücretsiz ön değerlendirmeye getirebilirsiniz.",
  },
  {
    id: "ie-2",
    category: "ikinci_el_takas",
    pages: ["anasayfa", "hakkimizda"],
    soru: "Eski cihazımı takas edebilir miyim?",
    cevap:
      "Evet. Mevcut cihazınızın durumuna göre takas fiyatı belirlenir; fark tutarı yeni cihazınıza uygulanır.",
  },
  {
    id: "ie-3",
    category: "ikinci_el_takas",
    pages: ["anasayfa", "hakkimizda"],
    soru: "İkinci el cihazlarda garanti veriyor musunuz?",
    cevap:
      "Satılan ikinci el cihazlarda kontrol sürecinden geçmiş ürünler için sınırlı garanti sunuyoruz. Detaylar satış sırasında paylaşılır.",
  },
  {
    id: "ie-4",
    category: "ikinci_el_takas",
    pages: ["anasayfa"],
    soru: "Takas değerlendirmesi nasıl yapılır?",
    cevap:
      "Cihazın model, kozmetik durum, ekran ve batarya sağlığı incelenerek net teklif verilir. {telefon} üzerinden ön bilgi alabilirsiniz.",
  },
  {
    id: "ie-5",
    category: "ikinci_el_takas",
    pages: ["anasayfa", "hakkimizda"],
    soru: "İkinci el cihazların kondisyonu nasıl belirtilir?",
    cevap:
      "Her cihaz A/B/C kondisyon skalası ve detaylı açıklama ile listelenir. Fotoğraflar ve teknik kontrol sonuçları vitrinde paylaşılır.",
  },
  {
    id: "ie-6",
    category: "ikinci_el_takas",
    pages: ["anasayfa"],
    soru: "Web vitrininizdeki ikinci el ilanlar güncel mi?",
    cevap:
      "Evet. Satılan cihazlar vitrinden kaldırılır; stok durumu düzenli olarak güncellenir.",
  },
  {
    id: "ie-7",
    category: "ikinci_el_takas",
    pages: ["anasayfa", "hakkimizda"],
    soru: "IMEI kontrolü yapıyor musunuz?",
    cevap:
      "Alım ve satış öncesinde IMEI/kayıt durumu kontrol edilir. Güvenli alışveriş için şeffaf süreç uygulanır.",
  },
  {
    id: "aks-1",
    category: "aksesuar",
    pages: ["anasayfa", "hakkimizda"],
    soru: "Orijinal ve yan sanayi ürün farkını nasıl anlarım?",
    cevap:
      "{dukkan_adi} mağazasında uyumluluk ve kalite bilgisi etiketlerde belirtilir. Satış öncesi seçenekleri birlikte değerlendiririz.",
  },
  {
    id: "aks-2",
    category: "aksesuar",
    pages: ["anasayfa"],
    soru: "Hangi marka ve modellere uyumlu aksesuar satıyorsunuz?",
    cevap:
      "Güncel telefon, tablet ve aksesuar modellerine uyumlu geniş bir yelpazemiz var. Modelinizi {whatsapp} üzerinden paylaşabilirsiniz.",
  },
  {
    id: "aks-3",
    category: "aksesuar",
    pages: ["anasayfa", "hakkimizda"],
    soru: "Kılıf ve cam koruyucu uygulaması yapıyor musunuz?",
    cevap:
      "Evet. Satın aldığınız koruyucuları {ilce} mağazamızda ücretsiz veya uygun fiyatla uygulayabiliriz.",
  },
  {
    id: "aks-4",
    category: "aksesuar",
    pages: ["anasayfa"],
    soru: "Şarj cihazı ve kablo çeşitleriniz var mı?",
    cevap:
      "Hızlı şarj adaptörleri, kablolar ve powerbank modelleri stoklarımızda mevcuttur. Cihazınıza uygun seçenek önerilir.",
  },
  {
    id: "aks-5",
    category: "aksesuar",
    pages: ["anasayfa", "hakkimizda"],
    soru: "Kulaklık ve ses aksesuarları satıyor musunuz?",
    cevap:
      "Kablolu ve kablosuz kulaklık modelleri ile ses aksesuarları sunuyoruz. Deneme imkânı mağazamızda mevcuttur.",
  },
  {
    id: "aks-6",
    category: "aksesuar",
    pages: ["anasayfa"],
    soru: "Aksesuar uyumluluğunu nasıl kontrol ediyorsunuz?",
    cevap:
      "Model numarası ve cihaz özelliklerine göre uyumluluk kontrol edilir. Yanlış ürün alımını önlemek için satış öncesi teyit alınır.",
  },
  {
    id: "loc-1",
    category: "lokasyon_iletisim",
    pages: ["iletisim", "anasayfa"],
    soru: "Mağazanızın adresi ve konumu nerede?",
    cevap:
      "{dukkan_adi} adresimiz: {adres}. {bolge} konumundaki mağazamıza iletişim sayfasındaki harita üzerinden ulaşabilirsiniz.",
  },
  {
    id: "loc-2",
    category: "lokasyon_iletisim",
    pages: ["iletisim"],
    soru: "Size nasıl ulaşabilirim?",
    cevap:
      "{telefon} numarasından, {whatsapp} WhatsApp hattından veya mağaza ziyareti ile bize ulaşabilirsiniz.",
  },
  {
    id: "loc-3",
    category: "lokasyon_iletisim",
    pages: ["iletisim"],
    soru: "{ilce} bölgesinden nasıl ulaşabilirim?",
    cevap:
      "{adres} adresinde hizmet veriyoruz. Toplu taşıma veya navigasyon için iletişim sayfasındaki harita pinini kullanabilirsiniz.",
  },
  {
    id: "loc-4",
    category: "lokasyon_iletisim",
    pages: ["iletisim", "anasayfa"],
    soru: "Çalışma saatleriniz nedir?",
    cevap: "Çalışma saatlerimiz: {calisma_saatleri}",
  },
  {
    id: "loc-5",
    category: "lokasyon_iletisim",
    pages: ["iletisim"],
    soru: "Öğle arasında mağaza açık mı?",
    cevap:
      "Evet, öğle arasında da hizmet vermeye devam ediyoruz. Yoğun saatlerde kısa bekleme olabilir.",
  },
  {
    id: "loc-6",
    category: "lokasyon_iletisim",
    pages: ["anasayfa", "iletisim"],
    soru: "Kargo ile gönderim yapıyor musunuz?",
    cevap:
      "Evet, anlaşmalı kargo firmaları ile Türkiye geneline güvenli gönderim yapıyoruz. Takip bilgisi paylaşılır.",
  },
  {
    id: "loc-7",
    category: "lokasyon_iletisim",
    pages: ["anasayfa", "iletisim"],
    soru: "Teslimat süresi ne kadar?",
    cevap:
      "Stoktaki ürünlerde aynı gün veya ertesi iş günü kargoya verilir. {il} ve çevresine teslimat genellikle 1–3 iş günü sürer.",
  },
  {
    id: "loc-8",
    category: "lokasyon_iletisim",
    pages: ["iletisim"],
    soru: "Mağazada otopark imkânı var mı?",
    cevap:
      "{ilce} mağazamız çevresinde kısa süreli park alanları mevcuttur. Detaylı yönlendirme için bizi arayabilirsiniz.",
  },
  {
    id: "gen-1",
    category: "genel",
    pages: ["anasayfa", "hakkimizda", "iletisim"],
    soru: "Ödeme seçenekleriniz nelerdir?",
    cevap:
      "Nakit, kredi/banka kartı ve anlaşmalı taksit seçenekleri ile ödeme kabul ediyoruz.",
  },
  {
    id: "gen-2",
    category: "genel",
    pages: ["anasayfa", "iletisim"],
    soru: "İade ve değişim politikanız nedir?",
    cevap:
      "Yasal süreler ve ürün koşulları çerçevesinde iade/değişim yapılır. Fatura ve ambalajın korunması gerekir.",
  },
  {
    id: "gen-3",
    category: "genel",
    pages: ["hakkimizda"],
    soru: "Mağazanız ne kadar süredir hizmet veriyor?",
    cevap:
      "{dukkan_adi}, {bolge} bölgesinde yılların deneyimiyle güvenilir satış ve teknik destek sunuyor.",
  },
  {
    id: "gen-4",
    category: "genel",
    pages: ["hakkimizda", "anasayfa"],
    soru: "Neden sizi tercih etmeliyim?",
    cevap:
      "Şeffaf fiyatlandırma, hızlı servis, orijinal parça seçenekleri ve satış sonrası destek ile {ilce} bölgesinde müşteri memnuniyetini ön planda tutuyoruz.",
  },
  {
    id: "gen-5",
    category: "genel",
    pages: ["hakkimizda"],
    soru: "Orijinal parça kullanıyor musunuz?",
    cevap:
      "Mümkün olduğunca orijinal veya üretici onaylı yedek parça kullanıyoruz. Alternatif seçenekler satış öncesi açıklanır.",
  },
  {
    id: "gen-6",
    category: "genel",
    pages: ["hakkimizda", "teknik_servis"],
    soru: "Satış sonrası destek sunuyor musunuz?",
    cevap:
      "{dukkan_adi} olarak satış ve servis sonrası da yanınızdayız. {telefon} üzerinden destek alabilirsiniz.",
  },
  {
    id: "gen-7",
    category: "genel",
    pages: ["anasayfa", "iletisim"],
    soru: "Kampanya ve fırsatları nereden takip edebilirim?",
    cevap:
      "Güncel kampanyalar vitrin sayfamızda ve sosyal medya kanallarımızda duyurulur.",
  },
  {
    id: "gen-8",
    category: "genel",
    pages: ["anasayfa", "hakkimizda"],
    soru: "Fiyat teklifi almak için ne yapmalıyım?",
    cevap:
      "Mağazamızı ziyaret edebilir, {telefon} arayabilir veya {whatsapp} üzerinden model bilgisi paylaşarak teklif alabilirsiniz.",
  },
];

export function getPresetsForPage(page: FaqPageContext): FaqPreset[] {
  return FAQ_PRESETS.filter((preset) => preset.pages.includes(page));
}

export function getPresetsForPageAndCategory(
  page: FaqPageContext,
  category: FaqPresetCategory
): FaqPreset[] {
  return FAQ_PRESETS.filter(
    (preset) => preset.category === category && preset.pages.includes(page)
  );
}

export function getPresetsByCategory(
  page: FaqPageContext
): Partial<Record<FaqPresetCategory, FaqPreset[]>> {
  const grouped: Partial<Record<FaqPresetCategory, FaqPreset[]>> = {};

  for (const category of FAQ_PAGE_CATEGORIES[page]) {
    const presets = getPresetsForPageAndCategory(page, category);
    if (presets.length) {
      grouped[category] = presets;
    }
  }

  return grouped;
}

export function samplePresetsByCategory(
  page: FaqPageContext,
  sampleKey: string,
  sampleSize = FAQ_POOL_SAMPLE_SIZE
): Partial<Record<FaqPresetCategory, FaqPreset[]>> {
  const grouped = getPresetsByCategory(page);
  const sampled: Partial<Record<FaqPresetCategory, FaqPreset[]>> = {};

  for (const [category, presets] of Object.entries(grouped) as Array<
    [FaqPresetCategory, FaqPreset[]]
  >) {
    sampled[category] = sampleFromPool(
      presets,
      sampleSize,
      createRandomSource(`${sampleKey}:${category}`)
    );
  }

  return sampled;
}

export function getPresetsByIds(ids: string[]): FaqPreset[] {
  const lookup = new Map(FAQ_PRESETS.map((preset) => [preset.id, preset]));
  return ids
    .map((id) => lookup.get(id))
    .filter((preset): preset is FaqPreset => Boolean(preset));
}

export function samplePackagePresets(
  page: FaqPageContext,
  categories: FaqPresetCategory[],
  sampleKey: string,
  sampleSize = FAQ_POOL_SAMPLE_SIZE
): FaqPreset[] {
  const pool = categories.flatMap((category) =>
    getPresetsForPageAndCategory(page, category)
  );
  const uniquePool = [...new Map(pool.map((preset) => [preset.id, preset])).values()];

  return sampleFromPool(
    uniquePool,
    sampleSize,
    createRandomSource(`${sampleKey}:package:${categories.join("-")}`)
  );
}
