import { LandingFooter } from "@/components/landing/landing-footer";
import { LandingNavbar } from "@/components/landing/landing-navbar";
import { buildPageMetadata } from "@/lib/seo/page-metadata";
import type { Metadata } from "next";

export const metadata: Metadata = buildPageMetadata({
  title: "Hakkımızda | EsnafPRO",
  description:
    "EsnafPRO; esnaf ve küçük işletmeler için dijital vitrin ve işletme yönetim platformudur.",
  path: "/hakkimizda",
});

export default async function HakkimizdaPage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-white text-slate-900">
      <LandingNavbar />
      <main className="px-4 py-16 sm:px-6 md:py-24">
        <article className="mx-auto w-full min-w-0 max-w-3xl">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Hakkımızda
          </h1>
          <div className="mt-6 space-y-4 text-sm leading-relaxed text-slate-600 sm:text-base">
            <p>
              EsnafPRO, telefon ve teknik servis esnafının dijital vitrinini
              açmasını, stok ve kasa süreçlerini yönetmesini ve müşterileriyle
              daha güçlü bağ kurmasını sağlayan bir platformdur.
            </p>
            <p>
              Amacımız; her ölçekteki işletmenin kod bilmeden, hızlı ve
              profesyonel bir web vitrinine sahip olmasını kolaylaştırmaktır.
            </p>
          </div>
        </article>
      </main>
      <LandingFooter />
    </div>
  );
}
