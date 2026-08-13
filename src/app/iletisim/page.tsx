import { LandingFooter } from "@/components/landing/landing-footer";
import { LandingNavbar } from "@/components/landing/landing-navbar";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "İletişim | EsnafPRO",
  description: "EsnafPRO ile iletişime geçin.",
};

export default async function IletisimPage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-white text-slate-900">
      <LandingNavbar />
      <main className="px-4 py-16 sm:px-6 md:py-24">
        <article className="mx-auto w-full min-w-0 max-w-3xl">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            İletişim
          </h1>
          <div className="mt-6 space-y-4 text-sm leading-relaxed text-slate-600 sm:text-base">
            <p>
              EsnafPRO hakkında sorularınız, iş birliği teklifleriniz veya
              destek talepleriniz için bizimle iletişime geçebilirsiniz.
            </p>
            <p>
              E-posta:{" "}
              <a
                href="mailto:destek@esnafpro.com"
                className="font-medium text-emerald-700 hover:text-emerald-800"
              >
                destek@esnafpro.com
              </a>
            </p>
          </div>
        </article>
      </main>
      <LandingFooter />
    </div>
  );
}
