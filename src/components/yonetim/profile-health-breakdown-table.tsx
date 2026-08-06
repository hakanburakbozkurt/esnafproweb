"use client";

import {
  calculateProfileHealthScore,
  type ProfileHealthInput,
} from "@/lib/dukkan/profile-health-score";
import {
  scoreBarFillClass,
  scoreBarTrackClass,
  yonetimBreakdownRowClass,
  yonetimPanelAccentLabelClass,
  yonetimPanelClass,
  yonetimPanelPaddingClass,
  yonetimPanelScoreClass,
  yonetimPanelTitleClass,
} from "@/lib/yonetim/gradient-panel";

export function ProfileHealthBreakdownTable({
  input,
}: {
  input: ProfileHealthInput;
}) {
  const { score, breakdown } = calculateProfileHealthScore(input);

  return (
    <div className={yonetimPanelClass}>
      <div className={yonetimPanelPaddingClass}>
        <p className={yonetimPanelAccentLabelClass}>Profil Skor Tablosu</p>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
          <h2 className={yonetimPanelTitleClass}>Vitrin gücü detayı</h2>
          <p className={yonetimPanelScoreClass}>
            {score}
            <span className="text-lg font-semibold text-slate-400">/100</span>
          </p>
        </div>

        <ul className="mt-6 space-y-3">
          {breakdown.map((item) => {
            const pct = item.max > 0 ? (item.points / item.max) * 100 : 0;

            return (
              <li key={item.label} className={yonetimBreakdownRowClass}>
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="font-medium text-slate-800">{item.label}</span>
                  <span className="shrink-0 tabular-nums text-xs font-semibold text-emerald-700">
                    {item.points}/{item.max}
                  </span>
                </div>
                <div className={scoreBarTrackClass()}>
                  <div
                    className={scoreBarFillClass(item.filled)}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
