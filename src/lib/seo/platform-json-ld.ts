import { getPublicSiteUrl } from "@/lib/auth/site-url";

const PLATFORM_NAME = "EsnafPRO";
const PLATFORM_DESCRIPTION =
  "Esnaflar için ücretsiz dijital vitrin ve mağaza yönetimi: ürünlerini, teknik servisini ve ikinci el cihazlarını internette tek adreste gösterir, Trendyol'a ürün gönderebilir.";

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
      url: base,
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "@id": `${base}/#website`,
      name: PLATFORM_NAME,
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
