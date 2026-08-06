import { notFound } from "next/navigation";
import { BlogPageContent } from "@/components/dukkan/vitrin/blog-page-content";
import { VitrinChrome } from "@/components/dukkan/vitrin/vitrin-chrome";
import { getDukkanBlogPosts } from "@/lib/dukkan/blog-posts";
import { hasPublishedSecondHandDevices } from "@/lib/dukkan/second-hand-devices";
import { createClient } from "@/lib/supabase/server";
import type { Metadata } from "next";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: dukkan } = await supabase
    .from("dukkanlar")
    .select("dukkan_adi")
    .eq("slug", slug)
    .eq("aktif", true)
    .maybeSingle();

  if (!dukkan) {
    return { title: "Mağaza Bulunamadı | EsnafPRO" };
  }

  return {
    title: `Blog | ${dukkan.dukkan_adi} | EsnafPRO`,
    description: `${dukkan.dukkan_adi} blog yazıları — yerel SEO ve duyurular`,
  };
}

export default async function BlogPage({ params }: PageProps) {
  const { slug } = await params;
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

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isOwner = user?.id === dukkan.user_id;
  const showContactNav = dukkan.iletisim_sss_goster ?? true;
  const showTeknikServisNav = dukkan.teknik_servis_aktif ?? false;
  const showPazaryeriNav = await hasPublishedSecondHandDevices(supabase, dukkan.user_id);

  const [allPosts, publishedPosts] = await Promise.all([
    getDukkanBlogPosts(supabase, dukkan.id),
    getDukkanBlogPosts(supabase, dukkan.id, { publishedOnly: true }),
  ]);

  return (
    <VitrinChrome
      shopName={dukkan.dukkan_adi}
      isOwner={isOwner}
      showContactNav={showContactNav}
      showTeknikServisNav={showTeknikServisNav}
      showPazaryeriNav={showPazaryeriNav}
      dukkan={dukkan}
    >
      <BlogPageContent
        shopName={dukkan.dukkan_adi}
        shopSlug={dukkan.slug}
        posts={publishedPosts}
        isOwner={isOwner && allPosts.length === 0}
      />
    </VitrinChrome>
  );
}
