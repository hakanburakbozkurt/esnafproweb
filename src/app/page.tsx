import { LandingFooter } from "@/components/landing/landing-footer";
import { LandingNavbar } from "@/components/landing/landing-navbar";
import { HomePage } from "@/components/landing/home-page";
import { getLatestPublicBlogPosts } from "@/lib/blog/public-blog-posts";
import { getFeaturedStoresForLanding } from "@/lib/dukkan/get-public-stores";
import { getActiveFaqs, toFaqItems } from "@/lib/faqs/get-faqs";

import type { Metadata } from "next";
import { resolvePlatformPageMetadata } from "@/lib/seo/get-platform-page-seo";

export async function generateMetadata(): Promise<Metadata> {
  return resolvePlatformPageMetadata("/");
}

export default async function Page() {
  const [faqs, featured, blogPosts] = await Promise.all([
    getActiveFaqs("anasayfa"),
    getFeaturedStoresForLanding(),
    getLatestPublicBlogPosts(),
  ]);

  return (
    <div className="min-h-screen overflow-x-hidden bg-white text-slate-900">
      <LandingNavbar />
      <HomePage
        faqItems={toFaqItems(faqs)}
        featuredStores={featured.stores}
        featuredStoresHasMore={featured.hasMore}
        blogPosts={blogPosts}
      />
      <LandingFooter />
    </div>
  );
}
