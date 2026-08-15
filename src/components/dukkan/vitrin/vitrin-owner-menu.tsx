"use client";

import Link from "next/link";
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type RefObject,
} from "react";
import { createPortal } from "react-dom";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { cn } from "@/lib/utils/cn";

const menuLinkClass =
  "flex min-h-11 w-full items-center rounded-xl px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-emerald-700";

function MenuLinks({
  blogHref,
  katalogHref,
  showKatalogNav,
  isOwner,
  isBlogPage,
  isKatalogPage,
  onNavigate,
}: {
  blogHref: string;
  katalogHref: string;
  showKatalogNav: boolean;
  isOwner: boolean;
  isBlogPage: boolean;
  isKatalogPage: boolean;
  onNavigate: () => void;
}) {
  return (
    <>
      {showKatalogNav && (
        <Link
          href={katalogHref}
          role="menuitem"
          aria-current={isKatalogPage ? "page" : undefined}
          className={cn(menuLinkClass, isKatalogPage && "bg-emerald-50 text-emerald-700")}
          onClick={onNavigate}
        >
          Katalog
        </Link>
      )}

      <Link
        href={blogHref}
        role="menuitem"
        aria-current={isBlogPage ? "page" : undefined}
        className={cn(menuLinkClass, isBlogPage && "bg-emerald-50 text-emerald-700")}
        onClick={onNavigate}
      >
        Blog
      </Link>

      {isOwner && (
        <>
          <div className="my-1 border-t border-slate-100" />
          <Link href="/yonetim" role="menuitem" className={menuLinkClass} onClick={onNavigate}>
            Yönetim
          </Link>
          <Link
            href="/dukkan-ayarlari"
            role="menuitem"
            className={menuLinkClass}
            onClick={onNavigate}
          >
            Düzenle
          </Link>
          <Link href="/" role="menuitem" className={menuLinkClass} onClick={onNavigate}>
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
    </>
  );
}

export function VitrinOwnerMenu({
  blogHref,
  katalogHref,
  showKatalogNav,
  isOwner,
  isBlogPage,
  isKatalogPage,
  headerRef,
}: {
  blogHref: string;
  katalogHref: string;
  showKatalogNav: boolean;
  isOwner: boolean;
  isBlogPage: boolean;
  isKatalogPage: boolean;
  headerRef?: RefObject<HTMLElement | null>;
}) {
  const [open, setOpen] = useState(false);
  const [menuTop, setMenuTop] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const closeMenu = () => setOpen(false);

  function syncMenuTop() {
    if (headerRef?.current) {
      setMenuTop(headerRef.current.getBoundingClientRect().bottom);
    }
  }

  useLayoutEffect(() => {
    function updateViewport() {
      setIsMobile(window.matchMedia("(max-width: 767px)").matches);
      if (open) syncMenuTop();
    }

    updateViewport();
    window.addEventListener("resize", updateViewport);
    window.addEventListener("scroll", syncMenuTop, { passive: true });
    return () => {
      window.removeEventListener("resize", updateViewport);
      window.removeEventListener("scroll", syncMenuTop);
    };
  }, [open, headerRef]);

  useEffect(() => {
    if (!open) return;

    function handleClickOutside(event: MouseEvent) {
      if (isMobile) return;
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    if (isMobile) {
      const previousOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
        document.removeEventListener("keydown", handleEscape);
        document.body.style.overflow = previousOverflow;
      };
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open, isMobile]);

  function toggleMenu() {
    const mobile = window.matchMedia("(max-width: 767px)").matches;
    setIsMobile(mobile);
    if (!open && mobile) syncMenuTop();
    setOpen((current) => !current);
  }

  const mobileMenu =
    open &&
    isMobile &&
    typeof document !== "undefined" &&
    createPortal(
      <>
        <button
          type="button"
          aria-label="Menüyü kapat"
          className="fixed inset-0 z-[100] bg-slate-900/25"
          style={{ top: menuTop }}
          onClick={closeMenu}
        />
        <div
          role="menu"
          className="fixed inset-x-0 z-[101] overflow-y-auto border-b border-slate-200 bg-white shadow-lg"
          style={{
            top: menuTop,
            maxHeight: menuTop > 0 ? `calc(100dvh - ${menuTop}px)` : "calc(100dvh - 7rem)",
          }}
        >
          <div className="flex flex-col gap-1 p-3">
            <MenuLinks
              blogHref={blogHref}
              katalogHref={katalogHref}
              showKatalogNav={showKatalogNav}
              isOwner={isOwner}
              isBlogPage={isBlogPage}
              isKatalogPage={isKatalogPage}
              onNavigate={closeMenu}
            />
          </div>
        </div>
      </>,
      document.body
    );

  return (
    <div ref={rootRef} className="relative shrink-0">
      <button
        type="button"
        aria-label="Menü"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={toggleMenu}
        className="inline-flex size-10 items-center justify-center rounded-full border border-slate-200/80 bg-white text-slate-700 shadow-sm transition hover:border-emerald-300 hover:text-emerald-600 lg:size-11"
      >
        <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
        </svg>
      </button>

      {mobileMenu}

      {open && !isMobile && (
        <div
          role="menu"
          className="absolute right-0 top-[calc(100%+0.5rem)] z-50 w-56 overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-2 shadow-xl shadow-slate-900/10"
        >
          <MenuLinks
            blogHref={blogHref}
            katalogHref={katalogHref}
            showKatalogNav={showKatalogNav}
            isOwner={isOwner}
            isBlogPage={isBlogPage}
            isKatalogPage={isKatalogPage}
            onNavigate={closeMenu}
          />
        </div>
      )}
    </div>
  );
}
