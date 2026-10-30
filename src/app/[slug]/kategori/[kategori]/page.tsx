import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { JsonLdScripts } from "@/components/seo/json-ld-scripts";
import { KategoriPageContent } from "@/components/dukkan/vitrin/kategori-page-content";
import { klasorKapaklari, klasorOzeti } from "@/components/dukkan/vitrin/vitrin-klasor-kartlari";
import { VitrinChrome } from "@/components/dukkan/vitrin/vitrin-chrome";
import { buildCollectionPageJsonLd, buildStoreBreadcrumbJsonLd } from "@/lib/dukkan/json-ld";
import { buildStoreSubpageSeoMetadata, NOT_FOUND_STORE_METADATA } from "@/lib/dukkan/metadata";
import {
  getSecondHandDeviceHref,
  getSecondHandDeviceImage,
  getSecondHandDeviceTitle,
} from "@/lib/dukkan/second-hand-devices";
import { getUrunPhotoUrls } from "@/lib/dukkan/urun-photos";
import { vitrinUrunPath } from "@/lib/dukkan/vitrin-klasorleri";
import { getVitrinChromeDurumu, getVitrinVerisi, type VitrinVerisi } from "@/lib/dukkan/vitrin-veri";

type PageProps = {
  params: Promise<{ slug: string; kategori: string }>;
  searchParams: Promise<{ alt?: string | string[] }>;
};

function klasorBul(veri: VitrinVerisi, kategoriSlug: string) {
  return veri.klasorler.find((klasor) => klasor.slug === kategoriSlug) ?? null;
}

function kategoriAciklamasi(veri: VitrinVerisi, klasor: NonNullable<ReturnType<typeof klasorBul>>): string {
  const altlar = klasor.altlar.slice(0, 5).map((alt) => alt.ad);
  const altMetni = altlar.length ? ` ${altlar.join(", ")} seçenekleri.` : "";
  return `${veri.dukkan.dukkan_adi} mağazasında ${klasor.ad}: ${klasorOzeti(klasor)}.${altMetni} Fiyat ve stok için WhatsApp'tan sorun.`;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug, kategori } = await params;
  const veri = await getVitrinVerisi(slug);
  if (!veri) return NOT_FOUND_STORE_METADATA;

  const klasor = klasorBul(veri, kategori);
  if (!klasor) return NOT_FOUND_STORE_METADATA;

  // Alt kategori filtreleri (?alt=) aynı sayfanın görünümüdür; kanonik adres her zaman kategori sayfasıdır.
  return buildStoreSubpageSeoMetadata(
    veri.dukkan,
    `kategori/${klasor.slug}`,
    klasor.ad,
    kategoriAciklamasi(veri, klasor),
    { image: klasorKapaklari(klasor, 1)[0] ?? null }
  );
}

export default async function KategoriPage({ params, searchParams }: PageProps) {
  const { slug, kategori } = await params;
  const { alt } = await searchParams;
  const veri = await getVitrinVerisi(slug);
  if (!veri) notFound();

  const klasor = klasorBul(veri, kategori);
  if (!klasor) notFound();

  const chrome = await getVitrinChromeDurumu(veri);
  const { dukkan } = veri;
  const altSlug = typeof alt === "string" ? alt.trim() || null : null;

  const jsonLdItems = klasor.ogeler.flatMap((oge) => {
    if (oge.tur === "urun") {
      const urunSlug = veri.urunSluglari.get(oge.urun.id);
      if (!urunSlug) return [];
      return [
        {
          name: oge.urun.urun_adi,
          path: vitrinUrunPath(dukkan.slug, urunSlug),
          image: getUrunPhotoUrls(oge.urun)[0] ?? null,
        },
      ];
    }
    if (!oge.cihaz.id) return [];
    return [
      {
        name: getSecondHandDeviceTitle(oge.cihaz),
        path: getSecondHandDeviceHref(dukkan.slug, { id: oge.cihaz.id, web_slug: oge.cihaz.web_slug }),
        image: getSecondHandDeviceImage(oge.cihaz),
      },
    ];
  });

  return (
    <>
      <JsonLdScripts
        schemas={[
          buildCollectionPageJsonLd({
            slug: dukkan.slug,
            path: `/kategori/${klasor.slug}`,
            name: `${klasor.ad} | ${dukkan.dukkan_adi}`,
            description: kategoriAciklamasi(veri, klasor),
            items: jsonLdItems,
          }),
          buildStoreBreadcrumbJsonLd(dukkan.slug, dukkan.dukkan_adi, [
            { name: klasor.ad, segment: `kategori/${klasor.slug}` },
          ]),
        ]}
      />

      <VitrinChrome shopName={dukkan.dukkan_adi} dukkan={dukkan} {...chrome}>
        <KategoriPageContent
          dukkan={dukkan}
          klasor={klasor}
          digerKlasorler={veri.klasorler.filter((diger) => diger.slug !== klasor.slug)}
          altSlug={altSlug}
          urunSluglari={veri.urunSluglari}
        />
      </VitrinChrome>
    </>
  );
}
