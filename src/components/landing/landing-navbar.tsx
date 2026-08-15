import Link from "next/link";

const NAV_LINK_CLASS =
  "hidden text-sm text-slate-500 transition-colors hover:text-emerald-600 sm:inline";

export function LandingNavbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/80 backdrop-blur-md">
      <nav className="mx-auto flex h-16 w-full min-w-0 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          <span className="text-slate-900">Esnaf</span>
          <span className="text-emerald-600">PRO</span>
        </Link>

        <ul className="flex shrink-0 items-center gap-3 sm:gap-8">
          <li>
            <a href="#ozellikler" className={NAV_LINK_CLASS}>
              Özellikler
            </a>
          </li>
          <li>
            <a href="#moduller" className={NAV_LINK_CLASS}>
              Modüller
            </a>
          </li>
          <li>
            <Link href="/pazaryeri" className={NAV_LINK_CLASS}>
              Pazaryeri
            </Link>
          </li>
          <li>
            <Link href="/fiyatlandirma" className={NAV_LINK_CLASS}>
              Fiyatlandırma
            </Link>
          </li>
          <li>
            <Link href="/tamir-fiyati" className={NAV_LINK_CLASS}>
              Tamir Fiyatı Al
            </Link>
          </li>
          <li>
            <Link
              href="/giris"
              className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800"
            >
              Giriş Yap
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}
