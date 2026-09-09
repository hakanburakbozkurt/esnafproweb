import type { FaqContext, PlatformFaq } from "@/lib/faqs/types";

/** Ana sayfa alt bölümü — yalnızca public landing fallback (admin panelde gösterilmez) */
export const DEFAULT_HOME_FAQS: PlatformFaq[] = [
  {
    id: "default-anasayfa-1",
    soru: "EsnafPRO nedir, kimler için?",
    cevap:
      "EsnafPRO; telefon, aksesuar ve teknik servis esnafının dijital vitrinini, müşteri iletişimini ve operasyonlarını tek panelde yönetmesini sağlayan yerli bir B2B platformudur. Kendi mağaza adresinizle (slug) müşterilerinize 7/24 ulaşırsınız.",
    sort_order: 0,
    is_active: true,
    context: "anasayfa",
  },
  {
    id: "default-anasayfa-2",
    soru: "Dijital vitrin (mağaza sayfası) ne işime yarar?",
    cevap:
      "Ürünlerinizi, hizmetlerinizi, iletişim bilgilerinizi ve konumunuzu tek linkte toplarsınız. Müşterileriniz sizi Google’da bulduğunda profesyonel bir vitrin görür; WhatsApp ve arama butonlarıyla anında iletişime geçer.",
    sort_order: 1,
    is_active: true,
    context: "anasayfa",
  },
  {
    id: "default-anasayfa-3",
    soru: "Mağaza sayfamı nasıl açıp yayına alırım?",
    cevap:
      "Kayıt olduktan sonra dükkan adınızı ve slug adresinizi seçerek vitrininizi oluşturursunuz. Logo, ürünler, çalışma saatleri ve görselleri ekledikten sonra sayfanız paylaşıma hazır hale gelir.",
    sort_order: 2,
    is_active: true,
    context: "anasayfa",
  },
  {
    id: "default-anasayfa-4",
    soru: "Teknik servis takibi nasıl çalışır?",
    cevap:
      "Servise alınan cihazlar için takip kaydı açılır. Müşteriniz onay linki üzerinden cihaz durumunu canlı izler; siz panelden aşamaları güncelledikçe bildirim ve durum otomatik yansır.",
    sort_order: 3,
    is_active: true,
    context: "anasayfa",
  },
  {
    id: "default-anasayfa-5",
    soru: "2. el cihaz pazaryeri vitrini var mı?",
    cevap:
      "Evet. İkinci el telefon, tablet ve cihazlarınızı vitrininize ve genel pazaryere ekleyebilirsiniz. Kapak fotoğrafı, fiyat ve durum bilgileriyle ilanlarınız düzenli bir vitrinde listelenir.",
    sort_order: 4,
    is_active: true,
    context: "anasayfa",
  },
  {
    id: "default-anasayfa-6",
    soru: "Blog ve yerel SEO beni nasıl öne çıkarır?",
    cevap:
      "Mahalle, semt ve hizmet odaklı blog yazıları; “telefon tamiri”, “ekran değişimi” gibi yerel aramalarda görünürlüğünüzü artırır. Profil gücü skoru ile eksik alanları tamamlayarak vitrininizi arama motorları için güçlendirirsiniz.",
    sort_order: 5,
    is_active: true,
    context: "anasayfa",
  },
  {
    id: "default-anasayfa-7",
    soru: "Toptancı olarak platforma nasıl katılırım?",
    cevap:
      "Kayıt sırasında Toptancı rolünü seçin, firma profilinizi tamamlayın ve XML veya ürün feed’inizi bağlayın. Esnaflar stoklarınızı vitrinlerinde gösterir; sipariş ve talepler panelinize düşer.",
    sort_order: 6,
    is_active: true,
    context: "anasayfa",
  },
  {
    id: "default-anasayfa-8",
    soru: "Kurulum için teknik bilgi gerekir mi?",
    cevap:
      "Hayır. EsnafPRO mobil öncelikli ve sade bir arayüzle tasarlandı. Kod bilmeden birkaç adımda vitrininizi açabilir, ürün ve iletişim bilgilerinizi kendiniz yönetebilirsiniz.",
    sort_order: 7,
    is_active: true,
    context: "anasayfa",
  },
];

