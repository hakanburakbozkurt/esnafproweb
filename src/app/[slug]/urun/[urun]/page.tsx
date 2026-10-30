import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import { JsonLdScripts } from "@/components/seo/json-ld-scripts";
import { KlasorOgeIzgarasi } from "@/components/dukkan/vitrin/klasor-oge-izgarasi";
import { UrunSayfasiIcerigi } from "@/components/dukkan/vitrin/urun-sayfasi-icerigi";
import { VitrinBreadcrumb } from "@/components/dukkan/vitrin/vitrin-breadcrumb";
import { VitrinChrome } from "@/components/dukkan/vitrin/vitrin-chrome";
import { VitrinDotGrid } from "@/components/dukkan/vitrin/vitrin-open-section";
import { getPublicSiteUrl } from "@/lib/auth/site-url";
import { buildStoreBreadcrumbJsonLd, buildUrunProductJsonLd } from "@/lib/dukkan/json-ld";
import { buildStoreSubpageSeoMetadata, NOT_FOUND_STORE_METADATA } from "@/lib/dukkan/metadata";
import { parseUrunFiyati } from "@/lib/dukkan/urun-fiyat";
import { getUrunPhotoUrls } from "@/lib/dukkan/urun-photos";
import { ayirKategori } from "@/lib/dukkan/vitrin-kategorileri";
import { vitrinKlasorPath, vitrinUrunPath } from "@/lib/dukkan/vitrin-klasorleri";
import { getVitrinChromeDurumu, getVitrinVerisi, type VitrinVerisi } from "@/lib/dukkan/vitrin-veri";
import { desktopContainerClass } from "@/lib/utils/layout";

type PageProps = {
  params: Promise<{ slug: string; urun: string }>;
};

const ILGILI_URUN_SAYISI = 8;
const META_ACIKLAMA_UZUNLUGU = 155;

function urunBul(veri: VitrinVerisi, urunSlug: string) {
  for (const [id, slug] of veri.urunSluglari) {
    if (slug === urunSlug) {
      const urun = veri.urunler.find((aday) => aday.id === id);
      if (!urun) return null;
      const klasor =
        veri.klasorler.find((aday) => aday.ogeler.some((oge) => oge.tur === "urun" && oge.urun.id === id)) ?? null;
      return { urun, klasor };
    }
  }
  return null;
}

function kisalt(metin: string, uzunluk: number): string {
  const tek = metin.replace(/\s+/g, " ").trim();
  if (tek.length <= uzunluk) return tek;
  const kesik = tek.slice(0, uzunluk - 1);
  const sonBosluk = kesik.lastIndexOf(" ");
  return `${(sonBosluk > uzunluk * 0.6 ? kesik.slice(0, sonBosluk) : kesik).trim()}…`;
}

function urunMetaAciklamasi(veri: VitrinVerisi, urun: VitrinVerisi["urunler"][number]): string {
  const aciklama = urun.urun_aciklama?.trim();
  if (aciklama) return kisalt(aciklama, META_ACIKLAMA_UZUNLUGU);
  const fiyat = urun.fiyat?.trim();
  return `${urun.urun_adi}, ${veri.dukkan.dukkan_adi} mağazasında.${fiyat ? ` Fiyat: ${fiyat}.` : ""} WhatsApp ile hemen bilgi alın.`;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug, urun: urunSlug } = await params;
  const veri = await getVitrinVerisi(slug);
  if (!veri) return NOT_FOUND_STORE_METADATA;

  const bulunan = urunBul(veri, urunSlug);
  if (!bulunan) return NOT_FOUND_STORE_METADATA;

  return buildStoreSubpageSeoMetadata(
    veri.dukkan,
    `urun/${urunSlug}`,
    bulunan.urun.urun_adi,
    urunMetaAciklamasi(veri, bulunan.urun),
    { image: getUrunPhotoUrls(bulunan.urun)[0] ?? null }
  );
}

