import { redirect } from "next/navigation";
import { AuthRequiredCard } from "@/components/auth/auth-required-card";
import { SubPageShell } from "@/components/layout/sub-page-shell";
import { YonetimDashboardClient } from "@/app/yonetim/yonetim-dashboard-client";
import { getDukkanBlogPostCount } from "@/lib/dukkan/blog-posts";
import type { ProfileHealthInput } from "@/lib/dukkan/profile-health-score";
import type { SeoGeoScoreInput } from "@/lib/dukkan/seo-geo-score";
import { isWholesalerAccount, resolveWholesalerPath } from "@/lib/auth/wholesaler";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

function toHealthInput(
  dukkan: NonNullable<Awaited<ReturnType<typeof loadDukkan>>>
): ProfileHealthInput {
  return {
    logo_url: dukkan.logo_url,
    banner_url: dukkan.banner_url,
    aciklama: dukkan.aciklama,
    instagram_url: dukkan.instagram_url,
    tiktok_url: dukkan.tiktok_url,
    facebook_url: dukkan.facebook_url,
    telefon: dukkan.telefon,
    whatsapp: dukkan.whatsapp,
    adres: dukkan.adres,
    enlem: dukkan.enlem,
    boylam: dukkan.boylam,
    dukkan_fotograflari: dukkan.dukkan_fotograflari,
    anasayfa_sss: dukkan.anasayfa_sss,
    iletisim_sss: dukkan.sss,
    hakkimizda_sss: dukkan.hakkimizda_sss,
    teknik_servis_sss: dukkan.teknik_servis_sss,
  };
}

function toSeoGeoInput(
  dukkan: NonNullable<Awaited<ReturnType<typeof loadDukkan>>>,
  blogPostCount: number
): SeoGeoScoreInput {
  return {
    adres: dukkan.adres,
    enlem: dukkan.enlem,
    boylam: dukkan.boylam,
    aciklama: dukkan.aciklama,
    anasayfa_sss: dukkan.anasayfa_sss,
    iletisim_sss: dukkan.sss,
    hakkimizda_sss: dukkan.hakkimizda_sss,
    teknik_servis_sss: dukkan.teknik_servis_sss,
    calisma_saatleri: dukkan.calisma_saatleri,
    whatsapp: dukkan.whatsapp,
    blogPostCount,
  };
}

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
      <SubPageShell
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
      </SubPageShell>
    );
  }

  if (await isWholesalerAccount(supabase, user)) {
    redirect(await resolveWholesalerPath(supabase, user.id));
  }

  const dukkan = await loadDukkan(supabase, user.id);

  if (!dukkan) {
    return (
      <SubPageShell
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
      </SubPageShell>
    );
  }

  const blogPostCount = await getDukkanBlogPostCount(supabase, dukkan.id);

  return (
    <SubPageShell
      title={
        <>
          Yönetim <span className="text-emerald-600">Paneli</span>
        </>
      }
      description="Mağaza vitrininizi, SEO içeriklerinizi ve profil gücünüzü tek yerden yönetin."
    >
      <YonetimDashboardClient
        shopName={dukkan.dukkan_adi}
        shopSlug={dukkan.slug}
        blogPostCount={blogPostCount}
        healthInput={toHealthInput(dukkan)}
        seoInput={toSeoGeoInput(dukkan, blogPostCount)}
      />
    </SubPageShell>
  );
}
