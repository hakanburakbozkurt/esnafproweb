import { LandingFooter } from "@/components/landing/landing-footer";
import { LandingNavbar } from "@/components/landing/landing-navbar";
import { MarketplacePageContent } from "@/components/marketplace/marketplace-page-content";
import { PazaryeriHizliLinkler } from "@/components/marketplace/pazaryeri-hizli-linkler";
import { PAZARYERI_SAYFALARI, sayfaIlanlari } from "@/lib/marketplace/pazaryeri-sayfalari";
import { getMarketplaceListings } from "@/lib/marketplace/get-public-listings";
import { resolvePlatformPageMetadata } from "@/lib/seo/get-platform-page-seo";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return resolvePlatformPageMetadata("/pazaryeri");
}

export default async function PazaryeriPage() {
  const listings = await getMarketplaceListings();
  const doluSluglar = new Set(
    PAZARYERI_SAYFALARI.filter((sayfa) => sayfaIlanlari(listings, sayfa).length > 0).map((sayfa) => sayfa.slug)
  );

  return (
    <div className="min-h-screen overflow-x-hidden bg-white text-slate-900">
      <LandingNavbar />
      <main className="overflow-x-hidden px-4 py-16 sm:px-6 md:py-24">
        <MarketplacePageContent
          listings={listings}
          ustLinkler={<PazaryeriHizliLinkler doluSluglar={doluSluglar} />}
        />
      </main>
      <LandingFooter />
    </div>
  );
}
