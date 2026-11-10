import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { GooglePlaceClient } from "@/app/dukkan-ayarlari/google-place/google-place-client";
import { AuthRequiredCard } from "@/components/auth/auth-required-card";
import { YonetimPageShell } from "@/components/yonetim/yonetim-page-shell";
import { isWholesalerAccount, WHOLESALER_ONBOARDING_PATH } from "@/lib/auth/wholesaler";
import { logDukkanAction } from "@/lib/dukkan/logger";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Google Place ID",
  robots: { index: false, follow: false },
};

const title = (
  <>
    Google <span className="text-emerald-600">Place Bul</span>
  </>
);
const description =
  "Mağazanızın Google Haritalar kaydını bulun ve Harita Pazarı için bağlayın.";

export default async function GooglePlacePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <YonetimPageShell showYonetimNav={false} title={title} description={description}>
        <AuthRequiredCard
          description="Google Place ID bağlamak için giriş yapmalısınız."
          loginHref="/giris?next=/dukkan-ayarlari/google-place"
        />
      </YonetimPageShell>
    );
  }

  if (await isWholesalerAccount(supabase, user)) {
    redirect(WHOLESALER_ONBOARDING_PATH);
  }

  const { data: dukkan, error } = await supabase
    .from("dukkanlar")
    .select("id, dukkan_adi, google_place_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    logDukkanAction("googlePlacePage", "shop lookup failed", { error: error.message });
  }

  if (!dukkan) {
    return (
      <YonetimPageShell showYonetimNav={false} title={title} description={description}>
        <p className="text-sm text-slate-600">
          {error ? "Mağaza bilgileri yüklenemedi. Sayfayı yenileyin." : "Bu hesaba bağlı mağaza yok."}
        </p>
      </YonetimPageShell>
    );
  }

  return (
    <YonetimPageShell title={title} description={description}>
      <div className="mx-auto w-full max-w-2xl">
        <GooglePlaceClient
          dukkanAdi={dukkan.dukkan_adi}
          mevcutPlaceId={dukkan.google_place_id}
        />
      </div>
    </YonetimPageShell>
  );
}
