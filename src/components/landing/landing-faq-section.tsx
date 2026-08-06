import { FaqSection } from "@/components/dukkan/faq-section";
import type { FaqItem } from "@/types/database.types";

export function LandingFaqSection({ items }: { items: FaqItem[] }) {
  if (!items.length) return null;

  return (
    <section id="sss" className="bg-slate-50/60 px-6 py-20 md:py-28">
      <div className="mx-auto max-w-3xl">
        <FaqSection items={items} variant="card" />
      </div>
    </section>
  );
}
