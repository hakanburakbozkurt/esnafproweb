"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  BookOpen,
  Images,
  MapPin,
  MessageCircleQuestionMark,
  Package,
  Phone,
  Search,
  SlidersHorizontal,
  Store,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useRef } from "react";
import type {
  DukkanSettingsSection,
  DukkanSettingsSectionId,
} from "@/lib/dukkan/settings-sections";
import { cn } from "@/lib/utils/cn";

const SECTION_ICONS: Record<DukkanSettingsSectionId, LucideIcon> = {
  "ayar-temel": Store,
  "ayar-urunler": Package,
  "ayar-seo": Search,
  "ayar-gorseller": Images,
  "ayar-hakkimizda": BookOpen,
  "ayar-iletisim": Phone,
  "ayar-konum": MapPin,
  "ayar-sss": MessageCircleQuestionMark,
  "ayar-moduller": SlidersHorizontal,
};

type SettingsSectionNavProps = {
  sections: readonly DukkanSettingsSection[];
  activeId: string;
  onSelect: (id: DukkanSettingsSectionId) => void;
  variant: "sidebar" | "chips";
  className?: string;
};

export function SettingsSectionNav({
  sections,
  activeId,
  onSelect,
  variant,
  className,
}: SettingsSectionNavProps) {
  const reduceMotion = useReducedMotion();
  const scrollerRef = useRef<HTMLUListElement>(null);
  const isChips = variant === "chips";

  useEffect(() => {
    if (!isChips) return;
    const scroller = scrollerRef.current;
    const activeItem = scroller?.querySelector<HTMLElement>(
      `[data-section-id="${activeId}"]`
    );
    if (!scroller || !activeItem) return;

    scroller.scrollTo({
      left:
        activeItem.offsetLeft -
        scroller.clientWidth / 2 +
        activeItem.clientWidth / 2,
      behavior: reduceMotion ? "auto" : "smooth",
    });
  }, [activeId, isChips, reduceMotion]);

  return (
    <nav
      aria-label="Mağaza ayarları bölümleri"
      className={cn(
        isChips &&
          "sticky z-30 -mx-4 border-b border-slate-200/70 bg-white/90 backdrop-blur-md sm:-mx-6",
        className
      )}
    >
      <ul
        ref={scrollerRef}
        className={cn(
          isChips
            ? "flex gap-1.5 overflow-x-auto px-4 py-2 [-ms-overflow-style:none] [scrollbar-width:none] sm:px-6 [&::-webkit-scrollbar]:hidden"
            : "space-y-1 rounded-3xl border border-slate-200/70 bg-white/95 p-2 shadow-sm"
        )}
      >
        {sections.map((section) => {
          const active = section.id === activeId;
          const Icon = SECTION_ICONS[section.id];

          return (
            <li key={section.id} data-section-id={section.id} className="shrink-0">
              <a
                href={`#${section.id}`}
                aria-current={active ? "location" : undefined}
                onClick={(event) => {
                  event.preventDefault();
                  onSelect(section.id);
                }}
                className={cn(
                  "relative flex min-h-11 items-center gap-2.5 font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40",
                  isChips
                    ? "rounded-full px-4 text-sm"
                    : "rounded-2xl px-3.5 text-sm",
                  active
                    ? "text-white"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                )}
              >
                {active && (
                  <motion.span
                    layoutId={`settings-nav-active-${variant}`}
                    aria-hidden
                    className={cn(
                      "absolute inset-0 bg-emerald-600 shadow-sm shadow-emerald-600/20",
                      isChips ? "rounded-full" : "rounded-2xl"
                    )}
                    transition={
                      reduceMotion
                        ? { duration: 0 }
                        : { type: "spring", stiffness: 420, damping: 34 }
                    }
                  />
                )}
                <Icon className="relative size-4 shrink-0" aria-hidden />
                <span className="relative whitespace-nowrap">{section.label}</span>
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
