import { LandingFooter } from "@/components/landing/landing-footer";
import { LandingNavbar } from "@/components/landing/landing-navbar";
import { HomePage } from "@/components/landing/home-page";
import { getActiveFaqs, toFaqItems } from "@/lib/faqs/get-faqs";

export default async function Page() {
  const faqs = await getActiveFaqs("anasayfa");

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <LandingNavbar />
      <HomePage faqItems={toFaqItems(faqs)} />
      <LandingFooter />
    </div>
  );
}
