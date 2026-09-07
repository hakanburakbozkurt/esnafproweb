import { getVisibleFaqItems } from "@/lib/dukkan/faq";
import type { FaqItem } from "@/types/database.types";

/** Mağaza vitrinindeki SSS JSON alanları — skor hesabı için kaynak */
export type DukkanFaqScoreSource = {
  anasayfa_sss?: FaqItem[] | null;
  sss?: FaqItem[] | null;
  hakkimizda_sss?: FaqItem[] | null;
  teknik_servis_sss?: FaqItem[] | null;
};

/** Tüm vitrin SSS havuzlarındaki dolu soru sayısı (maks. skor için 15 ile sınırlanır) */
export function countDukkanFaqQuestions(source: DukkanFaqScoreSource): number {
  const pools = [
    source.anasayfa_sss,
    source.sss,
    source.hakkimizda_sss,
    source.teknik_servis_sss,
  ];

  return pools.reduce(
    (sum, pool) => sum + getVisibleFaqItems(pool).length,
    0
  );
}
