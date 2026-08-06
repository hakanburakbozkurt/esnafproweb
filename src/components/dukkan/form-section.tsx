"use client";

import type { ReactNode } from "react";
import {
  adminSectionClassName,
  premiumSectionClassName,
  cn,
} from "@/lib/utils/cn";

export function FormSection({
  title,
  description,
  children,
  className,
  variant = "card",
}: {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
  variant?: "card" | "open" | "admin";
}) {
  return (
    <section
      className={cn(
        variant === "admin"
          ? adminSectionClassName
          : variant === "card"
            ? premiumSectionClassName
            : "border-b border-slate-200/60 pb-8 last:border-b-0 lg:pb-10",
        "space-y-5",
        className
      )}
    >
      <div>
        <h3
          className={
            variant === "open" || variant === "admin"
              ? "text-lg font-semibold tracking-tight text-emerald-700 lg:text-xl"
              : "text-base font-semibold tracking-tight text-slate-900"
          }
        >
          {title}
        </h3>
        {description && (
          <p className="mt-1.5 text-sm leading-relaxed text-slate-500 lg:text-base">
            {description}
          </p>
        )}
      </div>
      {children}
    </section>
  );
}
