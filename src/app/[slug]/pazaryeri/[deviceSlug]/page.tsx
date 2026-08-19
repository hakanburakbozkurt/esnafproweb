import { JsonLdScripts } from "@/components/seo/json-ld-scripts";
import { notFound } from "next/navigation";
import { SecondHandDeviceDetailContent } from "@/components/dukkan/vitrin/second-hand-device-detail-content";
import { VitrinChrome } from "@/components/dukkan/vitrin/vitrin-chrome";
import {
  buildProductJsonLd,
  buildStoreBreadcrumbJsonLd,
} from "@/lib/dukkan/json-ld";
import {
  buildStoreSubpageSeoMetadata,
  NOT_FOUND_STORE_METADATA,
} from "@/lib/dukkan/metadata";
import {
  fetchPublishedSecondHandDeviceBySlug,
  getSecondHandDeviceHref,
  getSecondHandDeviceTitle,
  hasPublishedSecondHandDevices,
} from "@/lib/dukkan/second-hand-devices";
import { createClient } from "@/lib/supabase/server";
import type { Metadata } from "next";

type PageProps = {
  params: Promise<{ slug: string; deviceSlug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug, deviceSlug } = await params;
  const supabase = await createClient();

  const { data: dukkan } = await supabase
    .from("dukkanlar")
    .select("dukkan_adi, slug, adres, banner_url, logo_url, user_id, approval_status")
    .eq("slug", slug)
    .eq("aktif", true)
    .maybeSingle();

  if (!dukkan) {
    return NOT_FOUND_STORE_METADATA;
  }

  const device = await fetchPublishedSecondHandDeviceBySlug(
    supabase,
    dukkan.user_id,
    deviceSlug
  );

  if (!device) {
    return { title: "İlan Bulunamadı | EsnafPRO" };
  }

  const title = getSecondHandDeviceTitle(device);
  const deviceSegment = `pazaryeri/${device.web_slug?.trim() || device.id}`;

  return buildStoreSubpageSeoMetadata(
    dukkan,
    deviceSegment,
    title,
    device.web_description?.trim() ??
      `${dukkan.dukkan_adi} ikinci el cihaz ilanı: ${title}`,
    { image: device.image_urls?.[0] ?? null }
  );
}

export default async function PazaryeriDevicePage({ params }: PageProps) {
  const { slug, deviceSlug } = await params;
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

  const device = await fetchPublishedSecondHandDeviceBySlug(
    supabase,
    dukkan.user_id,
    deviceSlug
  );

  if (!device) {
    notFound();
  }

  const showPazaryeriNav = await hasPublishedSecondHandDevices(
    supabase,
    dukkan.user_id
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isOwner = user?.id === dukkan.user_id;
  const showContactNav = dukkan.iletisim_sss_goster ?? true;
  const showTeknikServisNav = dukkan.teknik_servis_aktif ?? false;
  const showKatalogNav = dukkan.katalog_modu_aktif ?? false;

  const devicePath = getSecondHandDeviceHref(dukkan.slug, device);
  const deviceTitle = getSecondHandDeviceTitle(device);
  const deviceSegment = `pazaryeri/${device.web_slug?.trim() || device.id}`;

  return (
    <>
      <JsonLdScripts
        schemas={[
          buildProductJsonLd({
            device,
            shopName: dukkan.dukkan_adi,
            shopSlug: dukkan.slug,
            devicePath,
          }),
          buildStoreBreadcrumbJsonLd(dukkan.slug, dukkan.dukkan_adi, [
            { name: "Pazaryeri", segment: "pazaryeri" },
            { name: deviceTitle, segment: deviceSegment },
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
        <SecondHandDeviceDetailContent dukkan={dukkan} device={device} />
      </VitrinChrome>
    </>
  );
}
