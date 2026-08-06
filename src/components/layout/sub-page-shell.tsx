import type { ReactNode } from "react";
import { SubPageHeader } from "@/components/layout/sub-page-header";
import {
  centeredPageContentClass,
  desktopContainerClass,
  type SubPageContentWidth,
} from "@/lib/utils/layout";
import { cn } from "@/lib/utils/cn";

export function SubPageShell({
  children,
  title,
  description,
  contentWidth,
  centerHeader = false,
}: {
  children: ReactNode;
  title?: ReactNode;
  description?: string;
  /** Dar sayfalarda başlık + içeriği ortalanmış tek kolonda toplar */
  contentWidth?: SubPageContentWidth;
  centerHeader?: boolean;
}) {
  const centeredContentClass = contentWidth
    ? centeredPageContentClass(contentWidth)
    : null;

  const header = title ? (
    <div
      className={cn(
        "mb-10 lg:mb-12",
        !centeredContentClass && "max-w-3xl",
        centerHeader && "text-center"
      )}
    >
      <h1 className="text-3xl font-bold tracking-tight text-slate-900 lg:text-4xl xl:text-5xl">
        {title}
      </h1>
      {description && (
        <p
          className={cn(
            "mt-4 text-base leading-relaxed text-slate-500 lg:text-lg",
            centerHeader && "mx-auto max-w-xl"
          )}
        >
          {description}
        </p>
      )}
    </div>
  ) : null;

  return (
    <div className="relative min-h-screen bg-[radial-gradient(circle_at_top,_#ecfdf5_0%,_#f8fafc_38%,_#ffffff_100%)] text-slate-900">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      >
        <div className="absolute -right-32 top-0 h-96 w-96 rounded-full bg-emerald-100/40 blur-3xl" />
        <div className="absolute -left-24 bottom-0 h-80 w-80 rounded-full bg-teal-50/60 blur-3xl" />
      </div>
      <SubPageHeader />

      <main className="min-w-0 overflow-x-clip py-10 lg:py-16">
        <div className={cn(desktopContainerClass, "min-w-0")}>
          {centeredContentClass ? (
            <div className={centeredContentClass}>
              {header}
              {children}
            </div>
          ) : (
            <>
              {header}
              {children}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
