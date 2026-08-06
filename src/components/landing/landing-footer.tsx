export function LandingFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-100 px-6 py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
        <p className="text-sm text-slate-400">
          ©{" "}
          <span suppressHydrationWarning>{year}</span> EsnafPRO. Tüm hakları saklıdır.
        </p>
        <p className="text-sm font-medium text-slate-900">
          Esnaf<span className="text-emerald-600">PRO</span>
        </p>
      </div>
    </footer>
  );
}
