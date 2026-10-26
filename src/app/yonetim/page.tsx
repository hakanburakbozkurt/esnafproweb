import { redirect } from "next/navigation";
import { AuthRequiredCard } from "@/components/auth/auth-required-card";
import { YonetimPageShell } from "@/components/yonetim/yonetim-page-shell";
import { YonetimDashboardClient } from "@/app/yonetim/yonetim-dashboard-client";
import { isWholesalerAccount, resolveWholesalerPath } from "@/lib/auth/wholesaler";
import { createClient } from "@/lib/supabase/server";
import { loadProfileHealthInput } from "@/lib/yonetim/health-input";
import Link from "next/link";

async function loadDukkan(supabase: Awaited<ReturnType<typeof createClient>>, userId: string) {
  const { data } = await supabase
    .from("dukkanlar")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  return data;
}

export default async function YonetimPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <YonetimPageShell
        showYonetimNav={false}
        title={
          <>
            Yönetim <span className="text-emerald-600">Paneli</span>
          </>
        }
      >
        <AuthRequiredCard
          description="Yönetim paneline erişmek için giriş yapmalısınız."
          loginHref="/giris?next=/yonetim"
        />
      </YonetimPageShell>
    );
  }

  if (await isWholesalerAccount(supabase, user)) {
    redirect(await resolveWholesalerPath(supabase, user.id));
  }

  const dukkan = await loadDukkan(supabase, user.id);

  if (!dukkan) {
    return (
      <YonetimPageShell
        showYonetimNav={false}
        title={
          <>
            Yönetim <span className="text-emerald-600">Paneli</span>
          </>
        }
        description="Mağaza vitrininizi, SEO içeriklerinizi ve profil gücünüzü tek yerden yönetin."
      >
        <div className="max-w-lg rounded-2xl border border-slate-200/60 bg-white/80 px-6 py-8 text-center lg:px-8">
          <h2 className="text-lg font-semibold text-slate-900 lg:text-xl">
            Henüz mağazanız yok
          </h2>
          <p className="mt-2 text-sm text-slate-500 lg:text-base">
            Yönetim panelini kullanmak için önce mağaza açmanız gerekiyor.
          </p>
          <Link
            href="/dukkan-ac"
            className="mt-6 inline-flex rounded-full bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-slate-800"
          >
            Mağaza Aç
          </Link>
        </div>
      </YonetimPageShell>
    );
  }

  const healthInput = await loadProfileHealthInput(supabase, dukkan);

  return (
    <YonetimPageShell
      title={
        <>
          Yönetim <span className="text-emerald-600">Paneli</span>
        </>
      }
      description="Mağaza vitrininizi, SEO içeriklerinizi ve profil gücünüzü tek yerden yönetin."
    >
      <YonetimDashboardClient
        shopSlug={dukkan.slug}
        shopName={dukkan.dukkan_adi}
        healthInput={healthInput}
      />
    </YonetimPageShell>
  );
}
