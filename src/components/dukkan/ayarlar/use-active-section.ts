"use client";

import { useEffect, useState } from "react";

/** Ekranın üst kısmına en yakın görünür bölümü izler. */
export function useActiveSection(ids: readonly string[]) {
  const [activeId, setActiveId] = useState<string>(ids[0] ?? "");
  const idsKey = ids.join("|");

  useEffect(() => {
    const sectionIds = idsKey.split("|").filter(Boolean);
    const elements = sectionIds
      .map((id) => document.getElementById(id))
      .filter((element): element is HTMLElement => Boolean(element));

    if (!elements.length || typeof IntersectionObserver === "undefined") {
      return;
    }

    const visible = new Set<string>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.add(entry.target.id);
          else visible.delete(entry.target.id);
        }

        const next = sectionIds.find((id) => visible.has(id));
        if (next) setActiveId(next);
      },
      { rootMargin: "-200px 0px -55% 0px", threshold: 0 }
    );

    for (const element of elements) observer.observe(element);
    return () => observer.disconnect();
  }, [idsKey]);

  return [activeId, setActiveId] as const;
}
