import { notFound } from "next/navigation";
import { PlatformBlogForm } from "@/components/yonetim/platform-blog-form";
import { YonetimDarkShell } from "@/components/yonetim/yonetim-dark-shell";
import { isSuperAdminUser } from "@/lib/auth/super-admin";
import { updatePlatformBlogPost } from "@/lib/blog/platform-blog-actions";
import { getAdminPlatformBlogPostById } from "@/lib/blog/platform-blog-posts";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Yazıyı Düzenle | EsnafPRO Yönetim",
  robots: { index: false, follow: false },
};

type PageProps = {
  params: Promise<{ postId: string }>;
};

export default async function PlatformBlogDuzenlePage({ params }: PageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !isSuperAdminUser(user)) {
    notFound();
  }

  const { postId } = await params;
  const post = await getAdminPlatformBlogPostById(postId);

  if (!post) {
    notFound();
  }

  return (
    <YonetimDarkShell backHref="/yonetim/admin/blog" backLabel="Platform Blog">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-100">
          Yazıyı Düzenle
        </h1>
        <p className="mt-1.5 truncate text-sm text-zinc-400">/blog/{post.slug}</p>
      </div>

      <PlatformBlogForm
        mode="edit"
        initialPost={post}
        submitAction={updatePlatformBlogPost}
        submitLabel="Değişiklikleri Kaydet"
        pendingLabel="Kaydediliyor…"
      />
    </YonetimDarkShell>
  );
}
