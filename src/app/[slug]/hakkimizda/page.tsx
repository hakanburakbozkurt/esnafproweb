import { JsonLdScripts } from "@/components/seo/json-ld-scripts";
import { notFound } from "next/navigation";
import { HakkimizdaPageContent } from "@/components/dukkan/vitrin/hakkimizda-page-content";
import { VitrinChrome } from "@/components/dukkan/vitrin/vitrin-chrome";
import {
  buildFaqPageJsonLd,
  buildStoreBreadcrumbJsonLd,
  buildWebPageJsonLd,
} from "@/lib/dukkan/json-ld";
import { resolveFaqItemsForDukkan } from "@/lib/dukkan/faq";
import {
  buildStoreSubpageSeoMetadata,
  NOT_FOUND_STORE_METADATA,
} from "@/lib/dukkan/metadata";
import { hasPublishedSecondHandDevices } from "@/lib/dukkan/second-hand-devices";
import { createClient } from "@/lib/supabase/server";
import type { Metadata } from "next";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: dukkan } = await supabase
    .from("dukkanlar")
    .select("dukkan_adi, slug, adres, banner_url, logo_url, aciklama")
    .eq("slug", slug)
    .eq("aktif", true)
    .maybeSingle();

  if (!dukkan) {
    return NOT_FOUND_STORE_METADATA;
  }

  return buildStoreSubpageSeoMetadata(
    dukkan,
    "hakkimizda",
    "Hakkımızda",
    dukkan.aciklama ?? `${dukkan.dukkan_adi} hakkında bilgi edinin`
  );
}

export default async function HakkimizdaPage({ params }: PageProps) {
  const { slug } = await params;
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
  const showPazaryeriNav = await hasPublishedSecondHandDevices(
    supabase,
    dukkan.user_id
  );
  const faqItems = resolveFaqItemsForDukkan(dukkan.hakkimizda_sss ?? [], dukkan);
  const faqSchema = buildFaqPageJsonLd(dukkan.hakkimizda_sss ?? [], dukkan);

  return (
    <>
      <JsonLdScripts
        schemas={[
          buildWebPageJsonLd({
            slug: dukkan.slug,
            path: "/hakkimizda",
            name: `Hakkımızda | ${dukkan.dukkan_adi}`,
            description: dukkan.aciklama,
          }),
          buildStoreBreadcrumbJsonLd(dukkan.slug, dukkan.dukkan_adi, [
            { name: "Hakkımızda", segment: "hakkimizda" },
          ]),
          faqSchema,
        ]}
      />

      <VitrinChrome
        shopName={dukkan.dukkan_adi}
        isOwner={isOwner}
        showContactNav={showContactNav}
        showTeknikServisNav={showTeknikServisNav}
        showPazaryeriNav={showPazaryeriNav}
        showKatalogNav={showKatalogNav}
        dukkan={dukkan}
      >
        <HakkimizdaPageContent dukkan={dukkan} faqItems={faqItems} />
      </VitrinChrome>
    </>
  );
}
