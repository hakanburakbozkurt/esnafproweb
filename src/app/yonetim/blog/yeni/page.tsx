import { redirect } from "next/navigation";
import { AuthRequiredCard } from "@/components/auth/auth-required-card";
import { YonetimPageShell } from "@/components/yonetim/yonetim-page-shell";
import { BlogYeniForm } from "@/app/yonetim/blog/yeni/blog-yeni-client";
import { isWholesalerAccount, resolveWholesalerPath } from "@/lib/auth/wholesaler";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function BlogYeniPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <YonetimPageShell showYonetimNav={false} title="Yeni Blog Yazısı">
        <AuthRequiredCard loginHref="/giris?next=/yonetim/blog/yeni" />
      </YonetimPageShell>
    );
  }

  if (await isWholesalerAccount(supabase, user)) {
    redirect(await resolveWholesalerPath(supabase, user.id));
  }

  const { data: dukkan } = await supabase
    .from("dukkanlar")
    .select("id, slug")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!dukkan) {
    return (
      <YonetimPageShell showYonetimNav={false} title="Yeni Blog Yazısı">
        <div className="max-w-lg rounded-2xl border border-slate-200/60 bg-white/80 px-6 py-8 text-center">
          <p className="text-sm text-slate-500">Blog yazısı eklemek için önce mağaza açın.</p>
          <Link href="/dukkan-ac" className="mt-4 inline-flex text-sm font-medium text-emerald-600 underline">
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
          İlk <span className="text-emerald-600">Blog Yazın</span>
        </>
      }
      description="Yerel SEO ve GEO görünürlüğünüz için mahalle odaklı, samimi bir içerik oluşturun."
    >
      <BlogYeniForm storeSlug={dukkan.slug} />
    </YonetimPageShell>
  );
}
