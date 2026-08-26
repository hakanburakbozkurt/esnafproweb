"use client";

import Link from "next/link";
import { EsnafKocuCoach } from "@/components/yonetim/esnaf-kocu-coach";
import { ProfileHealthBreakdownTable } from "@/components/yonetim/profile-health-breakdown-table";
import { SeoGeoScoreCard } from "@/components/yonetim/seo-geo-score-card";
import { ProfileHealthScore } from "@/components/dukkan/profile-health-score";
import type { ProfileHealthInput } from "@/lib/dukkan/profile-health-score";
import type { SeoGeoScoreInput } from "@/lib/dukkan/seo-geo-score";
import { VitrinDotGrid } from "@/components/dukkan/vitrin/vitrin-open-section";

const quickLinkClass =
  "inline-flex min-h-11 items-center rounded-full border border-slate-200/80 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-emerald-300 hover:text-emerald-600";

export function YonetimDashboardClient({
  shopName,
  shopSlug,
  blogPostCount,
  healthInput,
  seoInput,
}: {
  shopName: string;
  shopSlug: string;
  blogPostCount: number;
  healthInput: ProfileHealthInput;
  seoInput: SeoGeoScoreInput;
}) {
  return (
    <div className="relative mx-auto w-full min-w-0 max-w-5xl space-y-8 px-1 sm:px-0">
      <VitrinDotGrid />

      <EsnafKocuCoach healthInput={healthInput} seoInput={seoInput} />

      <div className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,18rem)_1fr] lg:items-start">
        <div className="min-w-0 space-y-4 lg:sticky lg:top-24">
          <ProfileHealthScore input={healthInput} />
          <SeoGeoScoreCard input={seoInput} />
        </div>
        <ProfileHealthBreakdownTable input={healthInput} />
      </div>

      <div className="flex flex-wrap gap-3 border-t border-slate-200/60 pt-8">
        <Link href={`/${shopSlug}`} className={quickLinkClass}>
          Vitrini Görüntüle
        </Link>
        <Link href="/dukkan-ayarlari" className={quickLinkClass}>
          Mağaza Ayarları
        </Link>
        <Link href="/yonetim/blog" className={quickLinkClass}>
          Blog Yönetimi
        </Link>
        <Link href="/yonetim/blog/yeni" className={quickLinkClass}>
          Blog Yazısı Ekle
        </Link>
        <Link href="/yonetim/katalog" className={quickLinkClass}>
          Katalog Yönetimi
        </Link>
      </div>

      <p className="text-center text-xs text-slate-400">
        {shopName} · Yönetim paneli
      </p>
    </div>
  );
}
