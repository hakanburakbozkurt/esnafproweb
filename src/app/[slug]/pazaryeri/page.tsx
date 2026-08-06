import { notFound } from "next/navigation";
import { PazaryeriPageContent } from "@/components/dukkan/vitrin/pazaryeri-page-content";
import { VitrinChrome } from "@/components/dukkan/vitrin/vitrin-chrome";
import { fetchPublishedSecondHandDevices } from "@/lib/dukkan/second-hand-devices";
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
    .select("dukkan_adi")
    .eq("slug", slug)
    .eq("aktif", true)
    .maybeSingle();

  if (!dukkan) {
    return { title: "Mağaza Bulunamadı | EsnafPRO" };
  }

  return {
    title: `Pazaryeri | ${dukkan.dukkan_adi} | EsnafPRO`,
    description: `${dukkan.dukkan_adi} ikinci el cihaz ilanları`,
  };
}

export default async function PazaryeriPage({ params }: PageProps) {
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

  const devices = await fetchPublishedSecondHandDevices(supabase, dukkan.user_id);
  const showPazaryeriNav = devices.length > 0;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isOwner = user?.id === dukkan.user_id;
  const showContactNav = dukkan.iletisim_sss_goster ?? true;
  const showTeknikServisNav = dukkan.teknik_servis_aktif ?? false;

  return (
    <VitrinChrome
      shopName={dukkan.dukkan_adi}
      isOwner={isOwner}
      showContactNav={showContactNav}
      showTeknikServisNav={showTeknikServisNav}
      showPazaryeriNav={showPazaryeriNav}
      dukkan={dukkan}
    >
      <PazaryeriPageContent dukkan={dukkan} devices={devices} />
    </VitrinChrome>
  );
}
