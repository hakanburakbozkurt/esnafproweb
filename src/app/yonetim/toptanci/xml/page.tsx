import { redirect } from "next/navigation";
import { ToptanciXmlPanelLoader } from "@/app/yonetim/toptanci/xml/toptanci-xml-panel";
import { AuthRequiredCard } from "@/components/auth/auth-required-card";
import { SubPageShell } from "@/components/layout/sub-page-shell";
import {
  isWholesalerAccount,
  WHOLESALER_ONBOARDING_PATH,
} from "@/lib/auth/wholesaler";
import { hasToptanciProfile } from "@/lib/toptanci/get-toptanci";
import { createClient } from "@/lib/supabase/server";

const shellProps = {
  title: (
    <>
      XML / <span className="text-emerald-600">Feed Entegrasyonu</span>
    </>
  ),
  description:
    "Ürün stok ve fiyat güncellemelerini tek merkezden yönetin. XML linkinizi ekleyin veya dosya yükleyerek senkronizasyonu başlatın.",
  contentWidth: "2xl" as const,
  centerHeader: true,
};

export default async function ToptanciXmlPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <SubPageShell {...shellProps}>
        <AuthRequiredCard
          description="XML yönetim paneline erişmek için toptancı hesabınızla giriş yapmalısınız."
          loginHref="/giris?role=toptanci&next=/yonetim/toptanci/xml"
        />
      </SubPageShell>
    );
  }

  if (!(await isWholesalerAccount(supabase, user))) {
    redirect("/dukkan-ac");
  }

  if (!(await hasToptanciProfile(supabase, user.id))) {
    redirect(WHOLESALER_ONBOARDING_PATH);
  }

  return (
    <SubPageShell {...shellProps}>
      <ToptanciXmlPanelLoader />
    </SubPageShell>
  );
}
