import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { AuthRequiredCard } from "@/components/auth/auth-required-card";
import { HaritaPazariClient } from "@/components/harita-pazari/harita-pazari-client";
import {
  GoogleBusinessWarning,
  KonumWarning,
  ProUpgradeCard,
} from "@/components/harita-pazari/harita-pazari-durum-kartlari";
import { YonetimPageShell } from "@/components/yonetim/yonetim-page-shell";
import { getShopPlan } from "@/lib/abonelik/get-shop-plan";
import { isWholesalerAccount, resolveWholesalerPath } from "@/lib/auth/wholesaler";
import { hasGoogleBusinessUrl } from "@/lib/dukkan/google-business-url";
import { logDukkanAction } from "@/lib/dukkan/logger";
import { createClient } from "@/lib/supabase/server";
import { loadProfileHealthInput } from "@/lib/yonetim/health-input";

export const metadata: Metadata = {
  title: "Harita Pazarı",
  robots: { index: false, follow: false },
};

const title = (
  <>
    Harita <span className="text-emerald-600">Pazarı</span>
  </>
);
const description = "Google Haritalar'da bölgendeki sıranı ve rakiplerini takip et.";

export default async function HaritaPazariPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <YonetimPageShell showYonetimNav={false} title={title} description={description}>
        <AuthRequiredCard
          description="Harita Pazarı'nı görmek için giriş yapmalısınız."
          loginHref="/giris?next=/yonetim/harita-pazari"
        />
      </YonetimPageShell>
    );
  }

  if (await isWholesalerAccount(supabase, user)) {
    redirect(await resolveWholesalerPath(supabase, user.id));
  }

  const { data: dukkan, error } = await supabase
    .from("dukkanlar")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    logDukkanAction("haritaPazariPage", "shop lookup failed", { error: error.message });
  }

  if (!dukkan) {
    return (
      <YonetimPageShell showYonetimNav={false} title={title} description={description}>
        <div className="max-w-lg rounded-2xl border border-slate-200/60 bg-white/80 px-6 py-8 text-center">
          <h2 className="text-lg font-semibold text-slate-900">
            {error ? "Mağaza bilgileri yüklenemedi" : "Henüz mağazanız yok"}
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            {error
              ? "Lütfen sayfayı yenileyin."
              : "Harita Pazarı'nı kullanmak için önce mağaza açmanız gerekiyor."}
          </p>
          {!error && (
            <Link
              href="/dukkan-ac"
              className="mt-6 inline-flex rounded-full bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-slate-800"
            >
              Mağaza Aç
            </Link>
          )}
        </div>
      </YonetimPageShell>
    );
  }

  const plan = await getShopPlan(supabase, dukkan.id);

  let content: ReactNode;
  if (!plan.ucretliAktif) {
    content = <ProUpgradeCard suresiDoldu={plan.tier !== "free"} />;
  } else if (!hasGoogleBusinessUrl(dukkan.google_business_url)) {
    content = <GoogleBusinessWarning />;
  } else if (dukkan.enlem === null || dukkan.boylam === null) {
    content = <KonumWarning />;
  } else {
    const [healthInput, ayarlarResult] = await Promise.all([
      loadProfileHealthInput(supabase, dukkan),
      supabase
        .from("harita_pazari_rapor_ayarlari")
        .select("eposta_aktif, ayrintili, gonderim_gunu, gonderim_saati")
        .eq("dukkan_id", dukkan.id)
        .maybeSingle(),
    ]);

    if (ayarlarResult.error) {
      logDukkanAction("haritaPazariPage", "report settings lookup failed", {
        dukkanId: dukkan.id,
        error: ayarlarResult.error.message,
      });
    }

    content = (
      <HaritaPazariClient
        tier={plan.tier}
        email={user.email ?? null}
        healthInput={healthInput}
        raporAyarlari={
          ayarlarResult.data ?? {
            eposta_aktif: true,
            ayrintili: false,
            gonderim_gunu: 1,
            gonderim_saati: 9,
          }
        }
      />
    );
  }

  return (
    <YonetimPageShell title={title} description={description}>
      {content}
    </YonetimPageShell>
  );
}
