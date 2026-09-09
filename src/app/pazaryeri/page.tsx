import { LandingFooter } from "@/components/landing/landing-footer";
import { LandingNavbar } from "@/components/landing/landing-navbar";
import { MarketplacePageContent } from "@/components/marketplace/marketplace-page-content";
import { getMarketplaceListings } from "@/lib/marketplace/get-public-listings";
import { resolvePlatformPageMetadata } from "@/lib/seo/get-platform-page-seo";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return resolvePlatformPageMetadata("/pazaryeri");
}

export default async function PazaryeriPage() {
  const listings = await getMarketplaceListings();

  return (
    <div className="min-h-screen overflow-x-hidden bg-white text-slate-900">
      <LandingNavbar />
      <main className="overflow-x-hidden px-4 py-16 sm:px-6 md:py-24">
        <MarketplacePageContent listings={listings} />
      </main>
      <LandingFooter />
    </div>
  );
}
