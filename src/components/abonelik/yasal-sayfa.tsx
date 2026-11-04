import type { ReactNode } from "react";
import { LandingFooter } from "@/components/landing/landing-footer";
import { LandingNavbar } from "@/components/landing/landing-navbar";
import type { SaticiBilgileri } from "@/lib/abonelik/satici-bilgileri";

export function YasalSayfa({ baslik, children }: { baslik: string; children: ReactNode }) {
  return (
    <div className="min-h-screen overflow-x-hidden bg-white text-slate-900">
      <LandingNavbar />
      <main className="px-4 py-16 sm:px-6 md:py-24">
        <article className="mx-auto w-full min-w-0 max-w-3xl">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">{baslik}</h1>
          <div className="mt-8 space-y-6 text-sm leading-relaxed text-slate-600 sm:text-base [&_h2]:mt-8 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-slate-900">
            {children}
          </div>
        </article>
      </main>
      <LandingFooter />
    </div>
  );
}

export function SaticiBilgiTablosu({ satici }: { satici: SaticiBilgileri }) {
  const satirlar: [string, string][] = [
    ["Ünvan", satici.unvan],
    ["Adres", satici.adres],
    ["Vergi dairesi / no", `${satici.vergiDairesi} / ${satici.vergiNo}`],
    ["E-posta", satici.eposta],
    ["Telefon", satici.telefon],
  ];
  return (
    <dl className="grid gap-x-6 gap-y-2 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-[auto_1fr]">
      {satirlar.map(([etiket, deger]) => (
        <div key={etiket} className="contents">
          <dt className="font-medium text-slate-900">{etiket}</dt>
          <dd className="break-words">{deger}</dd>
        </div>
      ))}
    </dl>
  );
}
