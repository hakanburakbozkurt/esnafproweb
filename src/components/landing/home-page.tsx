import { HomePageClient } from "@/components/landing/home-page-client";
import type { FaqItem } from "@/types/database.types";

export function HomePage({ faqItems = [] }: { faqItems?: FaqItem[] }) {
  return (
    <main>
      <HomePageClient faqItems={faqItems} />
    </main>
  );
}
