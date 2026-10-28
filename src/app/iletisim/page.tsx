import { ContactDetails } from "@/components/landing/contact-details";
import { LandingFooter } from "@/components/landing/landing-footer";
import { LandingNavbar } from "@/components/landing/landing-navbar";
import { resolvePlatformPageMetadata } from "@/lib/seo/get-platform-page-seo";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return resolvePlatformPageMetadata("/iletisim");
}

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
          </div>
          <div className="mt-8">
            <ContactDetails />
          </div>
        </article>
      </main>
      <LandingFooter />
    </div>
  );
}
