import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { KlasorOgeIzgarasi } from "@/components/dukkan/vitrin/klasor-oge-izgarasi";
import { VitrinBreadcrumb } from "@/components/dukkan/vitrin/vitrin-breadcrumb";
import { klasorOzeti, type VitrinKlasor } from "@/components/dukkan/vitrin/vitrin-klasor-kartlari";
import { VitrinDotGrid } from "@/components/dukkan/vitrin/vitrin-open-section";
import { klasorOgeleriniSuz, vitrinKlasorPath, type KlasorAltGrubu } from "@/lib/dukkan/vitrin-klasorleri";
import { cn } from "@/lib/utils/cn";
import { desktopContainerClass } from "@/lib/utils/layout";
import type { Dukkan } from "@/types/database.types";

const chipClass = (active: boolean) =>
  cn(
    "inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-full border px-4 text-sm font-semibold transition",
    active
      ? "border-emerald-600 bg-emerald-600 text-white"
      : "border-slate-200 bg-white text-slate-700 hover:border-emerald-300 hover:text-emerald-700"
  );

export function KategoriPageContent({
  dukkan,
  klasor,
  digerKlasorler,
  altSlug,
  urunSluglari,
}: {
  dukkan: Pick<Dukkan, "slug" | "dukkan_adi" | "whatsapp" | "telefon">;
  klasor: VitrinKlasor;
  digerKlasorler: VitrinKlasor[];
  altSlug: string | null;
  urunSluglari: Map<string, string>;
}) {
  const { ogeler, seciliAlt } = klasorOgeleriniSuz(klasor, altSlug);
  const whatsapp = dukkan.whatsapp ?? dukkan.telefon ?? null;
  const magazaHref = `/${dukkan.slug}`;

  return (
    <div className={`${desktopContainerClass} relative pb-12 pt-4 lg:pb-16 lg:pt-6`}>
      <VitrinDotGrid />

      <div className="flex flex-wrap items-center justify-between gap-2">
        <VitrinBreadcrumb
          items={[
            { ad: dukkan.dukkan_adi, href: magazaHref },
            { ad: klasor.ad, href: seciliAlt ? vitrinKlasorPath(dukkan.slug, klasor.slug) : undefined },
            ...(seciliAlt ? [{ ad: seciliAlt.ad }] : []),
          ]}
        />
      </div>

      <header className="mt-2 lg:mt-4">
        <Link
          href={`${magazaHref}#urunler`}
          className="-ml-1 inline-flex min-h-11 items-center gap-1.5 rounded-lg px-1 text-sm font-semibold text-emerald-700 transition hover:text-emerald-800"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Tüm kategoriler
        </Link>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900 lg:text-4xl">
          {seciliAlt ? seciliAlt.ad : klasor.ad}
        </h1>
        <p className="mt-2 text-base text-slate-600">
          {dukkan.dukkan_adi} mağazasında{" "}
          {klasorOzeti({
            urunSayisi: ogeler.filter((oge) => oge.tur === "urun").length,
            cihazSayisi: ogeler.filter((oge) => oge.tur === "cihaz").length,
          })}
        </p>
      </header>

      {klasor.altlar.length > 0 && (
        <AltKategoriCipleri
          shopSlug={dukkan.slug}
          klasorSlug={klasor.slug}
          toplam={klasor.ogeler.length}
          altlar={klasor.altlar}
          seciliSlug={seciliAlt?.slug ?? null}
        />
      )}

      <div className="mt-6 lg:mt-8">
        <KlasorOgeIzgarasi
          ogeler={ogeler}
          shopSlug={dukkan.slug}
          shopName={dukkan.dukkan_adi}
          whatsapp={whatsapp}
          urunSluglari={urunSluglari}
          altEtiketiGoster={!seciliAlt}
        />
      </div>

      {digerKlasorler.length > 0 && (
        <section aria-labelledby="diger-kategoriler" className="mt-14 border-t border-slate-200/60 pt-8 lg:mt-20">
          <h2 id="diger-kategoriler" className="text-lg font-bold tracking-tight text-slate-900 sm:text-xl">
            Diğer kategoriler
          </h2>
          <ul className="mt-4 flex flex-wrap gap-2">
            {digerKlasorler.map((diger) => (
              <li key={diger.slug}>
                <Link href={vitrinKlasorPath(dukkan.slug, diger.slug)} className={chipClass(false)}>
                  {diger.ad}
                  <span className="text-xs font-medium text-slate-500">{diger.ogeler.length}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function AltKategoriCipleri({
  shopSlug,
  klasorSlug,
  toplam,
  altlar,
  seciliSlug,
}: {
  shopSlug: string;
  klasorSlug: string;
  toplam: number;
  altlar: KlasorAltGrubu[];
  seciliSlug: string | null;
}) {
  return (
    <nav
      aria-label="Alt kategoriler"
      className="-mx-4 mt-5 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 [&::-webkit-scrollbar]:hidden"
    >
      <Link
        href={vitrinKlasorPath(shopSlug, klasorSlug)}
        scroll={false}
        aria-current={seciliSlug === null ? "page" : undefined}
        className={chipClass(seciliSlug === null)}
      >
        Tümü
        <span className="text-xs font-medium opacity-75">{toplam}</span>
      </Link>
      {altlar.map((alt) => {
        const aktif = alt.slug === seciliSlug;
        return (
          <Link
            key={alt.slug}
            href={vitrinKlasorPath(shopSlug, klasorSlug, alt.slug)}
            scroll={false}
            aria-current={aktif ? "page" : undefined}
            className={chipClass(aktif)}
          >
            {alt.ad}
            <span className="text-xs font-medium opacity-75">{alt.adet}</span>
          </Link>
        );
      })}
    </nav>
  );
}
