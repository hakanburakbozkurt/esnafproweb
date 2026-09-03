import { redirect } from "next/navigation";
import Link from "next/link";
import { AuthRequiredCard } from "@/components/auth/auth-required-card";
import { YonetimPageShell } from "@/components/yonetim/yonetim-page-shell";
import { KatalogBulkUploadPanel } from "@/components/katalog/katalog-bulk-upload-panel";
import { isWholesalerAccount, resolveWholesalerPath } from "@/lib/auth/wholesaler";
import { createClient } from "@/lib/supabase/server";

export default async function YonetimKatalogPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <YonetimPageShell showYonetimNav={false} title="Katalog Yönetimi">
        <AuthRequiredCard loginHref="/giris?next=/yonetim/katalog" />
      </YonetimPageShell>
    );
  }

  if (await isWholesalerAccount(supabase, user)) {
    redirect(await resolveWholesalerPath(supabase, user.id));
  }

  const { data: dukkan } = await supabase
    .from("dukkanlar")
    .select("slug, dukkan_adi, katalog_modu_aktif")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!dukkan) {
    return (
      <YonetimPageShell showYonetimNav={false} title="Katalog Yönetimi">
        <div className="max-w-lg rounded-2xl border border-slate-200/60 bg-white/80 px-6 py-8 text-center">
          <p className="text-sm text-slate-500">
            Katalog yönetimi için önce mağaza açmanız gerekiyor.
          </p>
          <Link
            href="/dukkan-ac"
            className="mt-4 inline-flex text-sm font-medium text-emerald-600 underline"
          >
            Mağaza Aç
          </Link>
        </div>
      </YonetimPageShell>
    );
  }

  return (
    <YonetimPageShell
      title={
        <>
          Katalog <span className="text-emerald-600">Yönetimi</span>
        </>
      }
      description={`${dukkan.dukkan_adi} vitrin kataloğuna toplu kılıf görseli ekleyin.`}
    >
      {!dukkan.katalog_modu_aktif && (
        <div className="mx-auto mb-6 max-w-4xl rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Katalog modu henüz aktif değil. Ürün ekleyebilirsiniz; vitrinde görünmesi için{" "}
          <Link href="/dukkan-ayarlari" className="font-semibold underline">
            mağaza ayarlarından
          </Link>{" "}
          Katalog Modunu açın.
        </div>
      )}

      <KatalogBulkUploadPanel
        shopSlug={dukkan.slug}
        katalogHref={`/${dukkan.slug}/katalog`}
      />
    </YonetimPageShell>
  );
}
