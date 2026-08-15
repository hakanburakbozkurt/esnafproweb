"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils/cn";
import type { KatalogTreeBrand, KatalogSelection } from "@/lib/katalog/katalog-tree";

export function KatalogBrandModelTree({
  tree,
  selection,
  onSelect,
  className,
}: {
  tree: KatalogTreeBrand[];
  selection: KatalogSelection | null;
  onSelect: (selection: KatalogSelection) => void;
  className?: string;
}) {
  const [openBrand, setOpenBrand] = useState<string | null>(
    selection?.brand ?? tree[0]?.brand ?? null
  );

  const activeBrand = selection?.brand ?? null;
  const activeModel = selection?.modelName ?? null;

  const treeWithSelection = useMemo(() => tree, [tree]);

  if (!treeWithSelection.length) {
    return (
      <div
        className={cn(
          "rounded-2xl border border-dashed border-slate-200 bg-white/80 p-5 text-sm text-slate-500",
          className
        )}
      >
        Henüz katalogda ürün yok.
      </div>
    );
  }

  return (
    <nav
      aria-label="Katalog marka ve model ağacı"
      className={cn(
        "overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm",
        className
      )}
    >
      <div className="border-b border-slate-100 px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Marka & Model
        </p>
      </div>

      <ul className="max-h-[min(70vh,720px)] overflow-y-auto">
        {treeWithSelection.map((brandNode) => {
          const isBrandOpen = openBrand === brandNode.brand;

          return (
            <li key={brandNode.brand} className="border-b border-slate-100 last:border-b-0">
              <button
                type="button"
                onClick={() =>
                  setOpenBrand((current) =>
                    current === brandNode.brand ? null : brandNode.brand
                  )
                }
                aria-expanded={isBrandOpen}
                className="flex min-h-12 w-full items-center justify-between gap-3 px-4 py-3 text-left transition hover:bg-slate-50"
              >
                <span className="min-w-0 truncate text-sm font-semibold text-slate-900">
                  {brandNode.brand}
                </span>
                <span className="flex shrink-0 items-center gap-2">
                  <CountBadge
                    count={brandNode.availableCount}
                    total={brandNode.totalCount}
                  />
                  <Chevron open={isBrandOpen} />
                </span>
              </button>

              <div
                className={cn(
                  "grid transition-[grid-template-rows] duration-200 ease-out",
                  isBrandOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                )}
              >
                <ul className="overflow-hidden bg-slate-50/70">
                  {brandNode.models.map((modelNode) => {
                    const isActive =
                      activeBrand === brandNode.brand &&
                      activeModel === modelNode.modelName;

                    return (
                      <li key={`${brandNode.brand}-${modelNode.modelName}`}>
                        <button
                          type="button"
                          onClick={() =>
                            onSelect({
                              brand: brandNode.brand,
                              modelName: modelNode.modelName,
                            })
                          }
                          aria-current={isActive ? "true" : undefined}
                          className={cn(
                            "flex min-h-11 w-full items-center justify-between gap-3 border-t border-slate-100/80 py-2.5 pl-8 pr-4 text-left text-sm transition",
                            isActive
                              ? "bg-emerald-50 font-semibold text-emerald-800"
                              : "text-slate-700 hover:bg-white"
                          )}
                        >
                          <span className="min-w-0 truncate">{modelNode.modelName}</span>
                          <CountBadge
                            count={modelNode.availableCount}
                            total={modelNode.totalCount}
                          />
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function CountBadge({
  count,
  total,
}: {
  count: number;
  total: number;
}) {
  return (
    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
      {count}
      {total !== count ? ` / ${total}` : ""}
    </span>
  );
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      className={cn("size-4 text-slate-400 transition", open && "rotate-180")}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );
}
