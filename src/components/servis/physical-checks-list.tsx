import { Check, Minus } from "lucide-react";
import type { PhysicalCheckItem } from "@/lib/servis/service-approval";
import { cn } from "@/lib/utils/cn";

export function PhysicalChecksList({ items }: { items: PhysicalCheckItem[] }) {
  if (items.length === 0) return null;

  return (
    <ul className="space-y-2">
      {items.map((item) => {
        const passed = !item.issueDetected;

        return (
          <li
            key={item.key}
            className={cn(
              "flex items-center justify-between gap-3 rounded-xl border px-3.5 py-2.5",
              passed
                ? "border-emerald-100 bg-emerald-50/60"
                : "border-amber-100 bg-amber-50/50"
            )}
          >
            <span className="text-sm font-bold text-gray-900">{item.label}</span>
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold",
                passed
                  ? "bg-white text-emerald-700 ring-1 ring-emerald-200"
                  : "bg-white text-amber-800 ring-1 ring-amber-200"
              )}
            >
              {passed ? (
                <>
                  <Check className="size-3.5 stroke-[2.5]" aria-hidden />
                  Sorun yok
                </>
              ) : (
                <>
                  <Minus className="size-3.5 stroke-[2.5]" aria-hidden />
                  Tespit edildi
                </>
              )}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
