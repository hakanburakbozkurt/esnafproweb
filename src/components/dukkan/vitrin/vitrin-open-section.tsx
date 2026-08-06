import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export const vitrinSectionLabelClass =
  "mb-6 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400";

export function VitrinDotGrid({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 -z-10 opacity-[0.32]",
        className
      )}
      style={{
        backgroundImage:
          "radial-gradient(circle, rgb(203 213 225 / 0.9) 1px, transparent 1px)",
        backgroundSize: "22px 22px",
      }}
    />
  );
}

export function VitrinOpenSection({
  id,
  title,
  children,
  className,
}: {
  id?: string;
  title?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      id={id}
      className={cn(
        "border-b border-slate-200/50 py-10 last:border-b-0 lg:py-14",
        className
      )}
    >
      {title && <p className={vitrinSectionLabelClass}>{title}</p>}
      {children}
    </section>
  );
}
