import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthRequiredCard } from "@/components/auth/auth-required-card";
import { YonetimPageShell } from "@/components/yonetim/yonetim-page-shell";
import { BlogYonetimClient } from "@/app/yonetim/blog/blog-yonetim-client";
import { getDukkanBlogPosts } from "@/lib/dukkan/blog-posts";
import { isWholesalerAccount, resolveWholesalerPath } from "@/lib/auth/wholesaler";
import { createClient } from "@/lib/supabase/server";

export default async function BlogYonetimPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <YonetimPageShell showYonetimNav={false} title="Blog Yönetimi">
        <AuthRequiredCard loginHref="/giris?next=/yonetim/blog" />
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
      <YonetimPageShell showYonetimNav={false} title="Blog Yönetimi">
        <div className="max-w-lg rounded-2xl border border-slate-200/60 bg-white/80 px-6 py-8 text-center">
          <p className="text-sm text-slate-500">Blog yönetimi için önce mağaza açın.</p>
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

  const posts = await getDukkanBlogPosts(supabase, dukkan.id);

  return (
    <YonetimPageShell
      title={
        <>
          Blog <span className="text-emerald-600">Yönetimi</span>
        </>
      }
      description={`${dukkan.dukkan_adi} — yazılarınızı düzenleyin, yayından kaldırın veya silin.`}
    >
      <BlogYonetimClient posts={posts} shopSlug={dukkan.slug} />
    </YonetimPageShell>
  );
}
