"use client";

import Link from "next/link";
import {
  buildEsnafKocuTips,
  calculateProfileHealthScore,
  type ProfileHealthInput,
} from "@/lib/dukkan/profile-health-score";
import {
  yonetimCoachPanelClass,
  yonetimPanelAccentLabelClass,
  yonetimPanelCtaClass,
  yonetimPanelPaddingClass,
} from "@/lib/yonetim/gradient-panel";

export function EsnafKocuCoach({
  healthInput,
}: {
  healthInput: ProfileHealthInput;
}) {
  const result = calculateProfileHealthScore(healthInput);
  const tips = buildEsnafKocuTips(result);

  if (!tips.length) return null;

  const primary = tips[0];
  const secondary = tips[1];

  return (
    <div className={yonetimCoachPanelClass}>
      <div className={yonetimPanelPaddingClass}>
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0 flex-1">
            <p className={yonetimPanelAccentLabelClass}>Esnaf Koçu</p>
            <p className="mt-2 text-base leading-relaxed text-slate-700 sm:text-lg">
              <span className="font-semibold text-slate-900">Esnaf Koçu:</span> {primary.message}
            </p>
            {secondary && (
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{secondary.message}</p>
            )}
            <p className="mt-3 text-xs font-medium text-emerald-700/80">
              Profil & SEO Skoru: {result.score}/100
            </p>
          </div>

          {primary.href && primary.cta && (
            <Link href={primary.href} className={yonetimPanelCtaClass}>
              {primary.cta}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