/** Fiyatlandırma sayfası — yalnızca public landing fallback */
export const DEFAULT_PRICING_FAQS: PlatformFaq[] = [
  {
    id: "default-fiyatlandirma-1",
    soru: "Aylık ve yıllık plan arasındaki fark nedir?",
    cevap:
      "Aylık plan esnek ödeme sunar; yıllık planda genellikle aylık eşdeğere göre indirimli fiyatlandırma uygulanır. İşletmenizin nakit akışına göre istediğiniz dönemde geçiş yapabilirsiniz.",
    sort_order: 0,
    is_active: true,
    context: "fiyatlandirma",
  },
  {
    id: "default-fiyatlandirma-2",
    soru: "Ücretsiz deneme veya başlangıç paketi var mı?",
    cevap:
      "Başlangıç paketiyle vitrininizi hızlıca kurup test edebilirsiniz. Güncel deneme koşulları ve CTA metinleri fiyatlandırma kartlarında yer alır; kampanya dönemlerinde değişebilir.",
    sort_order: 1,
    is_active: true,
    context: "fiyatlandirma",
  },
  {
    id: "default-fiyatlandirma-3",
    soru: "Paketimi sonradan yükseltebilir miyim?",
    cevap:
      "Evet. İşletmeniz büyüdükçe Pro veya üst paketlere geçerek blog, pazaryeri, gelişmiş SEO araçları ve teknik servis modüllerine erişebilirsiniz.",
    sort_order: 2,
    is_active: true,
    context: "fiyatlandirma",
  },
  {
    id: "default-fiyatlandirma-4",
    soru: "Toptancı paketleri esnaf paketlerinden farklı mı?",
    cevap:
      "Evet. Toptancı planları XML feed, stok senkronu, sipariş bildirimleri ve esnaf ağı entegrasyonuna odaklanır. Esnaf planları dijital vitrin, servis takibi ve yerel görünürlük araçlarını kapsar.",
    sort_order: 3,
    is_active: true,
    context: "fiyatlandirma",
  },
  {
    id: "default-fiyatlandirma-5",
    soru: "Plan değişikliği veya iptal nasıl yapılır?",
    cevap:
      "Paket değişiklikleri yönetim panelinizden talep edilebilir. İptal ve fatura koşulları seçtiğiniz plan dönemine göre uygulanır; detaylar için destek ekibimizle iletişime geçebilirsiniz.",
    sort_order: 4,
    is_active: true,
    context: "fiyatlandirma",
  },
  {
    id: "default-fiyatlandirma-6",
    soru: "Fiyatlar KDV dahil mi?",
    cevap:
      "Landing sayfasındaki fiyatlar bilgilendirme amaçlıdır. Güncel vergi ve fatura koşulları sözleşme ve ödeme adımında netleştirilir; kurumsal faturalı işletmeler için destek sunulur.",
    sort_order: 5,
    is_active: true,
    context: "fiyatlandirma",
  },
];

export const DEFAULT_FAQS: PlatformFaq[] = [
  ...DEFAULT_HOME_FAQS,
  ...DEFAULT_PRICING_FAQS,
];

export const DEFAULT_FAQ_SEED_COUNT = DEFAULT_FAQS.length;

export function getDefaultFaqsForContext(context: FaqContext): PlatformFaq[] {
  return context === "fiyatlandirma" ? DEFAULT_PRICING_FAQS : DEFAULT_HOME_FAQS;
}

export function getAllDefaultFaqsForSeed() {
  return DEFAULT_FAQS.map(({ soru, cevap, sort_order, is_active, context }) => ({
    soru,
    cevap,
    sort_order,
    is_active,
    context,
  }));
}
