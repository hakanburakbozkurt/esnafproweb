"use client";

import { useId, useState } from "react";
import type { FaqItem } from "@/types/database.types";
import { cn } from "@/lib/utils/cn";

export function FaqSection({
  items,
  variant = "card",
}: {
  items: FaqItem[];
  variant?: "card" | "open";
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const sectionId = useId();

  const visibleItems = items.filter(
    (item) => item.soru.trim() && item.cevap.trim()
  );

  if (!visibleItems.length) return null;

  return (
    <section aria-labelledby={`${sectionId}-heading`}>
      <header className="mb-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-600">
          SSS
        </p>
        <h2
          id={`${sectionId}-heading`}
          className={
            variant === "open"
              ? "mt-2 text-xl font-bold tracking-tight text-emerald-700 lg:text-2xl"
              : "mt-2 text-xl font-bold tracking-tight text-slate-900 sm:text-2xl"
          }
        >
          Sık Sorulan Sorular
        </h2>
      </header>

      <div itemScope itemType="https://schema.org/FAQPage">
        <ul className={variant === "open" ? "flex flex-col" : "flex flex-col gap-3"}>
          {visibleItems.map((item, index) => {
            const isOpen = openIndex === index;
            const questionId = `${sectionId}-q-${index}`;
            const answerId = `${sectionId}-a-${index}`;

            return (
              <li
                key={`${item.soru}-${index}`}
                itemScope
                itemProp="mainEntity"
                itemType="https://schema.org/Question"
                className={
                  variant === "open"
                    ? "border-b border-slate-200/60 last:border-b-0"
                    : "overflow-hidden rounded-2xl border border-slate-200/80 bg-slate-50/50"
                }
              >
                <article>
                  <h3 className="m-0">
                    <button
                      type="button"
                      id={questionId}
                      onClick={() => setOpenIndex(isOpen ? null : index)}
                      aria-expanded={isOpen}
                      aria-controls={answerId}
                      className={
                        variant === "open"
                          ? "flex min-h-14 w-full items-center justify-between gap-3 py-4 text-left"
                          : "flex min-h-14 w-full items-center justify-between gap-3 px-4 py-4 text-left sm:px-5"
                      }
                    >
                      <span
                        itemProp="name"
                        className="min-w-0 flex-1 text-sm font-semibold leading-snug text-slate-900 sm:text-base"
                      >
                        {item.soru}
                      </span>
                      <span
                        className={cn(
                          "flex size-9 shrink-0 items-center justify-center rounded-full text-lg font-medium transition",
                          isOpen
                            ? "bg-emerald-50 text-emerald-600"
                            : "bg-white text-slate-500 ring-1 ring-slate-200/80"
                        )}
                        aria-hidden
                      >
                        {isOpen ? "−" : "+"}
                      </span>
                    </button>
                  </h3>

                  <div
                    id={answerId}
                    role="region"
                    aria-labelledby={questionId}
                    itemScope
                    itemProp="acceptedAnswer"
                    itemType="https://schema.org/Answer"
                    className={cn(
                      "grid transition-[grid-template-rows] duration-200 ease-out",
                      isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                    )}
                  >
                    <div className="overflow-hidden">
                      <p
                        itemProp="text"
                        className={
                          variant === "open"
                            ? "border-t border-slate-200/60 py-4 text-sm leading-relaxed text-slate-500 sm:text-[15px] lg:text-base"
                            : "border-t border-slate-200/80 px-4 py-4 text-sm leading-relaxed text-slate-600 sm:px-5 sm:text-[15px]"
                        }
                      >
                        {item.cevap}
                      </p>
                    </div>
                  </div>
                </article>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
