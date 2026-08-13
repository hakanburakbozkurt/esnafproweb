import Link from "next/link";
import { getFooterStores } from "@/lib/dukkan/get-public-stores";
import { CORPORATE_FOOTER_LINKS } from "@/lib/site/corporate-links";

export async function LandingFooter() {
  const year = new Date().getFullYear();
  const { stores, hasMore } = await getFooterStores();

  return (
    <footer className="border-t border-slate-100 bg-white px-4 py-12 sm:px-6 md:py-16">
      <div className="mx-auto grid w-full min-w-0 max-w-6xl gap-10 md:grid-cols-2 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-4">
          <p className="text-lg font-bold text-slate-900">
            Esnaf<span className="text-emerald-600">PRO</span>
          </p>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-slate-500">
            Esnaf ve küçük işletmeler için dijital vitrin, stok, kasa ve teknik
            servis yönetimi.
          </p>
        </div>

        <nav
          className="lg:col-span-3"
          aria-label="Kurumsal sayfalar"
        >
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-600">
            Kurumsal
          </h2>
          <ul className="mt-4 space-y-2.5">
            {CORPORATE_FOOTER_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm text-slate-600 transition hover:text-emerald-700"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav
          className="lg:col-span-5"
          aria-label="Esnaf vitrini"
        >
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-600">
            Esnaf Vitrini
          </h2>
          {stores.length ? (
            <>
              <ul className="mt-4 columns-1 gap-x-6 sm:columns-2">
                {stores.map((store) => (
                  <li key={store.id} className="mb-2.5 break-inside-avoid">
                    <Link
                      href={`/${store.slug}`}
                      className="text-sm text-slate-600 transition hover:text-emerald-700"
                    >
                      {store.dukkan_adi}
                    </Link>
                  </li>
                ))}
              </ul>
              {hasMore && (
                <p className="mt-4 text-right">
                  <Link
                    href="/esnaflar"
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700 transition hover:text-emerald-800"
                  >
                    Hepsini Gör
                    <span aria-hidden>→</span>
                  </Link>
                </p>
              )}
            </>
          ) : (
            <p className="mt-4 text-sm text-slate-500">
              Henüz listelenecek aktif dükkan yok.
            </p>
          )}
        </nav>
      </div>

      <div className="mx-auto mt-10 flex w-full min-w-0 max-w-6xl flex-col items-center justify-between gap-3 border-t border-slate-100 pt-6 sm:flex-row">
        <p className="text-sm text-slate-400">
          © <span suppressHydrationWarning>{year}</span> EsnafPRO. Tüm hakları
          saklıdır.
        </p>
      </div>
    </footer>
  );
}
