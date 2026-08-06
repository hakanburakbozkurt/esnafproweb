import { notFound } from "next/navigation";
import { BlogPostDetailContent } from "@/components/dukkan/vitrin/blog-post-detail-content";
import { VitrinChrome } from "@/components/dukkan/vitrin/vitrin-chrome";
import { getDukkanBlogPostBySlug } from "@/lib/dukkan/blog-posts";
import { hasPublishedSecondHandDevices } from "@/lib/dukkan/second-hand-devices";
import { createClient } from "@/lib/supabase/server";
import type { Metadata } from "next";

type PageProps = {
  params: Promise<{ slug: string; postSlug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug, postSlug } = await params;
  const supabase = await createClient();
  const { data: dukkan } = await supabase
    .from("dukkanlar")
    .select("id, dukkan_adi")
    .eq("slug", slug)
    .eq("aktif", true)
    .maybeSingle();

  if (!dukkan) {
    return { title: "Mağaza Bulunamadı | EsnafPRO" };
  }

  const post = await getDukkanBlogPostBySlug(supabase, dukkan.id, postSlug);

  if (!post) {
    return { title: `Blog | ${dukkan.dukkan_adi} | EsnafPRO` };
  }

  return {
    title: `${post.baslik} | ${dukkan.dukkan_adi} | EsnafPRO`,
    description: post.icerik?.slice(0, 160) ?? post.baslik,
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug, postSlug } = await params;
  const supabase = await createClient();

  const { data: dukkan, error: dukkanError } = await supabase
    .from("dukkanlar")
    .select("*")
    .eq("slug", slug)
    .eq("aktif", true)
    .maybeSingle();

  if (dukkanError || !dukkan) {
    notFound();
  }

  const post = await getDukkanBlogPostBySlug(supabase, dukkan.id, postSlug);

  if (!post) {
    notFound();
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isOwner = user?.id === dukkan.user_id;
  const showContactNav = dukkan.iletisim_sss_goster ?? true;
  const showTeknikServisNav = dukkan.teknik_servis_aktif ?? false;
  const showPazaryeriNav = await hasPublishedSecondHandDevices(supabase, dukkan.user_id);

  return (
    <VitrinChrome
      shopName={dukkan.dukkan_adi}
      isOwner={isOwner}
      showContactNav={showContactNav}
      showTeknikServisNav={showTeknikServisNav}
      showPazaryeriNav={showPazaryeriNav}
      dukkan={dukkan}
    >
      <BlogPostDetailContent
        shopName={dukkan.dukkan_adi}
        shopSlug={dukkan.slug}
        post={post}
      />
    </VitrinChrome>
  );
}
