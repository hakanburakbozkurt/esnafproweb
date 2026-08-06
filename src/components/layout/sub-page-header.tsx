"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { getUserRoleFromMetadata, WHOLESALER_ROLE } from "@/lib/auth/roles";
import {
  WHOLESALER_ONBOARDING_PATH,
  WHOLESALER_XML_PATH,
} from "@/lib/auth/wholesaler";
import { createClient } from "@/lib/supabase/client";
import { desktopContainerClass } from "@/lib/utils/layout";
import { cn } from "@/lib/utils/cn";

const headerActionClass =
  "inline-flex min-h-10 items-center rounded-full border border-slate-200/80 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-emerald-300 hover:text-emerald-600 sm:px-4 lg:px-5";

const mobileNavLinkClass =
  "flex w-full min-h-11 items-center justify-center rounded-xl border border-slate-200/80 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-emerald-300 hover:text-emerald-600";

function MenuIcon({ open }: { open: boolean }) {
  if (open) {
    return (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
      </svg>
    );
  }

  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}

function HeaderNavLinks({
  variant,
  isWholesaler,
  hasToptanciProfil,
  storeSlug,
  isAuthenticated,
  onNavigate,
}: {
  variant: "desktop" | "mobile";
  isWholesaler: boolean;
  hasToptanciProfil: boolean;
  storeSlug: string | null;
  isAuthenticated: boolean;
  onNavigate?: () => void;
}) {
  const linkClass = variant === "mobile" ? mobileNavLinkClass : headerActionClass;
  const linkProps = onNavigate ? { onClick: onNavigate } : {};

  if (isWholesaler) {
    return (
      <>
        <Link
          href={hasToptanciProfil ? WHOLESALER_XML_PATH : WHOLESALER_ONBOARDING_PATH}
          className={linkClass}
          {...linkProps}
        >
          {hasToptanciProfil ? "XML Paneli" : "Firma Profili"}
        </Link>
        {hasToptanciProfil && (
          <Link href="/toptanci-ayarlari" className={linkClass} {...linkProps}>
            Ayarlar
          </Link>
        )}
      </>
    );
  }

  return (
    <>
      {storeSlug ? (
        <Link href={`/${storeSlug}`} className={linkClass} {...linkProps}>
          Mağazam
        </Link>
      ) : isAuthenticated ? (
        <Link href="/dukkan-ac" className={linkClass} {...linkProps}>
          Mağaza Aç
        </Link>
      ) : null}

      {isAuthenticated && (
        <>
          <Link href="/yonetim" className={linkClass} {...linkProps}>
            Yönetim
          </Link>
          <Link href="/dukkan-ayarlari" className={linkClass} {...linkProps}>
            Düzenle
          </Link>
        </>
      )}
    </>
  );
}

export function SubPageHeader() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isWholesaler, setIsWholesaler] = useState(false);
  const [storeSlug, setStoreSlug] = useState<string | null>(null);
  const [hasToptanciProfil, setHasToptanciProfil] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    async function loadSession() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setIsAuthenticated(!!user);

      if (!user) {
        setIsWholesaler(false);
        setStoreSlug(null);
        return;
      }

      let wholesaler = getUserRoleFromMetadata(user) === WHOLESALER_ROLE;

      if (!wholesaler) {
        const { data: profil } = await supabase
          .from("kullanici_profilleri")
          .select("role")
          .eq("id", user.id)
          .maybeSingle();

        wholesaler = profil?.role === WHOLESALER_ROLE;
      }

      setIsWholesaler(wholesaler);

      if (wholesaler) {
        const { data: toptanci } = await supabase
          .from("toptancilar")
          .select("slug")
          .eq("user_id", user.id)
          .maybeSingle();

        setHasToptanciProfil(Boolean(toptanci?.slug));
        setStoreSlug(toptanci?.slug ?? null);
        return;
      }

      setHasToptanciProfil(false);

      const { data: dukkan } = await supabase
        .from("dukkanlar")
        .select("slug")
        .eq("user_id", user.id)
        .maybeSingle();

      setStoreSlug(dukkan?.slug ?? null);
    }

    void loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session?.user);
      if (!session?.user) {
        setIsWholesaler(false);
        setStoreSlug(null);
        return;
      }
      void loadSession();
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!menuOpen) return;

    function handleResize() {
      if (window.innerWidth >= 768) {
        setMenuOpen(false);
      }
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    window.addEventListener("resize", handleResize);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("resize", handleResize);
    };
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  const navLinkProps = {
    isWholesaler,
    hasToptanciProfil,
    storeSlug,
    isAuthenticated,
  };

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/80 backdrop-blur-md">
        <nav
          className={cn(
            desktopContainerClass,
            "flex min-h-16 w-full min-w-0 items-center justify-between gap-3 py-2 lg:h-[4.5rem] lg:py-0"
          )}
        >
          <Link href="/" className="shrink-0 text-lg font-semibold tracking-tight">
            <span className="text-slate-900">Esnaf</span>
            <span className="text-emerald-600">PRO</span>
          </Link>

          <div className="hidden min-w-0 flex-wrap items-center justify-end gap-2 md:flex md:gap-3">
            <HeaderNavLinks variant="desktop" {...navLinkProps} />
            <Link href="/" className={headerActionClass}>
              Ana Sayfa
            </Link>
            {isAuthenticated && <SignOutButton />}
          </div>

          <button
            type="button"
            className="inline-flex min-h-10 min-w-10 items-center justify-center rounded-full border border-slate-200/80 bg-white text-slate-700 shadow-sm transition hover:border-emerald-300 hover:text-emerald-600 md:hidden"
            aria-expanded={menuOpen}
            aria-controls="mobile-nav-panel"
            aria-label={menuOpen ? "Menüyü kapat" : "Menüyü aç"}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <MenuIcon open={menuOpen} />
          </button>
        </nav>
      </header>

      {menuOpen && (
        <>
          <button
            type="button"
            aria-label="Menüyü kapat"
            className="fixed inset-0 top-16 z-40 bg-slate-900/25 md:hidden"
            onClick={closeMenu}
          />
          <div
            id="mobile-nav-panel"
            className="fixed inset-x-0 top-16 z-50 max-h-[calc(100dvh-4rem)] overflow-y-auto border-b border-slate-200 bg-white shadow-lg md:hidden"
          >
            <div className={cn(desktopContainerClass, "flex flex-col gap-2 py-4")}>
              <HeaderNavLinks variant="mobile" {...navLinkProps} onNavigate={closeMenu} />
              <Link href="/" className={mobileNavLinkClass} onClick={closeMenu}>
                Ana Sayfa
              </Link>
              {isAuthenticated && (
                <SignOutButton className="w-full justify-center rounded-xl border border-slate-200/80 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm" />
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}
