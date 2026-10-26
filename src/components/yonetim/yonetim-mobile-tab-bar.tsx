"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Ellipsis, LayoutDashboard, Package, Wrench, X, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { getYonetimNavItems } from "@/lib/yonetim/nav";
import { cn } from "@/lib/utils/cn";

type Tab = {
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
  match: (pathname: string) => boolean;
};

const PRIMARY_TABS: Tab[] = [
  {
    id: "anasayfa",
    label: "Ana sayfa",
    href: "/yonetim",
    icon: LayoutDashboard,
    match: (pathname) => pathname === "/yonetim",
  },
  {
    id: "urunler",
    label: "Ürünler",
    href: "/dukkan-ayarlari/urunler",
    icon: Package,
    match: (pathname) => pathname.startsWith("/dukkan-ayarlari/urunler"),
  },
  {
    id: "servis",
    label: "Servis",
    href: "/yonetim/servis",
    icon: Wrench,
    match: (pathname) => pathname.startsWith("/yonetim/servis"),
  },
];

const tabClass =
  "relative flex min-h-14 flex-1 flex-col items-center justify-center gap-0.5 rounded-2xl text-[11px] font-semibold transition";

function MoreSheet({ pathname, onClose }: { pathname: string; onClose: () => void }) {
  const reduceMotion = useReducedMotion();
  const closeRef = useRef<HTMLButtonElement>(null);
  const onCloseRef = useRef(onClose);
  const items = getYonetimNavItems().filter(
    (item) => item.id !== "overview" && item.id !== "servis"
  );

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onCloseRef.current();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[60] md:hidden">
      <motion.button
        type="button"
        tabIndex={-1}
        aria-label="Menüyü kapat"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, transition: { duration: reduceMotion ? 0 : 0.16 } }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]"
      />
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label="Diğer yönetim bölümleri"
        initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: reduceMotion ? 0 : 40, transition: { duration: reduceMotion ? 0 : 0.16 } }}
        transition={reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 400, damping: 36 }}
        className="absolute inset-x-0 bottom-0 rounded-t-3xl bg-white px-4 pt-2.5 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-2xl"
      >
        <div className="mx-auto h-1.5 w-10 rounded-full bg-slate-200" aria-hidden />
        <div className="mt-2 flex items-center justify-between">
          <p className="text-sm font-bold text-slate-900">Diğer bölümler</p>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Kapat"
            className="inline-flex size-11 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100"
          >
            <X className="size-5" aria-hidden />
          </button>
        </div>
        <ul className="mt-2 space-y-1">
          {items.map((item) => {
            const Icon = item.icon;
            const active = item.match(pathname) && !pathname.startsWith("/dukkan-ayarlari/urunler");
            return (
              <li key={item.id}>
                <Link
                  href={item.href}
                  onClick={onClose}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex min-h-12 items-center gap-3 rounded-2xl px-3 text-sm font-semibold transition",
                    active ? "bg-emerald-50 text-emerald-700" : "text-slate-700 hover:bg-slate-50"
                  )}
                >
                  <span className="flex size-9 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                    <Icon className="size-4" aria-hidden />
                  </span>
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </motion.div>
    </div>
  );
}

/** Yalnızca mobilde görünen alt sekme çubuğu. Kaydedilmemiş değişiklik varken kaydet çubuğu yerini alır. */
export function YonetimMobileTabBar() {
  const pathname = usePathname() ?? "";
  const [moreOpen, setMoreOpen] = useState(false);
  const primaryActive = PRIMARY_TABS.some((tab) => tab.match(pathname));

  return (
    <>
      <style>{`@media (max-width: 767px) { body { padding-bottom: calc(4.5rem + env(safe-area-inset-bottom)); } }`}</style>
      <nav
        aria-label="Yönetim — hızlı menü"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200/80 bg-white/95 px-2 pt-1.5 pb-[max(0.375rem,env(safe-area-inset-bottom))] shadow-[0_-8px_24px_rgb(15_23_42/0.06)] backdrop-blur-md md:hidden [body[data-save-bar=active]_&]:hidden"
      >
        <ul className="mx-auto flex max-w-md gap-1">
          {PRIMARY_TABS.map((tab) => {
            const active = tab.match(pathname);
            const Icon = tab.icon;
            return (
              <li key={tab.id} className="flex flex-1">
                <Link
                  href={tab.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(tabClass, active ? "text-emerald-700" : "text-slate-500 hover:text-slate-900")}
                >
                  <Icon className={cn("size-5", active && "stroke-[2.4]")} aria-hidden />
                  {tab.label}
                  {active && (
                    <span aria-hidden className="absolute top-1 h-1 w-6 rounded-full bg-emerald-600" />
                  )}
                </Link>
              </li>
            );
          })}
          <li className="flex flex-1">
            <button
              type="button"
              onClick={() => setMoreOpen(true)}
              aria-haspopup="dialog"
              aria-expanded={moreOpen}
              className={cn(
                tabClass,
                !primaryActive ? "text-emerald-700" : "text-slate-500 hover:text-slate-900"
              )}
            >
              <Ellipsis className="size-5" aria-hidden />
              Daha fazla
              {!primaryActive && (
                <span aria-hidden className="absolute top-1 h-1 w-6 rounded-full bg-emerald-600" />
              )}
            </button>
          </li>
        </ul>
      </nav>

      <AnimatePresence>
        {moreOpen && <MoreSheet pathname={pathname} onClose={() => setMoreOpen(false)} />}
      </AnimatePresence>
    </>
  );
}
