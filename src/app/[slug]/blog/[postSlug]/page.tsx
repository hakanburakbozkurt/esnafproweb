import { JsonLdScripts } from "@/components/seo/json-ld-scripts";
import { notFound } from "next/navigation";
import { BlogPostDetailContent } from "@/components/dukkan/vitrin/blog-post-detail-content";
import { VitrinChrome } from "@/components/dukkan/vitrin/vitrin-chrome";
import { getDukkanBlogPostBySlug } from "@/lib/dukkan/blog-posts";
import {
  buildBlogPostingJsonLd,
  buildStoreBreadcrumbJsonLd,
} from "@/lib/dukkan/json-ld";
import {
  buildBlogPostSeoMetadata,
  buildStoreSubpageSeoMetadata,
  NOT_FOUND_STORE_METADATA,
} from "@/lib/dukkan/metadata";
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
    .select("id, dukkan_adi, slug, adres, banner_url, logo_url, approval_status")
    .eq("slug", slug)
    .eq("aktif", true)
    .maybeSingle();

  if (!dukkan) {
    return NOT_FOUND_STORE_METADATA;
  }

  const post = await getDukkanBlogPostBySlug(supabase, dukkan.id, postSlug);

  if (!post) {
    return buildStoreSubpageSeoMetadata(
      dukkan,
      "blog",
      "Blog",
      `${dukkan.dukkan_adi} blog yazıları`
    );
  }

  return buildBlogPostSeoMetadata(dukkan, post);
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
  const showKatalogNav = dukkan.katalog_modu_aktif ?? false;
  const showPazaryeriNav = await hasPublishedSecondHandDevices(supabase, dukkan.user_id);

  return (
    <>
      <JsonLdScripts
        schemas={[
          buildBlogPostingJsonLd({
            post,
            shopName: dukkan.dukkan_adi,
            shopSlug: dukkan.slug,
          }),
          buildStoreBreadcrumbJsonLd(dukkan.slug, dukkan.dukkan_adi, [
            { name: "Blog", segment: "blog" },
            { name: post.baslik, segment: `blog/${post.slug}` },
          ]),
        ]}
      />

      <VitrinChrome
        shopName={dukkan.dukkan_adi}
        isOwner={isOwner}
        showContactNav={showContactNav}
        showTeknikServisNav={showTeknikServisNav}
        showPazaryeriNav={showPazaryeriNav}
        showKatalogNav={showKatalogNav}
        dukkan={dukkan}
      >
        <BlogPostDetailContent
          shopName={dukkan.dukkan_adi}
          shopSlug={dukkan.slug}
          post={post}
          isOwner={isOwner}
          showPazaryeri={showPazaryeriNav}
          showKatalog={showKatalogNav}
        />
      </VitrinChrome>
    </>
  );
}
