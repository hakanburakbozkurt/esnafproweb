import { FaqSection } from "@/components/dukkan/faq-section";
import type { FaqItem } from "@/types/database.types";

export function LandingFaqSection({ items }: { items: FaqItem[] }) {
  if (!items.length) return null;

  return (
    <section id="sss" className="overflow-x-hidden bg-slate-50/60 px-4 py-20 sm:px-6 md:py-28">
      <div className="mx-auto w-full min-w-0 max-w-3xl">
        <FaqSection items={items} variant="card" />
      </div>
    </section>
  );
}
