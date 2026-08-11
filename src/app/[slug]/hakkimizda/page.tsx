import { notFound } from "next/navigation";
import { HakkimizdaPageContent } from "@/components/dukkan/vitrin/hakkimizda-page-content";
import { VitrinChrome } from "@/components/dukkan/vitrin/vitrin-chrome";
import { buildFaqPageJsonLd } from "@/lib/dukkan/json-ld";
import { resolveFaqItemsForDukkan } from "@/lib/dukkan/faq";
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
    .select("dukkan_adi, aciklama")
    .eq("slug", slug)
    .eq("aktif", true)
    .maybeSingle();

  if (!dukkan) {
    return { title: "Mağaza Bulunamadı | EsnafPRO" };
  }

  return {
    title: `Hakkımızda | ${dukkan.dukkan_adi} | EsnafPRO`,
    description:
      dukkan.aciklama ?? `${dukkan.dukkan_adi} hakkında bilgi edinin`,
  };
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
  const showPazaryeriNav = await hasPublishedSecondHandDevices(
    supabase,
    dukkan.user_id
  );
  const faqItems = resolveFaqItemsForDukkan(dukkan.hakkimizda_sss ?? [], dukkan);
  const faqSchema = buildFaqPageJsonLd(dukkan.hakkimizda_sss ?? [], dukkan);

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
        showTeknikServisNav={showTeknikServisNav}
        showPazaryeriNav={showPazaryeriNav}
        dukkan={dukkan}
      >
        <HakkimizdaPageContent dukkan={dukkan} faqItems={faqItems} />
      </VitrinChrome>
    </>
  );
}
