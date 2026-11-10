"use client";

import { Check, CircleAlert, LoaderCircle, Search, TriangleAlert } from "lucide-react";
import { useActionState, useRef, useState } from "react";
import {
  googlePlaceAra,
  googlePlaceKaydet,
  type GooglePlaceAramaState,
  type GooglePlaceKaydetState,
} from "@/lib/dukkan/google-place-actions";
import { cn } from "@/lib/utils/cn";

function SonucKarti({
  placeId,
  ad,
  onSave,
}: {
  placeId: string;
  ad: string;
  onSave: () => void;
}) {
  const [saveState, saveAction, savePending] = useActionState<GooglePlaceKaydetState, FormData>(
    googlePlaceKaydet,
    {}
  );

  if (saveState.success) {
    return (
      <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
        <Check className="mt-0.5 size-5 shrink-0 text-emerald-600" aria-hidden />
        <div>
          <p className="font-semibold">{saveState.success}</p>
          <p className="mt-0.5 text-xs text-emerald-700 font-mono">{placeId}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4 space-y-3">
      <p className="text-sm font-semibold text-slate-900">Bulunan işletme</p>
      <div className="flex items-center gap-3">
        <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
          <Check className="size-5" aria-hidden />
        </span>
        <div className="min-w-0">
          <p className="font-semibold text-slate-900 truncate">{ad}</p>
          <p className="text-xs text-slate-500 font-mono break-all">{placeId}</p>
        </div>
      </div>

      <form action={saveAction} onSubmit={onSave}>
        <input type="hidden" name="place_id" value={placeId} />
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={savePending}
            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-emerald-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-60"
          >
            {savePending ? (
              <LoaderCircle className="size-4 animate-spin motion-reduce:animate-none" aria-hidden />
            ) : (
              <Check className="size-4" aria-hidden />
            )}
            {savePending ? "Kaydediliyor…" : "Bu işletmeyi kaydet"}
          </button>
          {saveState.error && (
            <p role="alert" className="text-sm text-red-600">{saveState.error}</p>
          )}
        </div>
      </form>
    </div>
  );
}

export function GooglePlaceClient({
  dukkanAdi,
  mevcutPlaceId,
}: {
  dukkanAdi: string;
  mevcutPlaceId: string | null;
}) {
  const [aramaState, aramaAction, aramaPending] = useActionState<GooglePlaceAramaState, FormData>(
    googlePlaceAra,
    {}
  );
  const [kaydedildi, setKaydedildi] = useState(false);
  const aramaFormRef = useRef<HTMLFormElement>(null);

  const bulunanId = aramaState.foundId;
  const bulunanAd = aramaState.foundAd ?? "";

  return (
    <div className="space-y-8">
      {/* Mevcut kayıt */}
      {mevcutPlaceId && !kaydedildi && (
        <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm">
          <Check className="mt-0.5 size-5 shrink-0 text-emerald-600" aria-hidden />
          <div>
            <p className="font-semibold text-slate-900">Google Place ID kayıtlı</p>
            <p className="mt-0.5 font-mono text-xs text-slate-600 break-all">{mevcutPlaceId}</p>
            <p className="mt-1 text-slate-500">Yeni bir arama yaparak güncelleyebilirsiniz.</p>
          </div>
        </div>
      )}

      {/* Arama formu */}
      <form ref={aramaFormRef} action={aramaAction} className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label htmlFor="arama-adi" className="block text-sm font-semibold text-slate-700">
              Mağaza adı
            </label>
            <input
              id="arama-adi"
              name="arama_adi"
              type="text"
              defaultValue={dukkanAdi}
              placeholder={dukkanAdi}
              className="min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400"
            />
            <p className="text-xs text-slate-500">Google&apos;daki işletme adınızla aynı olmalı.</p>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="sehir" className="block text-sm font-semibold text-slate-700">
              Şehir / İlçe
            </label>
            <input
              id="sehir"
              name="sehir"
              type="text"
              placeholder="ör. Kadıköy, İstanbul"
              className="min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400"
            />
            <p className="text-xs text-slate-500">Aramanın isabetini artırır.</p>
          </div>
        </div>

        <button
          type="submit"
          disabled={aramaPending}
          className="inline-flex min-h-11 items-center gap-2 rounded-full bg-slate-900 px-5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
        >
          {aramaPending ? (
            <LoaderCircle className="size-4 animate-spin motion-reduce:animate-none" aria-hidden />
          ) : (
            <Search className="size-4" aria-hidden />
          )}
          {aramaPending ? "Aranıyor…" : "Google'da Ara"}
        </button>
      </form>

      {/* Arama geri bildirimi */}
      {aramaState.error && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
        >
          <CircleAlert className="mt-0.5 size-5 shrink-0" aria-hidden />
          <p>{aramaState.error}</p>
        </div>
      )}

      {aramaState.success && bulunanId && (
        <div className="space-y-2">
          {aramaState.success.includes("Siz değilseniz") && (
            <div className="flex items-start gap-2 rounded-xl bg-amber-50 border border-amber-200 px-3 py-2.5 text-xs text-amber-900">
              <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
              <p>
                Ad veya konum farklıysa &ldquo;Mağaza adı&rdquo; alanını Google&apos;daki işletme
                adıyla birebir aynı yazın ve tekrar arayın.
              </p>
            </div>
          )}
          <SonucKarti
            placeId={bulunanId}
            ad={bulunanAd}
            onSave={() => setKaydedildi(true)}
          />
        </div>
      )}

      {/* Nasıl çalışır */}
      <div className="rounded-2xl border border-slate-200/80 bg-slate-50/60 p-5 space-y-2">
        <p className="text-sm font-semibold text-slate-700">Google Place ID nedir?</p>
        <ul className="space-y-1.5 text-sm text-slate-600">
          <li className={cn("flex items-start gap-2")}>
            <span className="mt-1 size-1.5 shrink-0 rounded-full bg-slate-400" aria-hidden />
            Google&apos;ın her işletmeye verdiği benzersiz kimlik numarasıdır.
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1 size-1.5 shrink-0 rounded-full bg-slate-400" aria-hidden />
            Harita Pazarı bu kimliği kullanarak sizi rakipler arasında doğru şekilde tanır.
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1 size-1.5 shrink-0 rounded-full bg-slate-400" aria-hidden />
            Kayıt yaptıktan sonra Harita Pazarı&apos;nda sıra takibiniz daha isabetli olur.
          </li>
        </ul>
      </div>
    </div>
  );
}
