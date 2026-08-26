import { notFound, redirect } from "next/navigation";
import { AuthRequiredCard } from "@/components/auth/auth-required-card";
import { SubPageShell } from "@/components/layout/sub-page-shell";
import { BlogDuzenleForm } from "@/app/yonetim/blog/[postId]/duzenle/blog-duzenle-client";
import { getDukkanBlogPostByIdForOwner } from "@/lib/dukkan/blog-posts";
import { isWholesalerAccount, resolveWholesalerPath } from "@/lib/auth/wholesaler";
import { createClient } from "@/lib/supabase/server";

type PageProps = {
  params: Promise<{ postId: string }>;
};

export default async function BlogDuzenlePage({ params }: PageProps) {
  const { postId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <SubPageShell title="Blog Yazısını Düzenle">
        <AuthRequiredCard loginHref={`/giris?next=/yonetim/blog/${postId}/duzenle`} />
      </SubPageShell>
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
    notFound();
  }

  const post = await getDukkanBlogPostByIdForOwner(supabase, dukkan.id, postId);

  if (!post) {
    notFound();
  }

  return (
    <SubPageShell
      title={
        <>
          Blog Yazısını <span className="text-emerald-600">Düzenle</span>
        </>
      }
      description="Başlık, kapak görseli, içerik ve yayın durumunu güncelleyin."
    >
      <BlogDuzenleForm storeSlug={dukkan.slug} post={post} />
    </SubPageShell>
  );
}
