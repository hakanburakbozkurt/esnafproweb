import { HomePageClient } from "@/components/landing/home-page-client";
import type { PublicBlogPost } from "@/lib/blog/public-blog-post.types";
import type { PublicStoreCard } from "@/lib/dukkan/public-store.types";
import type { FaqItem } from "@/types/database.types";

export function HomePage({
  faqItems = [],
  featuredStores = [],
  featuredStoresHasMore = false,
  blogPosts = [],
}: {
  faqItems?: FaqItem[];
  featuredStores?: PublicStoreCard[];
  featuredStoresHasMore?: boolean;
  blogPosts?: PublicBlogPost[];
}) {
  return (
    <main className="min-w-0 overflow-x-hidden">
      <HomePageClient
        faqItems={faqItems}
        featuredStores={featuredStores}
        featuredStoresHasMore={featuredStoresHasMore}
        blogPosts={blogPosts}
      />
    </main>
  );
}
