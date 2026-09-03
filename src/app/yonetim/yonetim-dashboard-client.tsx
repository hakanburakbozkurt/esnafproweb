"use client";

import { EsnafKocuCoach } from "@/components/yonetim/esnaf-kocu-coach";
import { ProfileHealthBreakdownTable } from "@/components/yonetim/profile-health-breakdown-table";
import { SeoGeoScoreCard } from "@/components/yonetim/seo-geo-score-card";
import { YonetimHubGrid } from "@/components/yonetim/yonetim-hub-grid";
import { ProfileHealthScore } from "@/components/dukkan/profile-health-score";
import type { ProfileHealthInput } from "@/lib/dukkan/profile-health-score";
import type { SeoGeoScoreInput } from "@/lib/dukkan/seo-geo-score";
import { VitrinDotGrid } from "@/components/dukkan/vitrin/vitrin-open-section";

export function YonetimDashboardClient({
  shopSlug,
  healthInput,
  seoInput,
}: {
  shopSlug: string;
  healthInput: ProfileHealthInput;
  seoInput: SeoGeoScoreInput;
}) {
  return (
    <div className="relative mx-auto w-full min-w-0 max-w-5xl space-y-8 px-1 sm:px-0">
      <YonetimHubGrid shopSlug={shopSlug} />

      <VitrinDotGrid />

      <EsnafKocuCoach healthInput={healthInput} seoInput={seoInput} />

      <div className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,18rem)_1fr] lg:items-start">
        <div className="min-w-0 space-y-4 lg:sticky lg:top-36">
          <ProfileHealthScore input={healthInput} />
          <SeoGeoScoreCard input={seoInput} />
        </div>
        <ProfileHealthBreakdownTable input={healthInput} />
      </div>
    </div>
  );
}
