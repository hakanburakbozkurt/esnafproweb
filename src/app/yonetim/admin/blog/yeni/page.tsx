import Link from "next/link";
import { notFound } from "next/navigation";
import { PlatformBlogForm } from "@/components/yonetim/platform-blog-form";
import { YonetimDarkShell } from "@/components/yonetim/yonetim-dark-shell";
import { isSuperAdminUser } from "@/lib/auth/super-admin";
import { createPlatformBlogPost } from "@/lib/blog/platform-blog-actions";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Yeni Platform Yazısı | EsnafPRO Yönetim",
  robots: { index: false, follow: false },
};

export default async function YeniPlatformBlogPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !isSuperAdminUser(user)) {
    notFound();
  }

  return (
    <YonetimDarkShell backHref="/yonetim/admin/blog" backLabel="Platform Blog">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-100">
          Yeni Platform Yazısı
        </h1>
        <p className="mt-1.5 text-sm text-zinc-400">
          Yayınlanınca{" "}
          <Link href="/blog" className="text-indigo-400 hover:underline">
            /blog
          </Link>{" "}
          altında listelenir ve sitemap&apos;e eklenir.
        </p>
      </div>

      <PlatformBlogForm
        mode="create"
        submitAction={createPlatformBlogPost}
        submitLabel="Yazıyı Kaydet"
        pendingLabel="Kaydediliyor…"
      />
    </YonetimDarkShell>
  );
}
