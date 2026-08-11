import { notFound } from "next/navigation";
import { TeknikServisPageContent } from "@/components/dukkan/vitrin/teknik-servis-page-content";
import { VitrinChrome } from "@/components/dukkan/vitrin/vitrin-chrome";
import { resolveFaqItemsForDukkan } from "@/lib/dukkan/faq";
import { buildFaqPageJsonLd } from "@/lib/dukkan/json-ld";
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
    .select("dukkan_adi")
    .eq("slug", slug)
    .eq("aktif", true)
    .maybeSingle();

  if (!dukkan) {
    return { title: "Mağaza Bulunamadı | EsnafPRO" };
  }

  return {
    title: `Teknik Servis | ${dukkan.dukkan_adi} | EsnafPRO`,
    description: `${dukkan.dukkan_adi} teknik servis ve cihaz takip sayfası`,
  };
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
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}

      <VitrinChrome
        shopName={dukkan.dukkan_adi}
        isOwner={isOwner}
        showContactNav={showContactNav}
        showTeknikServisNav
        showPazaryeriNav={showPazaryeriNav}
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
