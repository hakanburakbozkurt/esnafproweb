import Link from "next/link";
import type { ReactNode } from "react";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { desktopContainerClass } from "@/lib/utils/layout";

export function YonetimDarkShell({
  children,
  backHref = "/yonetim",
  backLabel = "Yönetim",
}: {
  children: ReactNode;
  backHref?: string;
  backLabel?: string;
}) {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <header className="sticky top-0 z-50 border-b border-zinc-800 bg-zinc-950/90 backdrop-blur-md">
        <nav
          className={`${desktopContainerClass} flex h-16 items-center justify-between lg:h-[4.5rem]`}
        >
          <Link href="/" className="text-lg font-semibold tracking-tight">
            <span className="text-zinc-100">Esnaf</span>
            <span className="text-indigo-400">PRO</span>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href={backHref}
              className="inline-flex min-h-10 items-center rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm font-medium text-zinc-200 transition hover:border-zinc-600 hover:bg-zinc-800"
            >
              {backLabel}
            </Link>
            <SignOutButton className="rounded-lg border-zinc-700 bg-zinc-900 text-zinc-200 hover:border-zinc-600 hover:bg-zinc-800 hover:text-zinc-100" />
          </div>
        </nav>
      </header>

      <main className="py-8 lg:py-10">
        <div className={desktopContainerClass}>{children}</div>
      </main>
    </div>
  );
}
