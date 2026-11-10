import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CihazlarClient } from "@/app/yonetim/cihazlar/cihazlar-client";
import { UrunListesiFormu } from "@/app/yonetim/urunler/urun-listesi-formu";
import { UrunlerSekmeNavi } from "@/app/yonetim/urunler/urunler-sekme-navi";
import { AuthRequiredCard } from "@/components/auth/auth-required-card";
import { KatalogBulkUploadPanel } from "@/components/katalog/katalog-bulk-upload-panel";
import { YonetimPageShell } from "@/components/yonetim/yonetim-page-shell";
import { listOwnerSecondHandDevices } from "@/lib/cihaz/actions";
import { isWholesalerAccount, resolveWholesalerPath } from "@/lib/auth/wholesaler";
import { logDukkanAction } from "@/lib/dukkan/logger";
import { createClient } from "@/lib/supabase/server";
import { parseUrunlerTab, URUNLER_PATH } from "@/lib/yonetim/nav";
import type { IkinciElCihaz } from "@/lib/cihaz/types";
import type { DukkanUrunu } from "@/types/database.types";

export const metadata: Metadata = {
  title: "Ürünler",
  robots: { index: false, follow: false },
};

type PageProps = {
  searchParams: Promise<{ sekme?: string | string[] }>;
};

const SHELL_TITLE = (
  <>
    Ürün <span className="text-emerald-600">Yönetimi</span>
  </>
);

/**
 * Vitrin ürünleri, toplu katalog ve ikinci el cihazlar tek rotada toplanır.
 * Hangi sekmenin açık olduğunu `?sekme=` belirler; yalnızca o sekmenin verisi
 * yüklenir, böylece sayfa açılışı üç sorgu birden beklemez.
 */
export default async function UrunlerPage({ searchParams }: PageProps) {
  const { sekme } = await searchParams;
  const activeTab = parseUrunlerTab(sekme);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <YonetimPageShell showYonetimNav={false} title={SHELL_TITLE}>
        <AuthRequiredCard
          description="Ürünlerinizi yönetmek için giriş yapmalısınız."
          loginHref={`/giris?next=${URUNLER_PATH}`}
        />
      </YonetimPageShell>
    );
  }

  if (await isWholesalerAccount(supabase, user)) {
    redirect(await resolveWholesalerPath(supabase, user.id));
  }

  const { data: dukkan, error: dukkanError } = await supabase
    .from("dukkanlar")
    .select("id, slug, dukkan_adi, katalog_modu_aktif, pazaryeri_vitrin_aktif")
    .eq("user_id", user.id)
    .maybeSingle();

  if (dukkanError) {
    logDukkanAction("urunlerPage", "shop lookup failed", {
      error: dukkanError.message,
    });
  }

  if (!dukkan) {
    return (
      <YonetimPageShell showYonetimNav={false} title={SHELL_TITLE}>
        <div className="max-w-lg rounded-2xl border border-slate-200/60 bg-white/80 px-6 py-8 text-center lg:px-8">
          <h2 className="text-lg font-semibold text-slate-900 lg:text-xl">
            {dukkanError ? "Mağaza yüklenemedi" : "Henüz mağazanız yok"}
          </h2>
          <p className="mt-2 text-sm text-slate-500 lg:text-base">
            {dukkanError
              ? "Mağaza bilgileri yüklenemedi. Lütfen sayfayı yenileyin."
              : "Ürün ekleyebilmek için önce mağaza açmanız gerekiyor."}
          </p>
          {!dukkanError && (
            <Link
              href="/dukkan-ac"
              className="mt-6 inline-flex min-h-11 items-center rounded-full bg-slate-900 px-5 text-sm font-medium text-white transition-colors hover:bg-slate-800"
            >
              Mağaza Aç
            </Link>
          )}
        </div>
      </YonetimPageShell>
    );
  }

  /* --- Yalnızca açık sekmenin verisi --- */

  let urunler: DukkanUrunu[] = [];
  let urunlerError: string | null = null;

  if (activeTab === "urunler") {
    const { data, error } = await supabase
      .from("dukkan_urunleri")
      .select("*")
      .eq("dukkan_id", dukkan.id)
      .eq("aktif", true)
      .order("sira", { ascending: true });

    if (error) {
      logDukkanAction("urunlerPage", "products lookup failed", {
        dukkanId: dukkan.id,
        error: error.message,
      });
      urunlerError = "Ürünler yüklenemedi. Kaydetmeden önce sayfayı yenileyin.";
    }
    urunler = data ?? [];
  }

  let cihazlar: IkinciElCihaz[] = [];
  let cihazlarError: string | null = null;

  if (activeTab === "ikinci-el") {
    const result = await listOwnerSecondHandDevices();
    if (result.ok) {
      cihazlar = result.devices;
    } else {
      cihazlarError = result.error;
    }
  }

  return (
    <YonetimPageShell
      title={SHELL_TITLE}
      description="Vitrin ürünleri, toplu katalog ve ikinci el cihazlar tek yerde."
    >
      <div className="mx-auto w-full max-w-6xl space-y-6">
        <UrunlerSekmeNavi activeTab={activeTab} />

        {activeTab === "urunler" && (
          <UrunListesiFormu
            dukkanId={dukkan.id}
            shopSlug={dukkan.slug}
            urunler={urunler}
            loadError={urunlerError}
          />
        )}

        {activeTab === "katalog" && (
          <div className="space-y-5">
            {!dukkan.katalog_modu_aktif && (
              <p className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                Katalog modu henüz aktif değil. Ürün ekleyebilirsiniz; vitrinde
                görünmesi için{" "}
                <Link href="/dukkan-ayarlari" className="font-semibold underline">
                  mağaza ayarlarından
                </Link>{" "}
                Katalog Modunu açın.
              </p>
            )}

            <KatalogBulkUploadPanel
              shopSlug={dukkan.slug}
              katalogHref={`/${dukkan.slug}/katalog`}
            />
          </div>
        )}

        {activeTab === "ikinci-el" && (
          <div className="space-y-5">
            {cihazlarError && (
              <p
                role="alert"
                className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                {cihazlarError}
              </p>
            )}

            <CihazlarClient
              initialDevices={cihazlar}
              shopSlug={dukkan.slug}
              pazaryeriVitrinAktif={dukkan.pazaryeri_vitrin_aktif ?? true}
            />
          </div>
        )}
      </div>
    </YonetimPageShell>
  );
}
