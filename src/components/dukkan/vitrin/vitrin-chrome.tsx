"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useRef, type ReactNode } from "react";
import { desktopContainerClass } from "@/lib/utils/layout";
import { VitrinMobileContactDrawer } from "@/components/dukkan/vitrin/vitrin-mobile-contact-drawer";
import { VitrinOwnerMenu } from "@/components/dukkan/vitrin/vitrin-owner-menu";
import type { Dukkan } from "@/types/database.types";

export function VitrinChrome({
  shopName,
  isOwner,
  showContactNav,
  showTeknikServisNav,
  showPazaryeriNav,
  dukkan,
  children,
}: {
  shopName: string;
  isOwner?: boolean;
  showContactNav: boolean;
  showTeknikServisNav: boolean;
  showPazaryeriNav: boolean;
  dukkan: Dukkan;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const iletisimHref = `/${dukkan.slug}/iletisim`;
  const teknikServisHref = `/${dukkan.slug}/teknik-servis`;
  const pazaryeriHref = `/${dukkan.slug}/pazaryeri`;
  const blogHref = `/${dukkan.slug}/blog`;
  const hakkimizdaHref = `/${dukkan.slug}/hakkimizda`;
  const magazamHref = `/${dukkan.slug}`;
  const isMagazamPage = pathname === magazamHref;
  const isIletisimPage = pathname === iletisimHref;
  const isTeknikServisPage = pathname === teknikServisHref;
  const isPazaryeriPage =
    pathname === pazaryeriHref || pathname.startsWith(`${pazaryeriHref}/`);
  const isBlogPage =
    pathname === blogHref || pathname.startsWith(`${blogHref}/`);
  const isHakkimizdaPage = pathname === hakkimizdaHref;

  const headerRef = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollY } = useScroll();
  const headerShadow = useTransform(
    scrollY,
    [0, 48],
    ["0px 0px 0px rgb(0 0 0 / 0)", "0px 8px 32px rgb(0 0 0 / 0.06)"]
  );

  return (
    <div className="relative min-h-screen bg-[radial-gradient(circle_at_top,_#ecfdf5_0%,_#f8fafc_38%,_#ffffff_100%)] text-slate-900">
      <motion.header
        ref={headerRef}
        style={reduceMotion ? undefined : { boxShadow: headerShadow }}
        className="sticky top-0 z-40 border-b border-white/60 bg-white/85 backdrop-blur-xl"
      >
        <div className={desktopContainerClass}>
          <div className="flex h-16 items-center justify-between gap-4 lg:h-[4.75rem]">
            <Link
              href={`/${dukkan.slug}`}
              className="min-w-0 truncate text-base font-bold tracking-tight text-slate-900 lg:text-xl"
            >
              {shopName}
            </Link>

            <nav
              aria-label="Vitrin menüsü"
              className="hidden items-center gap-1 rounded-full border border-slate-200/70 bg-slate-50/80 p-1 md:flex"
            >
              {isOwner && (
                <NavRouteLink
                  label="Mağazam"
                  href={magazamHref}
                  active={isMagazamPage}
                />
              )}
              {showContactNav && (
                <NavRouteLink
                  label="İletişim"
                  href={iletisimHref}
                  active={isIletisimPage}
                />
              )}
              {showTeknikServisNav && (
                <NavRouteLink
                  label="Teknik Servis"
                  href={teknikServisHref}
                  active={isTeknikServisPage}
                />
              )}
              {showPazaryeriNav && (
                <NavRouteLink
                  label="Pazaryeri"
                  href={pazaryeriHref}
                  active={isPazaryeriPage}
                />
              )}
              <NavRouteLink
                label="Hakkımızda"
                href={hakkimizdaHref}
                active={isHakkimizdaPage}
              />
            </nav>

            <div className="flex shrink-0 items-center">
              <VitrinOwnerMenu
                blogHref={blogHref}
                isOwner={Boolean(isOwner)}
                isBlogPage={isBlogPage}
                headerRef={headerRef}
              />
            </div>
          </div>

          <nav
            aria-label="Vitrin menüsü — mobil"
            className="flex gap-2 overflow-x-auto pb-3 md:hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {isOwner && (
              <NavRoutePill
                label="Mağazam"
                href={magazamHref}
                active={isMagazamPage}
              />
            )}
            {showContactNav && (
              <NavRoutePill
                label="İletişim"
                href={iletisimHref}
                active={isIletisimPage}
              />
            )}
            {showTeknikServisNav && (
              <NavRoutePill
                label="Teknik Servis"
                href={teknikServisHref}
                active={isTeknikServisPage}
              />
            )}
            {showPazaryeriNav && (
              <NavRoutePill
                label="Pazaryeri"
                href={pazaryeriHref}
                active={isPazaryeriPage}
              />
            )}
            <NavRoutePill
              label="Hakkımızda"
              href={hakkimizdaHref}
              active={isHakkimizdaPage}
            />
          </nav>
        </div>
      </motion.header>

      <VitrinMobileContactDrawer dukkan={dukkan} />

      <main className="flex min-w-0 flex-col overflow-x-clip pb-10 lg:pb-20">{children}</main>

      <footer className="mt-auto border-t border-slate-200/70 bg-white/80 py-10 backdrop-blur-sm lg:py-12">
        <div className={`${desktopContainerClass} text-center`}>
          <p className="text-sm text-slate-400">
            Bu sayfa{" "}
            <a
              href="https://esnafpro.app"
              target="_blank"
              rel="noopener noreferrer"
              className="transition hover:text-emerald-600"
            >
              esnafpro.app
            </a>{" "}
            yapısı altındadır
          </p>
        </div>
      </footer>
    </div>
  );
}

function NavRouteLink({
  label,
  href,
  active,
}: {
  label: string;
  href: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`rounded-full px-5 py-2.5 text-sm font-semibold transition ${
        active
          ? "bg-emerald-600 text-white shadow-sm"
          : "text-slate-600 hover:bg-white hover:text-emerald-600"
      }`}
    >
      {label}
    </Link>
  );
}

function NavRoutePill({
  label,
  href,
  active,
}: {
  label: string;
  href: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition sm:text-sm ${
        active
          ? "bg-emerald-600 text-white shadow-sm"
          : "bg-white text-slate-600 ring-1 ring-slate-200/80 hover:text-emerald-600"
      }`}
    >
      {label}
    </Link>
  );
}
