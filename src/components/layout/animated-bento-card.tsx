"use client";

import type { ReactNode } from "react";
import { ScrollReveal } from "@/components/motion/scroll-reveal";
import { cn } from "@/lib/utils/cn";
import { bentoCardClass, bentoSectionTitleClass } from "@/lib/utils/layout";

export function AnimatedBentoCard({
  id,
  title,
  children,
  className,
  revealDelay = 0,
}: {
  id?: string;
  title?: string;
  children: ReactNode;
  className?: string;
  revealDelay?: number;
}) {
  return (
    <ScrollReveal delay={revealDelay} className={cn("min-w-0", className)}>
      <section id={id} className={cn(bentoCardClass, "h-full")}>
        {title && <h2 className={bentoSectionTitleClass}>{title}</h2>}
        {children}
      </section>
    </ScrollReveal>
  );
}
