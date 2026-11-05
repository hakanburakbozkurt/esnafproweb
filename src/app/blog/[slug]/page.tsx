import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { LandingFooter } from "@/components/landing/landing-footer";
import { LandingNavbar } from "@/components/landing/landing-navbar";
import { PlatformBlogCard } from "@/components/landing/platform-blog-card";
import { BlogHtmlContent } from "@/components/dukkan/vitrin/blog-html-content";
import { JsonLdScripts } from "@/components/seo/json-ld-scripts";
import { blogExcerptFromHtml } from "@/lib/blog/blog-html";
import { platformBlogCategoryLabel } from "@/lib/blog/platform-blog.constants";
import {
  getPlatformBlogPostBySlug,
  getRelatedPlatformBlogPosts,
} from "@/lib/blog/platform-blog-posts";
import { getPublicBlogPostBySlug } from "@/lib/blog/public-blog-posts";
import { formatBlogDate } from "@/lib/blog/public-blog-post.types";
import { buildSitemapUrl } from "@/lib/seo/sitemap-url";
import type { Metadata } from "next";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPlatformBlogPostBySlug(slug);

  if (!post) {
    return { robots: { index: false, follow: true } };
  }

  const title = post.meta_title?.trim() || post.baslik;
  const description =
    post.meta_description?.trim() ||
    post.ozet?.trim() ||
    blogExcerptFromHtml(post.icerik, 160) ||
    post.baslik;
  const canonical = buildSitemapUrl(`/blog/${post.slug}`);

  return {
    title: `${title} | EsnafPRO`,
    description,
    alternates: { canonical },
    openGraph: {
      type: "article",
      title,
      description,
      url: canonical,
      siteName: "EsnafPRO",
      locale: "tr_TR",
      images: post.kapak_url ? [{ url: post.kapak_url }] : undefined,
      publishedTime: post.yayin_tarihi ?? post.created_at,
      modifiedTime: post.updated_at,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: post.kapak_url ? [post.kapak_url] : undefined,
    },
  };
}

export default async function PlatformBlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await getPlatformBlogPostBySlug(slug);

  // Platform yazısı yoksa: eski /blog/[slug] linkleri mağaza canonical'ına gider
  if (!post) {
    const shopPost = await getPublicBlogPostBySlug(slug);

    if (!shopPost) {
      notFound();
    }

    permanentRedirect(`/${shopPost.shop_slug}/blog/${shopPost.slug}`);
  }

  const related = await getRelatedPlatformBlogPosts(post);
  const canonical = buildSitemapUrl(`/blog/${post.slug}`);
  const description =
    post.meta_description?.trim() || post.gorunen_ozet || post.baslik;

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.baslik,
    description,
    mainEntityOfPage: { "@type": "WebPage", "@id": canonical },
    url: canonical,
    datePublished: post.yayin_tarihi ?? post.created_at,
    dateModified: post.updated_at,
    inLanguage: "tr-TR",
    image: post.kapak_url ? [post.kapak_url] : undefined,
    author: { "@type": "Organization", name: post.yazar_adi },
    publisher: {
      "@type": "Organization",
      name: "EsnafPRO",
      url: buildSitemapUrl("/"),
    },
    articleSection: platformBlogCategoryLabel(post.kategori),
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Ana Sayfa",
        item: buildSitemapUrl("/"),
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Blog",
        item: buildSitemapUrl("/blog"),
      },
      { "@type": "ListItem", position: 3, name: post.baslik, item: canonical },
    ],
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-white text-slate-900">
      <JsonLdScripts schemas={[articleJsonLd, breadcrumbJsonLd]} />
      <LandingNavbar />

      <main className="px-4 py-12 sm:px-6 md:py-16">
        <article className="mx-auto w-full min-w-0 max-w-3xl">
          <nav
            className="flex flex-wrap items-center gap-2 text-xs text-slate-400"
            aria-label="Breadcrumb"
          >
            <Link href="/" className="hover:text-emerald-700">
              Ana Sayfa
            </Link>
            <span aria-hidden>/</span>
            <Link href="/blog" className="hover:text-emerald-700">
              Blog
            </Link>
          </nav>

          <header className="mt-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-600">
              {platformBlogCategoryLabel(post.kategori)}
            </p>
            <h1 className="mt-3 text-3xl font-bold leading-tight tracking-tight text-slate-900 sm:text-4xl">
              {post.baslik}
            </h1>
            <p className="mt-4 text-sm text-slate-500">
              {post.yazar_adi} ·{" "}
              <time dateTime={post.yayin_tarihi ?? post.created_at}>
                {formatBlogDate(post.yayin_tarihi ?? post.created_at)}
              </time>{" "}
              · {post.okuma_suresi} dk okuma
            </p>

            {post.ozet && (
              <p className="mt-6 border-l-2 border-emerald-200 pl-4 text-base leading-relaxed text-slate-600">
                {post.ozet}
              </p>
            )}
          </header>

          {post.kapak_url && (
            <div className="mt-8 overflow-hidden rounded-3xl border border-slate-200/80">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={post.kapak_url}
                alt={post.baslik}
                className="aspect-[16/9] w-full object-cover"
              />
            </div>
          )}

          {post.icerik && (
            <div className="mt-10">
              <BlogHtmlContent html={post.icerik} />
            </div>
          )}

          <section className="mt-14 rounded-3xl border border-emerald-100 bg-gradient-to-br from-emerald-50/80 via-white to-teal-50/40 p-6 sm:p-8">
            <h2 className="text-xl font-bold tracking-tight text-slate-900">
              Dükkanını EsnafPRO&apos;ya ücretsiz taşı
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              Vitrin sayfası, teknik servis takibi ve toptancı siparişi tek
              panelde. Web tarafı ücretsiz.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href="/dukkan-ac"
                className="inline-flex min-h-11 items-center justify-center rounded-full bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-500 px-5 text-sm font-bold text-white shadow-lg shadow-emerald-500/20 transition hover:shadow-emerald-500/30"
              >
                Ücretsiz Dükkan Aç
              </Link>
              <Link
                href="/esnaflar"
                className="inline-flex min-h-11 items-center justify-center rounded-full border border-emerald-200 bg-white px-5 text-sm font-semibold text-emerald-700 transition hover:border-emerald-300"
              >
                Esnaf Vitrinini Gör
              </Link>
            </div>
          </section>

          {related.length > 0 && (
            <section className="mt-14" aria-labelledby="ilgili">
              <h2
                id="ilgili"
                className="text-xl font-bold tracking-tight text-slate-900"
              >
                Bunlar da ilgini çekebilir
              </h2>
              <ul className="mt-6 grid items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {related.map((item) => (
                  <li key={item.id} className="flex h-full min-h-0">
                    <PlatformBlogCard post={item} className="w-full" />
                  </li>
                ))}
              </ul>
            </section>
          )}
        </article>
      </main>

      <LandingFooter />
    </div>
  );
}
