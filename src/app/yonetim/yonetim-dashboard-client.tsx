"use client";

import { AnimatePresence } from "framer-motion";
import { useState } from "react";
import { EsnafKocuCoach } from "@/components/yonetim/esnaf-kocu-coach";
import { ProfileHealthSheet } from "@/components/yonetim/profile-health-sheet";
import { YonetimHubGrid } from "@/components/yonetim/yonetim-hub-grid";
import { YonetimQuickActions } from "@/components/yonetim/yonetim-quick-actions";
import { ProfileHealthScore } from "@/components/dukkan/profile-health-score";
import type { ProfileHealthInput } from "@/lib/dukkan/profile-health-score";
import { VitrinDotGrid } from "@/components/dukkan/vitrin/vitrin-open-section";

export function YonetimDashboardClient({
  shopSlug,
  shopName,
  healthInput,
}: {
  shopSlug: string;
  shopName: string;
  healthInput: ProfileHealthInput;
}) {
  const [scoreSheetOpen, setScoreSheetOpen] = useState(false);

  return (
    <div className="relative mx-auto w-full min-w-0 max-w-5xl space-y-8 px-1 sm:px-0">
      <VitrinDotGrid />

      <YonetimQuickActions shopSlug={shopSlug} shopName={shopName} />

      <div className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,20rem)_1fr] lg:items-start">
        <ProfileHealthScore
          input={healthInput}
          onOpenDetails={() => setScoreSheetOpen(true)}
        />
        <EsnafKocuCoach healthInput={healthInput} />
      </div>

      <YonetimHubGrid shopSlug={shopSlug} />

      <AnimatePresence>
        {scoreSheetOpen && (
          <ProfileHealthSheet input={healthInput} onClose={() => setScoreSheetOpen(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}
