/**
 * @deprecated Tek skor motoru `profile-health-score.ts` içindedir.
 * Geriye dönük import uyumluluğu için ince sarmalayıcı.
 */
import {
  buildEsnafKocuTips as buildProfileEsnafKocuTips,
  calculateProfileHealthScore,
  type EsnafKocuTip,
  type ProfileHealthInput,
  type ProfileHealthResult,
} from "@/lib/dukkan/profile-health-score";

export type SeoGeoScoreInput = ProfileHealthInput;
export type SeoGeoBreakdownItem = ProfileHealthResult["breakdown"][number];
export type SeoGeoScoreResult = Pick<ProfileHealthResult, "score" | "breakdown">;

export function calculateSeoGeoScore(input: SeoGeoScoreInput): SeoGeoScoreResult {
  const { score, breakdown } = calculateProfileHealthScore(input);
  return { score, breakdown };
}

export function buildEsnafKocuTips(
  seo: SeoGeoScoreResult,
  profileScore: number
): EsnafKocuTip[] {
  return buildProfileEsnafKocuTips({
    score: profileScore,
    breakdown: seo.breakdown,
    message: "",
  });
}

export type { EsnafKocuTip };
