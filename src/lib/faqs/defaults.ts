import type { FaqContext, PlatformFaq } from "@/lib/faqs/types";

/** Ana sayfa alt bölümü — veritabanı boşsa fallback */
export const DEFAULT_HOME_FAQS: PlatformFaq[] = [
  {
    id: "default-anasayfa-1",
    soru: "EsnafPRO nedir?",
    cevap:
      "EsnafPRO; telefon ve aksesuar esnafının dijital vitrinini, stok ve servis süreçlerini tek panelde yönetmesini sağlayan B2B platformudur. Kendi slug adresinizle müşterilerinize 7/24 ulaşırsınız.",
    sort_order: 0,
    is_active: true,
    context: "anasayfa",
  },
  {
    id: "default-anasayfa-2",
    soru: "Mağaza sayfam (vitrin) nasıl açılır?",
    cevap:
      "Kayıt olduktan sonra birkaç adımda mağaza adınızı ve slug adresinizi seçerek vitrininizi oluşturabilirsiniz. Ürünlerinizi, iletişim bilgilerinizi ve görsellerinizi ekledikten sonra sayfanız yayına hazır olur.",
    sort_order: 1,
    is_active: true,
    context: "anasayfa",
  },
  {
    id: "default-anasayfa-3",
    soru: "Toptancı olarak nasıl katılabilirim?",
    cevap:
      "Kayıt sırasında Toptancı rolünü seçin, firma profilinizi tamamlayın ve XML veya ürün feed'inizi yükleyin. Esnaflar sipariş verdiğinde bildirim anında panelinize düşer.",
    sort_order: 2,
    is_active: true,
    context: "anasayfa",
  },
  {
    id: "default-anasayfa-4",
    soru: "Teknik servis takibi nasıl çalışır?",
    cevap:
      "Servise alınan cihazlar için takip kodu oluşturulur. Müşteriniz esnafpro.app üzerinden cihaz durumunu canlı takip edebilir; siz de panelden aşamaları güncellersiniz.",
    sort_order: 3,
    is_active: true,
    context: "anasayfa",
  },
  {
    id: "default-anasayfa-5",
    soru: "Blog ve yerel SEO ne işe yarar?",
    cevap:
      "Mağaza vitrininize eklediğiniz blog yazıları; mahalle, hizmet ve uzmanlık alanlarınızı anlatır. Google ve yerel aramalarda görünürlüğünüzü artırmaya yardımcı olur.",
    sort_order: 4,
    is_active: true,
    context: "anasayfa",
  },
];

/** Fiyatlandırma sayfası — veritabanı boşsa fallback */
export const DEFAULT_PRICING_FAQS: PlatformFaq[] = [
  {
    id: "default-fiyatlandirma-1",
    soru: "Aylık ve yıllık plan arasındaki fark nedir?",
    cevap:
      "Aylık plan esnek ödeme sunar; yıllık planda genellikle aylık eşdeğere göre indirimli fiyatlandırma uygulanır. İhtiyacınıza göre istediğiniz dönemde geçiş yapabilirsiniz.",
    sort_order: 0,
    is_active: true,
    context: "fiyatlandirma",
  },
  {
    id: "default-fiyatlandirma-2",
    soru: "Ücretsiz deneme var mı?",
    cevap:
      "Başlangıç paketiyle mağazanızı hızlıca kurup vitrininizi test edebilirsiniz. Güncel deneme koşulları için fiyatlandırma kartlarındaki CTA metinlerini inceleyin.",
    sort_order: 1,
    is_active: true,
    context: "fiyatlandirma",
  },
  {
    id: "default-fiyatlandirma-3",
    soru: "Paketimi sonradan yükseltebilir miyim?",
    cevap:
      "Evet. İşletmeniz büyüdükçe Pro veya üst paketlere geçerek blog, pazaryeri ve gelişmiş SEO araçlarına erişebilirsiniz.",
    sort_order: 2,
    is_active: true,
    context: "fiyatlandirma",
  },
  {
    id: "default-fiyatlandirma-4",
    soru: "Toptancı paketleri esnaf paketlerinden farklı mı?",
    cevap:
      "Evet. Toptancı planları XML feed, sipariş bildirimleri ve esnaf ağı entegrasyonuna odaklanır; esnaf planları vitrin, servis ve yerel görünürlük araçlarını kapsar.",
    sort_order: 3,
    is_active: true,
    context: "fiyatlandirma",
  },
];

export const DEFAULT_FAQS: PlatformFaq[] = [
  ...DEFAULT_HOME_FAQS,
  ...DEFAULT_PRICING_FAQS,
];

export function getDefaultFaqsForContext(context: FaqContext): PlatformFaq[] {
  return context === "fiyatlandirma" ? DEFAULT_PRICING_FAQS : DEFAULT_HOME_FAQS;
}
