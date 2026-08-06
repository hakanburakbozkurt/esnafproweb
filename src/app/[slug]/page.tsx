import { notFound } from "next/navigation";
import { VitrinChrome } from "@/components/dukkan/vitrin/vitrin-chrome";
import { VitrinPageContent } from "@/components/dukkan/vitrin/vitrin-page-content";
import { buildDukkanJsonLd, buildFaqPageJsonLd } from "@/lib/dukkan/json-ld";
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
    .select("dukkan_adi, aciklama")
    .eq("slug", slug)
    .eq("aktif", true)
    .maybeSingle();

  if (!dukkan) {
    return { title: "Mağaza Bulunamadı | EsnafPRO" };
  }

  return {
    title: `${dukkan.dukkan_adi} | EsnafPRO`,
    description: dukkan.aciklama ?? `${dukkan.dukkan_adi} dijital vitrin sayfası`,
  };
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
  const faqSchema = buildFaqPageJsonLd(dukkan.anasayfa_sss ?? []);
  if (faqSchema) jsonLdSchemas.push(faqSchema);

  const faqItems = dukkan.anasayfa_sss ?? [];

  return (
    <>
      {jsonLdSchemas.map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}

      <VitrinChrome
        shopName={dukkan.dukkan_adi}
        isOwner={isOwner}
        showContactNav={showContactNav}
        showTeknikServisNav={showTeknikServisNav}
        showPazaryeriNav={showPazaryeriNav}
        dukkan={dukkan}
      >
        <VitrinPageContent
          dukkan={dukkan}
          urunler={urunler}
          qrDevice={qrDevice}
          faqItems={faqItems}
        />
      </VitrinChrome>
    </>
  );
}
