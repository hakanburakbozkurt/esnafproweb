import { JsonLdScripts } from "@/components/seo/json-ld-scripts";
import { notFound } from "next/navigation";
import { KatalogPageContent } from "@/components/katalog/katalog-page-content";
import { VitrinChrome } from "@/components/dukkan/vitrin/vitrin-chrome";
import { getKatalogItemsForUser } from "@/lib/katalog/katalog-items";
import {
  buildStoreBreadcrumbJsonLd,
  buildWebPageJsonLd,
} from "@/lib/dukkan/json-ld";
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
    .select("dukkan_adi, slug, adres, banner_url, logo_url, katalog_modu_aktif")
    .eq("slug", slug)
    .eq("aktif", true)
    .maybeSingle();

  if (!dukkan || !dukkan.katalog_modu_aktif) {
    return NOT_FOUND_STORE_METADATA;
  }

  return buildStoreSubpageSeoMetadata(
    dukkan,
    "katalog",
    "Katalog",
    `${dukkan.dukkan_adi} ürün kataloğu — güncel stok ve fiyatlar`
  );
}

export default async function KatalogPage({ params }: PageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: dukkan, error: dukkanError } = await supabase
    .from("dukkanlar")
    .select("*")
    .eq("slug", slug)
    .eq("aktif", true)
    .maybeSingle();

  if (dukkanError || !dukkan || !dukkan.katalog_modu_aktif) {
    notFound();
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isOwner = user?.id === dukkan.user_id;
  const showContactNav = dukkan.iletisim_sss_goster ?? true;
  const showTeknikServisNav = dukkan.teknik_servis_aktif ?? false;
  const showKatalogNav = dukkan.katalog_modu_aktif ?? false;
  const showPazaryeriNav = await hasPublishedSecondHandDevices(supabase, dukkan.user_id);

  const items = await getKatalogItemsForUser(dukkan.user_id);

  return (
    <>
      <JsonLdScripts
        schemas={[
          buildWebPageJsonLd({
            slug: dukkan.slug,
            path: "/katalog",
            name: `Katalog | ${dukkan.dukkan_adi}`,
            description: `${dukkan.dukkan_adi} mağaza ürün kataloğu`,
          }),
          buildStoreBreadcrumbJsonLd(dukkan.slug, dukkan.dukkan_adi, [
            { name: "Katalog", segment: "katalog" },
          ]),
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
        <KatalogPageContent
          shopSlug={dukkan.slug}
          shopName={dukkan.dukkan_adi}
          items={items}
          isOwner={isOwner}
        />
      </VitrinChrome>
    </>
  );
}
