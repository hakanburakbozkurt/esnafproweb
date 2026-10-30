import { JsonLdScripts } from "@/components/seo/json-ld-scripts";
import { notFound, redirect } from "next/navigation";
import { VitrinChrome } from "@/components/dukkan/vitrin/vitrin-chrome";
import { VitrinPageContent } from "@/components/dukkan/vitrin/vitrin-page-content";
import { buildDukkanJsonLd, buildFaqPageJsonLd } from "@/lib/dukkan/json-ld";
import { resolveFaqItemsForDukkan } from "@/lib/dukkan/faq";
import { getPublicServiceDevice } from "@/lib/dukkan/service-device-public";
import {
  buildStoreHomeSeoMetadata,
  NOT_FOUND_STORE_METADATA,
} from "@/lib/dukkan/metadata";
import { vitrinUrunPath } from "@/lib/dukkan/vitrin-klasorleri";
import { getVitrinVerisi } from "@/lib/dukkan/vitrin-veri";
import { createClient } from "@/lib/supabase/server";
import type { Metadata } from "next";

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ servis?: string; urun?: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const veri = await getVitrinVerisi(slug);

  if (!veri) {
    return NOT_FOUND_STORE_METADATA;
  }

  return buildStoreHomeSeoMetadata(veri.dukkan);
}

export default async function StoreVitrinPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { servis, urun } = await searchParams;
  const veri = await getVitrinVerisi(slug);

  if (!veri) {
    notFound();
  }

  const { dukkan, klasorler, cihazlar, urunSluglari } = veri;

  // Eski paylaşım bağlantıları (?urun=<id>) ürünün kendi sayfasına taşınır.
  const eskiUrunId = urun?.trim();
  if (eskiUrunId) {
    const urunSlug = urunSluglari.get(eskiUrunId);
    if (urunSlug) redirect(vitrinUrunPath(dukkan.slug, urunSlug));
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isOwner = user?.id === dukkan.user_id;
  const showContactNav = dukkan.iletisim_sss_goster ?? true;
  const showTeknikServisNav = dukkan.teknik_servis_aktif ?? false;
  const showKatalogNav = dukkan.katalog_modu_aktif ?? false;
  const showPazaryeriNav = cihazlar.length > 0;

  let qrDevice = null;
  const servisCode = servis?.trim();

  if (servisCode) {
    qrDevice = await getPublicServiceDevice(supabase, servisCode);
  }

  const jsonLdSchemas = buildDukkanJsonLd(dukkan);

  const faqSchema = buildFaqPageJsonLd(dukkan.anasayfa_sss ?? [], dukkan);
  if (faqSchema) jsonLdSchemas.push(faqSchema);

  const faqItems = resolveFaqItemsForDukkan(dukkan.anasayfa_sss ?? [], dukkan);

  return (
    <>
      <JsonLdScripts schemas={jsonLdSchemas} />

      <VitrinChrome
        shopName={dukkan.dukkan_adi}
        isOwner={isOwner}
        showContactNav={showContactNav}
        showTeknikServisNav={showTeknikServisNav}
        showPazaryeriNav={showPazaryeriNav}
        showKatalogNav={showKatalogNav}
        dukkan={dukkan}
      >
        <VitrinPageContent
          dukkan={dukkan}
          klasorler={klasorler}
          qrDevice={qrDevice}
          faqItems={faqItems}
        />
      </VitrinChrome>
    </>
  );
}