export default async function UrunPage({ params }: PageProps) {
  const { slug, urun: urunSlug } = await params;
  const veri = await getVitrinVerisi(slug);
  if (!veri) notFound();

  const bulunan = urunBul(veri, urunSlug);
  if (!bulunan) notFound();

  const { urun, klasor } = bulunan;
  const { dukkan } = veri;
  const chrome = await getVitrinChromeDurumu(veri);

  const path = vitrinUrunPath(dukkan.slug, urunSlug);
  const fotograflar = getUrunPhotoUrls(urun);
  const { alt } = ayirKategori(urun.urun_kategorisi);
  const kategoriEtiketi = alt ?? klasor?.ad ?? null;
  const ilgili = klasor
    ? klasor.ogeler
        .filter((oge) => !(oge.tur === "urun" && oge.urun.id === urun.id))
        .slice(0, ILGILI_URUN_SAYISI)
    : [];

  return (
    <>
      <JsonLdScripts
        schemas={[
          buildUrunProductJsonLd({
            name: urun.urun_adi,
            description: urun.urun_aciklama,
            images: fotograflar,
            category: klasor ? (alt ? `${klasor.ad} > ${alt}` : klasor.ad) : null,
            price: parseUrunFiyati(urun.fiyat),
            stokAdedi: urun.stok_adedi,
            shopName: dukkan.dukkan_adi,
            shopSlug: dukkan.slug,
            path,
          }),
          buildStoreBreadcrumbJsonLd(dukkan.slug, dukkan.dukkan_adi, [
            ...(klasor ? [{ name: klasor.ad, segment: `kategori/${klasor.slug}` }] : []),
            { name: urun.urun_adi, segment: `urun/${urunSlug}` },
          ]),
        ]}
      />

      <VitrinChrome shopName={dukkan.dukkan_adi} dukkan={dukkan} {...chrome}>
        <div className={`${desktopContainerClass} relative pb-12 pt-4 lg:pb-16 lg:pt-6`}>
          <VitrinDotGrid />

          <VitrinBreadcrumb
            items={[
              { ad: dukkan.dukkan_adi, href: `/${dukkan.slug}` },
              ...(klasor ? [{ ad: klasor.ad, href: vitrinKlasorPath(dukkan.slug, klasor.slug) }] : []),
              { ad: urun.urun_adi },
            ]}
          />

          <Link
            href={klasor ? vitrinKlasorPath(dukkan.slug, klasor.slug) : `/${dukkan.slug}#urunler`}
            className="-ml-1 mb-3 mt-1 inline-flex min-h-11 items-center gap-1.5 rounded-lg px-1 text-sm font-semibold text-emerald-700 transition hover:text-emerald-800"
          >
            <ArrowLeft className="size-4" aria-hidden />
            {klasor ? `${klasor.ad} kategorisine dön` : "Mağazaya dön"}
          </Link>

          <UrunSayfasiIcerigi
            urun={{
              urunAdi: urun.urun_adi,
              aciklama: urun.urun_aciklama,
              fiyat: urun.fiyat,
              stokAdedi: urun.stok_adedi,
              fotograflar,
              kategoriEtiketi,
              sayfaUrl: `${getPublicSiteUrl()}${path}`,
            }}
            shopName={dukkan.dukkan_adi}
            whatsapp={dukkan.whatsapp ?? null}
            telefon={dukkan.telefon ?? null}
          />

          {klasor && ilgili.length > 0 && (
            <section aria-labelledby="ilgili-urunler" className="mt-14 border-t border-slate-200/60 pt-8 lg:mt-20">
              <div className="mb-5 flex flex-wrap items-end justify-between gap-2">
                <h2 id="ilgili-urunler" className="text-lg font-bold tracking-tight text-slate-900 sm:text-xl">
                  {klasor.ad} kategorisinde diğerleri
                </h2>
                <Link
                  href={vitrinKlasorPath(dukkan.slug, klasor.slug)}
                  className="inline-flex min-h-11 items-center text-sm font-semibold text-emerald-700 hover:text-emerald-800"
                >
                  Tümünü gör ({klasor.ogeler.length})
                </Link>
              </div>
              <KlasorOgeIzgarasi
                ogeler={ilgili}
                shopSlug={dukkan.slug}
                shopName={dukkan.dukkan_adi}
                whatsapp={dukkan.whatsapp ?? dukkan.telefon ?? null}
                urunSluglari={veri.urunSluglari}
              />
            </section>
          )}
        </div>
      </VitrinChrome>
    </>
  );
}
