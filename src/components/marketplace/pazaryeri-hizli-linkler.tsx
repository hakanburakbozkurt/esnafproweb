import Link from "next/link";
import { cn } from "@/lib/utils/cn";
import { PAZARYERI_SAYFALARI, pazaryeriSayfasiPath } from "@/lib/marketplace/pazaryeri-sayfalari";

/**
 * Pazaryeri sayfaları arasında iç linkler (Google'ın sayfaları bulup
 * birbirine bağlaması için). Yalnızca ilanı olan sayfalar gösterilir.
 */
export function PazaryeriHizliLinkler({
  aktifSlug,
  doluSluglar,
}: {
  aktifSlug?: string;
  doluSluglar: ReadonlySet<string>;
}) {
  const sayfalar = PAZARYERI_SAYFALARI.filter((sayfa) => doluSluglar.has(sayfa.slug));
  if (!sayfalar.length) return null;

  return (
    <nav aria-label="Pazaryeri kategorileri" className="mt-6">
      <ul className="flex flex-wrap gap-2">
        <li>
          <Link
            href="/pazaryeri"
            className={cn(
              "inline-flex min-h-9 items-center rounded-full border px-3.5 text-xs font-semibold transition sm:text-sm",
              !aktifSlug
                ? "border-emerald-600 bg-emerald-600 text-white"
                : "border-slate-200 bg-white text-slate-700 hover:border-emerald-300 hover:text-emerald-700"
            )}
          >
            Tüm ilanlar
          </Link>
        </li>
        {sayfalar.map((sayfa) => {
          const aktif = sayfa.slug === aktifSlug;
          return (
            <li key={sayfa.slug}>
              <Link
                href={pazaryeriSayfasiPath(sayfa)}
                aria-current={aktif ? "page" : undefined}
                className={cn(
                  "inline-flex min-h-9 items-center rounded-full border px-3.5 text-xs font-semibold capitalize transition sm:text-sm",
                  aktif
                    ? "border-emerald-600 bg-emerald-600 text-white"
                    : "border-slate-200 bg-white text-slate-700 hover:border-emerald-300 hover:text-emerald-700"
                )}
              >
                {sayfa.kisaAd}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
