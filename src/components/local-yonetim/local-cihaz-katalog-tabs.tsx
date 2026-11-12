"use client";

import type { ReactNode } from "react";
import { useState } from "react";

type Sekme = "modeller" | "secenekler";

export function LocalCihazKatalogTabs({
  modeller,
  secenekler,
}: {
  modeller: ReactNode;
  secenekler: ReactNode;
}) {
  const [sekme, setSekme] = useState<Sekme>("modeller");

  const tabs: { key: Sekme; label: string }[] = [
    { key: "modeller", label: "Modeller" },
    { key: "secenekler", label: "Cihaz Seçenekleri" },
  ];

  return (
    <div className="space-y-6">
      <div role="tablist" aria-label="Cihaz kataloğu bölümleri" className="flex gap-2">
        {tabs.map((tab) => {
          const aktif = sekme === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={aktif}
              onClick={() => setSekme(tab.key)}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                aktif
                  ? "border-emerald-500/60 bg-emerald-50 text-emerald-800"
                  : "border-neutral-300 text-neutral-600 hover:bg-neutral-50"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
      {sekme === "modeller" ? modeller : secenekler}
    </div>
  );
}
