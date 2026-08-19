import { JsonLdScripts } from "@/components/seo/json-ld-scripts";
import { notFound } from "next/navigation";
import { TeknikServisPageContent } from "@/components/dukkan/vitrin/teknik-servis-page-content";
import { VitrinChrome } from "@/components/dukkan/vitrin/vitrin-chrome";
import { resolveFaqItemsForDukkan } from "@/lib/dukkan/faq";
import {
  buildFaqPageJsonLd,
  buildStoreBreadcrumbJsonLd,
  buildWebPageJsonLd,
} from "@/lib/dukkan/json-ld";
import {
  buildStoreSubpageSeoMetadata,
  NOT_FOUND_STORE_METADATA,
} from "@/lib/dukkan/metadata";
import { hasPublishedSecondHandDevices } from "@/lib/dukkan/second-hand-devices";
import { getPublicServiceDevice } from "@/lib/dukkan/service-device-public";
import { createClient } from "@/lib/supabase/server";
import type { Metadata } from "next";

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ servis?: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: dukkan } = await supabase
    .from("dukkanlar")
    .select("dukkan_adi, slug, adres, banner_url, logo_url, approval_status")
    .eq("slug", slug)
    .eq("aktif", true)
    .maybeSingle();

  if (!dukkan) {
    return NOT_FOUND_STORE_METADATA;
  }

  return buildStoreSubpageSeoMetadata(
    dukkan,
    "teknik-servis",
    "Teknik Servis",
    `${dukkan.dukkan_adi} telefon tamiri, ekran değişimi ve cihaz servis takibi`
  );
}

export default async function TeknikServisPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { servis } = await searchParams;
  const supabase = await createClient();

  const { data: dukkan, error: dukkanError } = await supabase
    .from("dukkanlar")
    .select("*")
    .eq("slug", slug)
    .eq("aktif", true)
    .maybeSingle();

  if (dukkanError || !dukkan) {
    notFound();
  }

  if (!dukkan.teknik_servis_aktif) {
    notFound();
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isOwner = user?.id === dukkan.user_id;
  const showContactNav = dukkan.iletisim_sss_goster ?? true;
  const showKatalogNav = dukkan.katalog_modu_aktif ?? false;
  const showPazaryeriNav = await hasPublishedSecondHandDevices(
    supabase,
    dukkan.user_id
  );
  const servisFaqItems = resolveFaqItemsForDukkan(
    dukkan.teknik_servis_sss ?? [],
    dukkan
  );
  const faqSchema = buildFaqPageJsonLd(dukkan.teknik_servis_sss ?? [], dukkan);

  let qrDevice = null;
  const servisCode = servis?.trim();

  if (servisCode) {
    qrDevice = await getPublicServiceDevice(supabase, servisCode);
  }

  return (
    <>
      <JsonLdScripts
        schemas={[
          buildWebPageJsonLd({
            slug: dukkan.slug,
            path: "/teknik-servis",
            name: `Teknik Servis | ${dukkan.dukkan_adi}`,
            description: `${dukkan.dukkan_adi} telefon ve cihaz tamiri`,
          }),
          buildStoreBreadcrumbJsonLd(dukkan.slug, dukkan.dukkan_adi, [
            { name: "Teknik Servis", segment: "teknik-servis" },
          ]),
          faqSchema,
        ]}
      />

      <VitrinChrome
        shopName={dukkan.dukkan_adi}
        isOwner={isOwner}
        showContactNav={showContactNav}
        showTeknikServisNav
        showPazaryeriNav={showPazaryeriNav}
        showKatalogNav={showKatalogNav}
        dukkan={dukkan}
      >
        <TeknikServisPageContent
          dukkan={dukkan}
          faqItems={servisFaqItems}
          qrDevice={qrDevice}
        />
      </VitrinChrome>
    </>
  );
}
