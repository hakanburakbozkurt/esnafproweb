"use client";

import { EsnafKocuCoach } from "@/components/yonetim/esnaf-kocu-coach";
import { ProfileHealthBreakdownTable } from "@/components/yonetim/profile-health-breakdown-table";
import { YonetimHubGrid } from "@/components/yonetim/yonetim-hub-grid";
import { ProfileHealthScore } from "@/components/dukkan/profile-health-score";
import type { ProfileHealthInput } from "@/lib/dukkan/profile-health-score";
import { VitrinDotGrid } from "@/components/dukkan/vitrin/vitrin-open-section";

export function YonetimDashboardClient({
  shopSlug,
  healthInput,
}: {
  shopSlug: string;
  healthInput: ProfileHealthInput;
}) {
  return (
    <div className="relative mx-auto w-full min-w-0 max-w-5xl space-y-8 px-1 sm:px-0">
      <YonetimHubGrid shopSlug={shopSlug} />

      <VitrinDotGrid />

      <EsnafKocuCoach healthInput={healthInput} />

      <div className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,18rem)_1fr] lg:items-start">
        <ProfileHealthScore input={healthInput} className="lg:sticky lg:top-36" />
        <ProfileHealthBreakdownTable input={healthInput} />
      </div>
    </div>
  );
}
