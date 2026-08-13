import { LandingFooter } from "@/components/landing/landing-footer";
import { LandingNavbar } from "@/components/landing/landing-navbar";
import { HomePage } from "@/components/landing/home-page";
import { getFeaturedStoresForLanding } from "@/lib/dukkan/get-public-stores";
import { getActiveFaqs, toFaqItems } from "@/lib/faqs/get-faqs";

export default async function Page() {
  const [faqs, featured] = await Promise.all([
    getActiveFaqs("anasayfa"),
    getFeaturedStoresForLanding(),
  ]);

  return (
    <div className="min-h-screen overflow-x-hidden bg-white text-slate-900">
      <LandingNavbar />
      <HomePage
        faqItems={toFaqItems(faqs)}
        featuredStores={featured.stores}
        featuredStoresHasMore={featured.hasMore}
      />
      <LandingFooter />
    </div>
  );
}
