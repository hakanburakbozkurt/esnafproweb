import { JsonLdScripts } from "@/components/seo/json-ld-scripts";
import { notFound } from "next/navigation";
import { VitrinChrome } from "@/components/dukkan/vitrin/vitrin-chrome";
import { VitrinPageContent } from "@/components/dukkan/vitrin/vitrin-page-content";
import { buildDukkanJsonLd, buildFaqPageJsonLd } from "@/lib/dukkan/json-ld";
import {
  loadStoreGoogleReviews,
} from "@/lib/google-reviews/get-google-reviews";
import { mergeGoogleReviewsIntoLocalBusiness } from "@/lib/google-reviews/json-ld";
import { GoogleReviewsSection } from "@/components/dukkan/vitrin/google-reviews-section";
import { normalizeShopApprovalStatus } from "@/lib/dukkan/approval-status";
import { desktopContainerClass } from "@/lib/utils/layout";
import { resolveFaqItemsForDukkan } from "@/lib/dukkan/faq";
import { hasPublishedSecondHandDevices } from "@/lib/dukkan/second-hand-devices";
import { getPublicServiceDevice } from "@/lib/dukkan/service-device-public";
import {
  buildStoreHomeSeoMetadata,
  NOT_FOUND_STORE_METADATA,
} from "@/lib/dukkan/metadata";
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
    .select(
      "dukkan_adi, aciklama, meta_title, meta_description, slug, adres, banner_url, logo_url, approval_status"
    )
    .eq("slug", slug)
    .eq("aktif", true)
    .maybeSingle();

  if (!dukkan) {
    return NOT_FOUND_STORE_METADATA;
  }

  return buildStoreHomeSeoMetadata(dukkan);
}

export default async function StoreVitrinPage({ params, searchParams }: PageProps) {
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

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isOwner = user?.id === dukkan.user_id;
  const showContactNav = dukkan.iletisim_sss_goster ?? true;
  const showTeknikServisNav = dukkan.teknik_servis_aktif ?? false;
  const showKatalogNav = dukkan.katalog_modu_aktif ?? false;

  const [{ data: urunler }, showPazaryeriNav] = await Promise.all([
    supabase
      .from("dukkan_urunleri")
      .select("*")
      .eq("dukkan_id", dukkan.id)
      .eq("aktif", true)
      .order("sira", { ascending: true }),
    hasPublishedSecondHandDevices(supabase, dukkan.user_id),
  ]);

  let qrDevice = null;
  const servisCode = servis?.trim();

  if (servisCode) {
    qrDevice = await getPublicServiceDevice(supabase, servisCode);
  }

  const jsonLdSchemas = buildDukkanJsonLd(dukkan);
  const googleReviews = await loadStoreGoogleReviews(supabase, dukkan);
  const approvalStatus = normalizeShopApprovalStatus(dukkan.approval_status);

  if (jsonLdSchemas[0] && googleReviews) {
    jsonLdSchemas[0] = mergeGoogleReviewsIntoLocalBusiness(
      jsonLdSchemas[0],
      googleReviews,
      approvalStatus
    );
  }

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
          urunler={urunler}
          qrDevice={qrDevice}
          faqItems={faqItems}
        />

        <div className={`${desktopContainerClass} pb-10 lg:pb-14`}>
          <GoogleReviewsSection
            dukkan={dukkan}
            bundle={googleReviews}
            className="mt-12 lg:mt-16"
          />
        </div>
      </VitrinChrome>
    </>
  );
}
