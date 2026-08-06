"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { cn } from "@/lib/utils/cn";

const menuLinkClass =
  "flex min-h-11 w-full items-center rounded-xl px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-emerald-700";

export function VitrinOwnerMenu({
  blogHref,
  isOwner,
  isBlogPage,
}: {
  blogHref: string;
  isOwner: boolean;
  isBlogPage: boolean;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function handleClickOutside(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    const isMobile = window.matchMedia("(max-width: 767px)").matches;
    if (isMobile) {
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative shrink-0">
      <button
        type="button"
        aria-label="Menü"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((current) => !current)}
        className="inline-flex size-10 items-center justify-center rounded-full border border-slate-200/80 bg-white text-slate-700 shadow-sm transition hover:border-emerald-300 hover:text-emerald-600 lg:size-11"
      >
        <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
        </svg>
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-label="Menüyü kapat"
            className="fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-[1px] md:hidden"
            onClick={() => setOpen(false)}
          />

          <div
            role="menu"
            className={cn(
              "z-50 overflow-hidden border border-slate-200/90 bg-white shadow-xl shadow-slate-900/10",
              "fixed inset-x-4 bottom-4 rounded-3xl p-3 md:absolute md:inset-x-auto md:bottom-auto md:right-0 md:top-[calc(100%+0.5rem)] md:w-56 md:rounded-2xl md:p-2"
            )}
          >
            <p className="mb-2 px-4 pt-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400 md:hidden">
              Menü
            </p>
            <Link
              href={blogHref}
              role="menuitem"
              aria-current={isBlogPage ? "page" : undefined}
              className={cn(
                menuLinkClass,
                isBlogPage && "bg-emerald-50 text-emerald-700"
              )}
              onClick={() => setOpen(false)}
            >
              Blog
            </Link>

            {isOwner && (
              <>
                <div className="my-1 border-t border-slate-100" />
                <Link href="/yonetim" role="menuitem" className={menuLinkClass} onClick={() => setOpen(false)}>
                  Yönetim
                </Link>
                <Link
                  href="/dukkan-ayarlari"
                  role="menuitem"
                  className={menuLinkClass}
                  onClick={() => setOpen(false)}
                >
                  Düzenle
                </Link>
                <Link href="/" role="menuitem" className={menuLinkClass} onClick={() => setOpen(false)}>
                  Ana Sayfa
                </Link>
                <div className="mt-1 border-t border-slate-100 pt-1">
                  <SignOutButton
                    className={cn(
                      menuLinkClass,
                      "w-full justify-start rounded-xl border-0 bg-transparent px-4 hover:border-red-100 hover:bg-red-50 hover:text-red-700"
                    )}
                  />
                </div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
