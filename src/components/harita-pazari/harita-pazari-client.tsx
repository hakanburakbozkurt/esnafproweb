"use client";

import { CircleAlert, Crown, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useState, useTransition } from "react";
import {
  HaftalikRaporAyarlari,
  type HaftalikRaporAyarlariDegerleri,
} from "@/components/harita-pazari/haftalik-rapor-ayarlari";
import { RakipKarsilastirma } from "@/components/harita-pazari/rakip-karsilastirma";
import { SeoEntegrasyonu } from "@/components/harita-pazari/seo-entegrasyonu";
import { YakinDukkanlarListesi } from "@/components/harita-pazari/yakin-dukkanlar-listesi";
import type { ProfileHealthInput } from "@/lib/dukkan/profile-health-score";
import { haritaPazariRaporuGetir, type HaritaPazariSonuc } from "@/lib/harita-pazari/actions";
import { karsilastirmaEtiketi } from "@/lib/harita-pazari/format";
import {
  SHOP_SUBSCRIPTION_TIER_LABELS,
  type ShopSubscriptionTier,
} from "@/lib/local-yonetim/subscriptions/types";
import { cn } from "@/lib/utils/cn";

/** Google Places çağrıları ücretli; elle yenileme arasında bekleme süresi */
const YENILEME_BEKLEMESI_MS = 60_000;

export function HaritaPazariSkeleton() {
  return (
    <div className="space-y-3" aria-hidden>
      {Array.from({ length: 4 }, (_, i) => (
        <div key={i} className="h-28 animate-pulse rounded-2xl bg-slate-100 motion-reduce:animate-none" />
      ))}
    </div>
  );
}

export function HaritaPazariClient({
  tier,
  email,
  healthInput,
  raporAyarlari,
}: {
  tier: ShopSubscriptionTier;
  email: string | null;
  healthInput: ProfileHealthInput;
  raporAyarlari: HaftalikRaporAyarlariDegerleri;
}) {
  const [sonuc, setSonuc] = useState<HaritaPazariSonuc | null>(null);
  const [beklemede, setBeklemede] = useState(false);
  const [pending, startTransition] = useTransition();

  const yukle = useCallback(() => {
    startTransition(async () => {
      const next = await haritaPazariRaporuGetir();
      setSonuc(next);
      setBeklemede(true);
      window.setTimeout(() => setBeklemede(false), YENILEME_BEKLEMESI_MS);
    });
  }, []);

  useEffect(() => {
    yukle();
  }, [yukle]);

  const rapor = sonuc?.ok ? sonuc.rapor : null;

  return (
    <div className="mx-auto w-full min-w-0 max-w-5xl space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-emerald-700 ring-1 ring-emerald-600/15">
          <Crown className="size-3.5" aria-hidden />
          {SHOP_SUBSCRIPTION_TIER_LABELS[tier]} plan
        </span>
        <div className="flex items-center gap-3">
          {sonuc?.ok && (
            <p className="text-xs text-slate-500">
              Son güncelleme:{" "}
              {new Intl.DateTimeFormat("tr-TR", { timeStyle: "short" }).format(new Date(sonuc.olusturulma))}
            </p>
          )}
          <button
            type="button"
            onClick={yukle}
            disabled={pending || beklemede}
            title={beklemede ? "Yeniden yenilemek için bir dakika bekleyin" : undefined}
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:border-emerald-200 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw className={cn("size-4", pending && "animate-spin motion-reduce:animate-none")} aria-hidden />
            {pending ? "Güncelleniyor…" : "Yenile"}
          </button>
        </div>
      </div>

      <div aria-live="polite" aria-busy={pending}>
        {!sonuc ? (
          <HaritaPazariSkeleton />
        ) : !sonuc.ok ? (
          <div role="alert" className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            <CircleAlert className="mt-0.5 size-5 shrink-0" aria-hidden />
            <p>{sonuc.error}</p>
          </div>
        ) : (
          <div className={cn("space-y-10 transition-opacity", pending && "opacity-60")}>
            {sonuc.uyari && (
              <p role="status" className="rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-900">
                {sonuc.uyari}
              </p>
            )}
            <YakinDukkanlarListesi
              kendi={sonuc.rapor.kendi}
              rakipler={sonuc.rapor.rakipler}
              toplamSonuc={sonuc.rapor.toplamSonuc}
              karsilastirma={karsilastirmaEtiketi(sonuc.rapor.karsilastirmaTarihi)}
            />
            <RakipKarsilastirma rapor={sonuc.rapor} />
          </div>
        )}
      </div>

      <HaftalikRaporAyarlari email={email} initial={raporAyarlari} />
      <SeoEntegrasyonu healthInput={healthInput} yorumHedefi={rapor?.yorumHedefi ?? null} />
    </div>
  );
}
