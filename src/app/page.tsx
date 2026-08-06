import { HomePage } from "@/components/landing/home-page";
import { getActiveFaqs, toFaqItems } from "@/lib/faqs/get-faqs";

export default async function Page() {
  const faqs = await getActiveFaqs("anasayfa");

  return <HomePage faqItems={toFaqItems(faqs)} />;
}
