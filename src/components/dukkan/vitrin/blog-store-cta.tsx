import Link from "next/link";

export function BlogStoreCta({
  shopName,
  shopSlug,
  showPazaryeri = false,
  showKatalog = false,
}: {
  shopName: string;
  shopSlug: string;
  showPazaryeri?: boolean;
  showKatalog?: boolean;
}) {
  return (
    <section className="mt-10 overflow-hidden rounded-3xl border border-emerald-200/80 bg-gradient-to-br from-emerald-50 via-white to-teal-50/60 p-6 shadow-sm sm:p-8">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-600">
        {shopName}
      </p>
      <h2 className="mt-2 text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
        Mağazamızı ziyaret edin
      </h2>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">
        Bu yazıda bahsettiğimiz ürün ve hizmetleri vitrinimizde inceleyebilir, iletişime
        geçebilir veya pazaryeri ilanlarımıza göz atabilirsiniz.
      </p>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href={`/${shopSlug}`}
          className="inline-flex min-h-11 items-center justify-center rounded-full bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-500 px-6 text-sm font-bold text-white shadow-lg shadow-emerald-500/20 transition hover:shadow-emerald-500/30"
        >
          Mağazamızı Ziyaret Edin
        </Link>
        {showPazaryeri && (
          <Link
            href={`/${shopSlug}/pazaryeri`}
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-emerald-200 bg-white px-6 text-sm font-semibold text-emerald-700 transition hover:border-emerald-300 hover:bg-emerald-50"
          >
            Ürünleri İnceleyin
          </Link>
        )}
        {showKatalog && (
          <Link
            href={`/${shopSlug}/katalog`}
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-slate-200 bg-white px-6 text-sm font-semibold text-slate-700 transition hover:border-emerald-300 hover:text-emerald-700"
          >
            Kataloğu Görüntüle
          </Link>
        )}
      </div>
    </section>
  );
}
