import { ArrowRight, MapPinned } from "lucide-react";
import Link from "next/link";

/**
 * Harita Pazarı artık üst menüde değil; bir bölüm değil rapor olduğu için
 * panelde kart olarak durur. Rapor Google Places çağrısı gerektirdiğinden
 * burada canlı sıra gösterilmez — kart yalnızca girişi taşır.
 */
export function HaritaPazariOzetKarti() {
  return (
    <section
      aria-labelledby="harita-pazari-baslik"
      className="rounded-3xl border border-emerald-100 bg-gradient-to-br from-emerald-50/80 to-white p-4 shadow-sm sm:p-5"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
            <MapPinned className="size-5" aria-hidden />
          </span>
          <div className="min-w-0">
            <h2 id="harita-pazari-baslik" className="text-base font-bold text-slate-900">
              Harita Pazarı
            </h2>
            <p className="mt-1 max-w-2xl text-sm leading-relaxed text-slate-600">
              Google Haritalar&apos;da çevrendeki telefoncular arasında kaçıncı
              sıradasın? Raporu açtığında sıranı, yakındaki rakipleri ve
              sıralamanı yükseltecek adımları görürsün.
            </p>
          </div>
        </div>

        <Link
          href="/yonetim/harita-pazari"
          className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full bg-emerald-600 px-5 text-sm font-semibold text-white shadow-sm shadow-emerald-600/20 transition hover:bg-emerald-700"
        >
          Raporu aç
          <ArrowRight className="size-4" aria-hidden />
        </Link>
      </div>
    </section>
  );
}
