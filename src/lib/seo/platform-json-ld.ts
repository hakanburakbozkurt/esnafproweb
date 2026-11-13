import { getPublicSiteUrl } from "@/lib/auth/site-url";
import { SITE_CONTACT } from "@/lib/site/contact";

const PLATFORM_NAME = "EsnafPRO";
const PLATFORM_DESCRIPTION =
  "Cep telefoncuları ve teknik servisler için ücretsiz dijital mağaza ve işletme yönetimi: ürünler, ikinci el cihazlar ve teknik servis takibi tek adreste; ürünler Trendyol'a da gönderilebilir.";

/** Google bilgi paneli ve yapay zeka aramaları için platformun yaptığı işler */
const PLATFORM_FEATURES = [
  "Ücretsiz mağaza sayfası (esnafpro.app/dukkan-adi)",
  "Ürün ve kategori vitrini",
  "İkinci el ve sıfır cihaz ilanları",
  "Teknik servis kaydı ve müşteriye WhatsApp ile takip bağlantısı",
  "Trendyol'a ürün gönderme ve stok eşitleme",
  "Telefon tamir fiyatı sorgulama",
];

/**
 * Ana sayfa için site düzeyinde yapılandırılmış veri:
 * Organization, WebSite ve SoftwareApplication (ücretsiz uygulama).
 */
export function buildPlatformJsonLd(siteUrl: string = getPublicSiteUrl()) {
  const base = siteUrl.replace(/\/$/, "");

  return [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      "@id": `${base}/#organization`,
      name: PLATFORM_NAME,
      alternateName: ["Esnaf PRO", "esnafpro.app"],
      url: base,
      logo: {
        "@type": "ImageObject",
        url: `${base}/favicon.png`,
        width: 512,
        height: 512,
      },
      image: `${base}/api/og`,
      description: PLATFORM_DESCRIPTION,
      email: SITE_CONTACT.email,
      telephone: SITE_CONTACT.phoneTel,
      address: {
        "@type": "PostalAddress",
        streetAddress: "Aşık Veysel Mah., Reşneli Niyazi Sk. No:4/49, Çarşıpazarkent AVM 1. Kat",
        addressLocality: "Esenyurt",
        addressRegion: "İstanbul",
        postalCode: "34510",
        addressCountry: "TR",
      },
      areaServed: { "@type": "Country", name: "Türkiye" },
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "customer support",
        telephone: SITE_CONTACT.phoneTel,
        email: SITE_CONTACT.email,
        availableLanguage: ["tr"],
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "@id": `${base}/#website`,
      name: PLATFORM_NAME,
      alternateName: "esnafpro.app",
      description: PLATFORM_DESCRIPTION,
      url: base,
      inLanguage: "tr-TR",
      publisher: { "@id": `${base}/#organization` },
    },
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "@id": `${base}/#software`,
      name: PLATFORM_NAME,
      url: base,
      description: PLATFORM_DESCRIPTION,
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      featureList: PLATFORM_FEATURES,
      screenshot: `${base}/api/og`,
      inLanguage: "tr-TR",
      offers: {
        "@type": "Offer",
        price: 0,
        priceCurrency: "TRY",
      },
      publisher: { "@id": `${base}/#organization` },
    },
  ];
}
