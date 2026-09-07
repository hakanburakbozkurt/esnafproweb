import Link from "next/link";
import { redirect } from "next/navigation";
import { CihazlarClient } from "@/app/yonetim/cihazlar/cihazlar-client";
import { AuthRequiredCard } from "@/components/auth/auth-required-card";
import { YonetimPageShell } from "@/components/yonetim/yonetim-page-shell";
import { listOwnerSecondHandDevices } from "@/lib/cihaz/actions";
import { isWholesalerAccount, resolveWholesalerPath } from "@/lib/auth/wholesaler";
import { createClient } from "@/lib/supabase/server";

export default async function CihazlarYonetimPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <YonetimPageShell showYonetimNav={false} title="Cihaz Yönetimi">
        <AuthRequiredCard loginHref="/giris?next=/yonetim/cihazlar" />
      </YonetimPageShell>
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
      <YonetimPageShell showYonetimNav={false} title="Cihaz Yönetimi">
        <div className="max-w-lg rounded-2xl border border-slate-200/60 bg-white/80 px-6 py-8 text-center">
          <p className="text-sm text-slate-500">
            Cihaz envanteri için önce mağaza açın.
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

  const initialResult = await listOwnerSecondHandDevices();
  const initialDevices = initialResult.ok ? initialResult.devices : [];

  return (
    <YonetimPageShell
      title={
        <>
          Cihaz <span className="text-emerald-600">Yönetimi</span>
        </>
      }
      description={`${dukkan.dukkan_adi} — ikinci el ve sıfır cihaz envanterinizi yönetin, pazaryerinde yayınlayın.`}
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
      <CihazlarClient initialDevices={initialDevices} shopSlug={dukkan.slug} />
    </YonetimPageShell>
  );
}
