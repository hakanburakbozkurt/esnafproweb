import { FeaturedStoreCard } from "@/components/landing/featured-store-card";
import { LandingFooter } from "@/components/landing/landing-footer";
import { LandingNavbar } from "@/components/landing/landing-navbar";
import { getAllActivePublicStores } from "@/lib/dukkan/get-public-stores";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dijital Dükkanını Açan Esnaflar | EsnafPRO",
  description:
    "EsnafPRO ile dijital vitrinini açan esnaf ve işletmelerin listesi.",
};

export default async function EsnaflarPage() {
  const stores = await getAllActivePublicStores();

  return (
    <div className="min-h-screen overflow-x-hidden bg-white text-slate-900">
      <LandingNavbar />
      <main className="overflow-x-hidden px-4 py-16 sm:px-6 md:py-24">
        <div className="mx-auto w-full min-w-0 max-w-6xl">
          <header className="text-center">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Dijital Dükkanını Açan Esnaflar
            </h1>
            <p className="mx-auto mt-4 max-w-lg text-slate-500">
              Aktif dijital vitrinleri inceleyin ve mağazaları ziyaret edin.
            </p>
          </header>

          {stores.length ? (
            <div className="mt-10 grid grid-cols-2 gap-3 sm:mt-12 sm:gap-4 lg:grid-cols-4 lg:gap-5">
              {stores.map((store) => (
                <FeaturedStoreCard key={store.id} store={store} />
              ))}
            </div>
          ) : (
            <p className="mt-12 text-center text-sm text-slate-500">
              Henüz listelenecek aktif dükkan bulunmuyor.
            </p>
          )}
        </div>
      </main>
      <LandingFooter />
    </div>
  );
}
