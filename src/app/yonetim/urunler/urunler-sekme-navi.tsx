import Link from "next/link";
import {
  URUNLER_TABS,
  urunlerTabHref,
  type UrunlerTabId,
} from "@/lib/yonetim/nav";
import { cn } from "@/lib/utils/cn";

/**
 * Ürünler sayfasının sekmeleri. Durum URL'de tutulur (`?sekme=`), böylece
 * sekme paylaşılabilir, yer imine eklenebilir ve geri tuşu çalışır.
 */
export function UrunlerSekmeNavi({ activeTab }: { activeTab: UrunlerTabId }) {
  return (
    <nav aria-label="Ürün bölümleri" className="border-b border-slate-200/80">
      <ul className="flex min-w-max gap-1 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {URUNLER_TABS.map((tab) => {
          const active = tab.id === activeTab;

          return (
            <li key={tab.id}>
              <Link
                href={urunlerTabHref(tab.id)}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "-mb-px inline-flex min-h-11 items-center whitespace-nowrap border-b-[3px] px-4 text-sm transition sm:px-5",
                  active
                    ? "border-emerald-700 font-bold text-emerald-700"
                    : "border-transparent font-medium text-slate-600 hover:text-slate-900"
                )}
              >
                {tab.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
