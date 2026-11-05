import { notFound } from "next/navigation";
import { PlatformBlogListClient } from "@/app/yonetim/admin/blog/platform-blog-list-client";
import { YonetimDarkShell } from "@/components/yonetim/yonetim-dark-shell";
import { isSuperAdminUser } from "@/lib/auth/super-admin";
import { getAdminPlatformBlogPosts } from "@/lib/blog/platform-blog-posts";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Platform Blog | EsnafPRO Yönetim",
  robots: { index: false, follow: false },
};

export default async function PlatformBlogAdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !isSuperAdminUser(user)) {
    notFound();
  }

  const posts = await getAdminPlatformBlogPosts();

  return (
    <YonetimDarkShell backHref="/yonetim/admin" backLabel="Admin">
      <PlatformBlogListClient posts={posts} />
    </YonetimDarkShell>
  );
}
