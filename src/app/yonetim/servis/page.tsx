import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthRequiredCard } from "@/components/auth/auth-required-card";
import { SubPageShell } from "@/components/layout/sub-page-shell";
import { ServisYonetimClient } from "@/app/yonetim/servis/servis-yonetim-client";
import { isWholesalerAccount, resolveWholesalerPath } from "@/lib/auth/wholesaler";
import { searchTechnicalServices } from "@/lib/servis/servis-yonetim-actions";
import { createClient } from "@/lib/supabase/server";

export default async function ServisYonetimPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <SubPageShell title="Servis Yönetimi">
        <AuthRequiredCard loginHref="/giris?next=/yonetim/servis" />
      </SubPageShell>
    );
  }

  if (await isWholesalerAccount(supabase, user)) {
    redirect(await resolveWholesalerPath(supabase, user.id));
  }

  const { data: dukkan } = await supabase
    .from("dukkanlar")
    .select("id, slug, dukkan_adi")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!dukkan) {
    return (
      <SubPageShell title="Servis Yönetimi">
        <div className="max-w-lg rounded-2xl border border-slate-200/60 bg-white/80 px-6 py-8 text-center">
          <p className="text-sm text-slate-500">
            Servis geçmişi için önce mağaza açın.
          </p>
          <Link
            href="/dukkan-ac"
            className="mt-4 inline-flex text-sm font-medium text-emerald-600 underline"
          >
            Mağaza Aç
          </Link>
        </div>
      </SubPageShell>
    );
  }

  const initialResult = await searchTechnicalServices({});
  const initialRecords = initialResult.ok ? initialResult.records : [];

  return (
    <SubPageShell
      title={
        <>
          Servis <span className="text-emerald-600">Yönetimi</span>
        </>
      }
      description={`${dukkan.dukkan_adi} — teknik servis kayıtlarını arayın, filtreleyin ve detaylarını inceleyin.`}
      contentWidth="2xl"
    >
      {!initialResult.ok && (
        <div
          role="alert"
          className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {initialResult.error}
        </div>
      )}
      <ServisYonetimClient initialRecords={initialRecords} />
    </SubPageShell>
  );
}
