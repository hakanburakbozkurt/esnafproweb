import { JsonLdScripts } from "@/components/seo/json-ld-scripts";
import { notFound, permanentRedirect } from "next/navigation";
import { SecondHandDeviceDetailContent } from "@/components/dukkan/vitrin/second-hand-device-detail-content";
import { VitrinChrome } from "@/components/dukkan/vitrin/vitrin-chrome";
import {
  buildProductJsonLd,
  buildStoreBreadcrumbJsonLd,
} from "@/lib/dukkan/json-ld";
import {
  buildLocalAreaLabel,
  buildStoreSubpageSeoMetadata,
  NOT_FOUND_STORE_METADATA,
} from "@/lib/dukkan/metadata";
import { kisaKonumEtiketi } from "@/lib/dukkan/konum";
import {
  fetchPublishedSecondHandDeviceBySlug,
  formatListingTypeLabel,
  formatSecondHandPrice,
  getSecondHandDeviceHref,
  getSecondHandDeviceImage,
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
    .select("*")
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
  // Başlık arama diline göre: "iPad 9 64 GB İkinci El — Esenyurt"
  const durum = formatListingTypeLabel(device.listing_type);
  const kapasite = device.capacity?.trim();
  const baslikGovdesi = [
    title,
    kapasite && !title.toLocaleLowerCase("tr-TR").includes(kapasite.toLocaleLowerCase("tr-TR")) ? kapasite : null,
    title.toLocaleLowerCase("tr-TR").includes(durum.toLocaleLowerCase("tr-TR")) ? null : durum,
  ]
    .filter(Boolean)
    .join(" ");
  const kisaAlan = kisaKonumEtiketi(dukkan);
  const alan = buildLocalAreaLabel(dukkan);
  const fiyat = device.sale_price != null ? formatSecondHandPrice(device.sale_price) : null;

  return buildStoreSubpageSeoMetadata(
    dukkan,
    deviceSegment,
    kisaAlan ? `${baslikGovdesi} — ${kisaAlan}` : baslikGovdesi,
    device.web_description?.trim() ||
      `${baslikGovdesi}${fiyat ? ` ${fiyat}` : ""} — ${dukkan.dukkan_adi}${alan ? `, ${alan}` : ""}. ${durum} cihaz ilanı; ekspertiz bilgileri ve fotoğraflar sayfada, WhatsApp'tan hemen sorun.`,
    { image: getSecondHandDeviceImage(device) }
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

  // Eski adres (/pazaryeri/<id>) kalıcı olarak okunabilir adrese yönlenir; Google tek adresi tutar.
  const asilSlug = device.web_slug?.trim();
  if (asilSlug && deviceSlug !== asilSlug) {
    permanentRedirect(getSecondHandDeviceHref(dukkan.slug, device));
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
            shopAdres: dukkan.adres,
            shopSemt: dukkan.semt,
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
