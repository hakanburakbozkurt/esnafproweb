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

const headerActionClass =
  "inline-flex min-h-10 items-center rounded-full border border-slate-200/80 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-emerald-300 hover:text-emerald-600 lg:px-5";

export function SubPageHeader() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isWholesaler, setIsWholesaler] = useState(false);
  const [storeSlug, setStoreSlug] = useState<string | null>(null);
  const [hasToptanciProfil, setHasToptanciProfil] = useState(false);

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

  return (
    <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/80 backdrop-blur-md">
      <nav className={`${desktopContainerClass} flex h-16 items-center justify-between lg:h-[4.5rem]`}>
        <Link href="/" className="text-lg font-semibold tracking-tight">
          <span className="text-slate-900">Esnaf</span>
          <span className="text-emerald-600">PRO</span>
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          {isWholesaler ? (
            <>
              <Link
                href={hasToptanciProfil ? WHOLESALER_XML_PATH : WHOLESALER_ONBOARDING_PATH}
                className={headerActionClass}
              >
                {hasToptanciProfil ? "XML Paneli" : "Firma Profili"}
              </Link>
              {hasToptanciProfil && (
                <Link href="/toptanci-ayarlari" className={headerActionClass}>
                  Ayarlar
                </Link>
              )}
            </>
          ) : (
            <>
              {storeSlug ? (
                <Link href={`/${storeSlug}`} className={headerActionClass}>
                  Mağazam
                </Link>
              ) : isAuthenticated ? (
                <Link href="/dukkan-ac" className={headerActionClass}>
                  Mağaza Aç
                </Link>
              ) : null}

              {isAuthenticated && (
                <>
                  <Link href="/yonetim" className={headerActionClass}>
                    Yönetim
                  </Link>
                  <Link href="/dukkan-ayarlari" className={headerActionClass}>
                    Düzenle
                  </Link>
                </>
              )}
            </>
          )}

          <Link href="/" className={headerActionClass}>
            Ana Sayfa
          </Link>

          {isAuthenticated && <SignOutButton />}
        </div>
      </nav>
    </header>
  );
}
