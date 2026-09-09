import { Sparkles } from "lucide-react";

export default function LocalYonetimHomePage() {
  return (
    <div className="flex min-h-[70vh] flex-col justify-center">
      <div className="max-w-2xl">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-600">
          Yerel komuta merkezi
        </p>

        <h1 className="mt-3 text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
          EsnafPro admin paneline hoş geldiniz
        </h1>

        <p className="mt-4 text-base leading-relaxed text-neutral-600">
          Bu alan yalnızca yerel geliştirme ortamında çalışır. Fiyatlandırma,
          ürün görselleri, stok ve sistem ayarlarını buradan yönetmek için
          sol menüden bir bölüm seçin.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-5">
            <div className="flex items-center gap-2 text-emerald-700">
              <Sparkles className="size-4" aria-hidden />
              <p className="text-sm font-semibold">İzole yapı</p>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-emerald-900/80">
              Canlı vitrin ve esnaf panelinden ayrı, sade bir yönetim
              deneyimi.
            </p>
          </div>

          <div className="rounded-2xl border border-neutral-100 bg-neutral-50 p-5">
            <p className="text-sm font-semibold text-neutral-800">
              Güvenli erişim
            </p>
            <p className="mt-2 text-sm leading-relaxed text-neutral-600">
              Production ortamında otomatik olarak gizlenir; yalnızca localhost
              veya dev modunda erişilebilir.
            </p>
          </div>
        </div>

        <p className="mt-8 text-sm text-neutral-400">
          Başlamak için soldan Fiyatlar, SSS veya Dükkan Onay bölümüne geçin.
        </p>
      </div>
    </div>
  );
}
