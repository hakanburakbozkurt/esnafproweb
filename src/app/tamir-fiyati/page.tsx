import { LandingFooter } from "@/components/landing/landing-footer";
import { LandingNavbar } from "@/components/landing/landing-navbar";
import { TamirFiyatiWizard } from "@/components/tamir-fiyati/tamir-fiyati-wizard";
import { getTamirMarkalari } from "@/lib/tamir-fiyati/tamir-fiyati-queries";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tamir Fiyatı Al | EsnafPRO",
  description:
    "Marka ve modelinizi seçin; EsnafPRO referans tamir fiyat listesinden güncel servis fiyatlarını anında görün.",
};

export default async function TamirFiyatiPage() {
  const brands = await getTamirMarkalari();

  return (
    <div className="min-h-screen overflow-x-hidden bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.08),_transparent_42%),linear-gradient(to_bottom,_#f8fafc,_#ffffff_40%)] text-slate-900">
      <LandingNavbar />
      <main className="px-4 py-10 sm:px-6 sm:py-14">
        <div className="mx-auto mb-10 max-w-5xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">
            Tamir Fiyat Rehberi
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Tamir Fiyatı Al
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">
            Markanızı ve modelinizi seçin; ekran, pil ve diğer servis kalemlerinin
            referans fiyatlarını tek ekranda görün.
          </p>
        </div>

        <TamirFiyatiWizard brands={brands} />
      </main>
      <LandingFooter />
    </div>
  );
}
