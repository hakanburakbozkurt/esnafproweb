import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { DukkanOnaylaForm } from "@/app/dukkan-onayla/dukkan-onayla-form";
import { getPublicSiteUrl } from "@/lib/auth/site-url";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Mağazanızı Onaylayın | EsnafPRO",
  robots: { index: false, follow: false },
};

/** Admin'in esnaf adına kurduğu dükkan: esnaf koşulları kendisi onaylar. */
export default async function DukkanOnaylaPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/giris?next=/dukkan-onayla");
  }

  const { data: dukkan } = await supabase
    .from("dukkanlar")
    .select("dukkan_adi, slug, terms_accepted_at")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!dukkan) {
    redirect("/dukkan-ac");
  }
  if (dukkan.terms_accepted_at) {
    redirect("/yonetim");
  }

  return (
    <DukkanOnaylaForm
      dukkanAdi={dukkan.dukkan_adi}
      vitrinUrl={`${getPublicSiteUrl()}/${dukkan.slug}`}
    />
  );
}
