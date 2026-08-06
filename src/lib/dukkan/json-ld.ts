import {
  parseCalismaSaatleri,
  toSchemaOrgOpeningHours,
} from "@/lib/dukkan/calisma-saatleri";
import { getVisibleFaqItems } from "@/lib/dukkan/faq";
import type { Dukkan, FaqItem } from "@/types/database.types";

function getSiteOrigin() {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "https://esnafpro.com";
}

export function buildLocalBusinessJsonLd(dukkan: Dukkan) {
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: dukkan.dukkan_adi,
    url: `${getSiteOrigin()}/${dukkan.slug}`,
  };

  if (dukkan.aciklama) schema.description = dukkan.aciklama;
  if (dukkan.whatsapp || dukkan.telefon) {
    schema.telephone = dukkan.whatsapp ?? dukkan.telefon;
  }
  if (dukkan.logo_url) schema.logo = dukkan.logo_url;

  const sameAs = [
    dukkan.instagram_url,
    dukkan.tiktok_url,
    dukkan.facebook_url,
  ].filter(Boolean);

  if (sameAs.length) schema.sameAs = sameAs;

  const schedule = parseCalismaSaatleri(dukkan.calisma_saatleri);
  if (schedule) {
    const openingHours = toSchemaOrgOpeningHours(schedule);
    if (openingHours.length) schema.openingHours = openingHours;
  } else if (dukkan.calisma_saatleri) {
    schema.openingHours = dukkan.calisma_saatleri;
  }

  const images = [
    dukkan.banner_url,
    dukkan.logo_url,
    ...(dukkan.dukkan_fotograflari ?? []),
  ].filter(Boolean);

  if (images.length) schema.image = images;

  if (dukkan.adres) {
    schema.address = {
      "@type": "PostalAddress",
      streetAddress: dukkan.adres,
      addressCountry: "TR",
    };
  }

  if (dukkan.enlem != null && dukkan.boylam != null) {
    schema.geo = {
      "@type": "GeoCoordinates",
      latitude: dukkan.enlem,
      longitude: dukkan.boylam,
    };
  }

  return schema;
}

export function buildFaqPageJsonLd(faqItems: FaqItem[]) {
  const visibleItems = getVisibleFaqItems(faqItems);
  if (!visibleItems.length) return null;

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: visibleItems.map((item) => ({
      "@type": "Question",
      name: item.soru.trim(),
      acceptedAnswer: {
        "@type": "Answer",
        text: item.cevap.trim(),
      },
    })),
  };
}

export function buildDukkanJsonLd(dukkan: Dukkan) {
  return [buildLocalBusinessJsonLd(dukkan)];
}
