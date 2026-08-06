import { LandingFooter } from "@/components/landing/landing-footer";
import { LandingNavbar } from "@/components/landing/landing-navbar";
import { LandingFaqSection } from "@/components/landing/landing-faq-section";
import { PricingSection } from "@/components/landing/pricing-section";
import { getActiveFaqs, toFaqItems } from "@/lib/faqs/get-faqs";
import { getActivePricingPlans } from "@/lib/pricing/get-pricing-plans";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Fiyatlandırma | EsnafPRO",
  description:
    "Esnaf ve toptancı için şeffaf paket fiyatları. Aylık veya yıllık planlarla EsnafPRO'ya başlayın.",
};

export default async function FiyatlandirmaPage() {
  const [pricingPlans, pricingFaqs] = await Promise.all([
    getActivePricingPlans(),
    getActiveFaqs("fiyatlandirma"),
  ]);

  return (
    <div className="min-h-screen overflow-x-hidden bg-white text-slate-900">
      <LandingNavbar />
      <main className="pt-8">
        <PricingSection plans={pricingPlans} />
        <LandingFaqSection items={toFaqItems(pricingFaqs)} />
      </main>
      <LandingFooter />
    </div>
  );
}
