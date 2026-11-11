import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { LandingFooter } from "@/components/landing/landing-footer";
import { LandingNavbar } from "@/components/landing/landing-navbar";
import { MarketplacePageContent } from "@/components/marketplace/marketplace-page-content";
import { PazaryeriHizliLinkler } from "@/components/marketplace/pazaryeri-hizli-linkler";
import { JsonLdScripts } from "@/components/seo/json-ld-scripts";
import { getPublicSiteUrl } from "@/lib/auth/site-url";
import { buildBreadcrumbListJsonLd } from "@/lib/dukkan/json-ld";
import { getSecondHandDeviceHref, getSecondHandDeviceTitle } from "@/lib/dukkan/second-hand-devices";
import { getMarketplaceListings } from "@/lib/marketplace/get-public-listings";
import {
  enCokIlceler,
  ilceListesiMetni,
  PAZARYERI_SAYFALARI,
  pazaryeriSayfaAciklamasi,
  pazaryeriSayfaBasligi,
  pazaryeriSayfasiBul,
  pazaryeriSayfasiPath,
  sayfaIlanlari,
} from "@/lib/marketplace/pazaryeri-sayfalari";
import { buildPageMetadata } from "@/lib/seo/page-metadata";

type PageProps = {
  params: Promise<{ tur: string }>;
};

/** JSON-LD listesinde en fazla bu kadar ilan */
const ITEMLIST_MAX = 50;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { tur } = await params;
  const sayfa = pazaryeriSayfasiBul(tur);
  if (!sayfa) return { title: "Sayfa bulunamadı | EsnafPRO" };

  const ilanlar = sayfaIlanlari(await getMarketplaceListings(), sayfa);
  const ilceler = enCokIlceler(ilanlar);
  const metadata = buildPageMetadata({
    title: `${pazaryeriSayfaBasligi(sayfa, ilceler)} | EsnafPRO`,
    description: pazaryeriSayfaAciklamasi(sayfa, ilanlar.length, ilceler),
    path: pazaryeriSayfasiPath(sayfa),
    image: ilanlar[0]?.device.image_urls?.[0] ?? null,
  });

  // İlan yokken boş sayfa Google'a girmesin (ince içerik); linkler takip edilsin.
  return ilanlar.length ? metadata : { ...metadata, robots: { index: false, follow: true } };
}

export default async function PazaryeriTurPage({ params }: PageProps) {
  const { tur } = await params;
  const sayfa = pazaryeriSayfasiBul(tur);
  if (!sayfa) notFound();

  const tumIlanlar = await getMarketplaceListings();
  const ilanlar = sayfaIlanlari(tumIlanlar, sayfa);
  const ilceler = enCokIlceler(ilanlar, 5);
  const doluSluglar = new Set(
    PAZARYERI_SAYFALARI.filter((aday) => sayfaIlanlari(tumIlanlar, aday).length > 0).map((aday) => aday.slug)
  );
  const magazalar = [...new Map(ilanlar.map((ilan) => [ilan.shop.slug, ilan.shop])).values()];

  const siteUrl = getPublicSiteUrl();
  const sayfaUrl = `${siteUrl}${pazaryeriSayfasiPath(sayfa)}`;
  const yer = ilceListesiMetni(ilceler);

  const collectionPage = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${sayfaUrl}#sayfa`,
    name: pazaryeriSayfaBasligi(sayfa, ilceler),
    description: pazaryeriSayfaAciklamasi(sayfa, ilanlar.length, ilceler),
    url: sayfaUrl,
    inLanguage: "tr-TR",
    isPartOf: { "@type": "WebSite", name: "EsnafPRO", url: siteUrl },
    ...(ilceler.length
      ? { spatialCoverage: ilceler.map((ilce) => ({ "@type": "AdministrativeArea", name: ilce })) }
      : {}),
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: ilanlar.length,
      itemListElement: ilanlar.slice(0, ITEMLIST_MAX).map((ilan, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: getSecondHandDeviceTitle(ilan.device),
        url: `${siteUrl}${getSecondHandDeviceHref(ilan.shop.slug, ilan.device)}`,
      })),
    },
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-white text-slate-900">
      <JsonLdScripts
        schemas={[
          collectionPage,
          buildBreadcrumbListJsonLd([
            { name: "EsnafPRO", path: "/" },
            { name: "Pazaryeri", path: "/pazaryeri" },
            { name: sayfa.baslik, path: pazaryeriSayfasiPath(sayfa) },
          ]),
        ]}
      />
      <LandingNavbar />
      <main className="overflow-x-hidden px-4 py-16 sm:px-6 md:py-24">
        <MarketplacePageContent
          key={sayfa.slug}
          listings={tumIlanlar}
          baslangicTuru={sayfa.tur}
          baslangicKategori={sayfa.kategori}
          baslik={{
            etiket: sayfa.etiket,
            baslik: sayfa.baslik,
            aciklama: pazaryeriSayfaAciklamasi(sayfa, ilanlar.length, ilceler),
          }}
          ustLinkler={<PazaryeriHizliLinkler aktifSlug={sayfa.slug} doluSluglar={doluSluglar} />}
          altIcerik={
            magazalar.length > 0 ? (
              <section aria-labelledby="pazaryeri-bilgi" className="mt-14 max-w-3xl border-t border-slate-200/70 pt-8">
                <h2 id="pazaryeri-bilgi" className="text-lg font-bold tracking-tight text-slate-900">
                  {yer ? `${yer} bölgesinde ${sayfa.kisaAd} almak` : `${sayfa.kisaAd} almak`}
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">
                  Bu sayfadaki {ilanlar.length} ilan, EsnafPRO üyesi telefoncu mağazalarının kendi
                  {sayfa.tur === "used" ? " ikinci el" : " sıfır"} cihazlarıdır. Her ilanda fiyat, mağaza adresi ve
                  {sayfa.tur === "used" ? " cihazın durum bilgisi" : " garanti bilgisi"} yer alır; cihazı mağazada
                  görüp WhatsApp&apos;tan doğrudan satıcıya sorabilirsiniz.
                </p>
                <p className="mt-4 text-sm font-semibold text-slate-900">İlan veren mağazalar</p>
                <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1.5 text-sm">
                  {magazalar.map((magaza) => (
                    <li key={magaza.slug}>
                      <Link
                        href={`/${magaza.slug}/pazaryeri`}
                        className="font-medium text-emerald-700 hover:text-emerald-800"
                      >
                        {magaza.dukkan_adi}
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null
          }
        />
      </main>
      <LandingFooter />
    </div>
  );
}
