import { LandingFooter } from "@/components/landing/landing-footer";
import { LandingNavbar } from "@/components/landing/landing-navbar";
import { TamirFiyatiWizard } from "@/components/tamir-fiyati/tamir-fiyati-wizard";
import { getTamirMarkalari } from "@/lib/tamir-fiyati/tamir-fiyati-queries";
import { resolvePlatformPageMetadata } from "@/lib/seo/get-platform-page-seo";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return resolvePlatformPageMetadata("/tamir-fiyati");
}

export default async function TamirFiyatiPage() {
  const brands = await getTamirMarkalari();

  return (
    <div className="min-h-screen overflow-x-hidden bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.08),_transparent_42%),linear-gradient(to_bottom,_#f8fafc,_#ffffff_40%)] text-slate-900">
      <LandingNavbar />
      <main className="px-4 py-10 sm:px-6 sm:py-14">
        <TamirFiyatiWizard brands={brands} />
      </main>
      <LandingFooter />
    </div>
  );
}
