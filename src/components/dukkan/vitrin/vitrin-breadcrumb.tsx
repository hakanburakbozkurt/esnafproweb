import Link from "next/link";
import { ChevronRight } from "lucide-react";

export type VitrinBreadcrumbItem = { ad: string; href?: string };

/** Görünür kırıntı yolu; son öğe geçerli sayfadır (bağlantısız). JSON-LD ayrıca basılır. */
export function VitrinBreadcrumb({ items }: { items: VitrinBreadcrumbItem[] }) {
  return (
    <nav aria-label="Sayfa konumu" className="text-sm text-slate-500">
      <ol className="flex flex-wrap items-center gap-x-1 gap-y-1">
        {items.map((item, index) => {
          const son = index === items.length - 1;
          return (
            <li key={`${item.ad}-${index}`} className="flex min-w-0 items-center gap-1">
              {item.href && !son ? (
                <Link
                  href={item.href}
                  className="inline-flex min-h-11 items-center truncate rounded-lg px-1 font-medium text-slate-600 transition hover:text-emerald-700"
                >
                  {item.ad}
                </Link>
              ) : (
                <span aria-current={son ? "page" : undefined} className="truncate px-1 font-semibold text-slate-900">
                  {item.ad}
                </span>
              )}
              {!son && <ChevronRight className="size-4 shrink-0 text-slate-300" aria-hidden />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
