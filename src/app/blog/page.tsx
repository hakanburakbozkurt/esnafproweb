import Link from "next/link";
import { LandingFooter } from "@/components/landing/landing-footer";
import { LandingNavbar } from "@/components/landing/landing-navbar";
import {
  BlogComingSoonPlaceholder,
  BlogPostCard,
} from "@/components/landing/blog-post-card";
import { PlatformBlogCard } from "@/components/landing/platform-blog-card";
import { getPlatformBlogPosts } from "@/lib/blog/platform-blog-posts";
import { getPublicBlogPosts } from "@/lib/blog/public-blog-posts";
import { resolvePlatformPageMetadata } from "@/lib/seo/get-platform-page-seo";
import { buildSitemapUrl } from "@/lib/seo/sitemap-url";
import { JsonLdScripts } from "@/components/seo/json-ld-scripts";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return resolvePlatformPageMetadata("/blog");
}

export default async function BlogIndexPage() {
  const [platformPosts, shopPosts] = await Promise.all([
    getPlatformBlogPosts(),
    getPublicBlogPosts(),
  ]);

  const [lead, ...rest] = platformPosts;

  const itemListJsonLd = platformPosts.length
    ? {
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: "EsnafPRO Blog",
        itemListElement: platformPosts.map((post, index) => ({
          "@type": "ListItem",
          position: index + 1,
          url: buildSitemapUrl(`/blog/${post.slug}`),
          name: post.baslik,
        })),
      }
    : null;

  return (
    <div className="min-h-screen overflow-x-hidden bg-white text-slate-900">
      <JsonLdScripts schemas={[itemListJsonLd]} />
      <LandingNavbar />
      <main className="px-4 py-16 sm:px-6 md:py-24">
        <div className="mx-auto w-full min-w-0 max-w-6xl">
          <header className="max-w-3xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-600">
              Blog & Rehber
            </p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Telefoncunun Rehberi
            </h1>
            <p className="mt-4 text-sm leading-relaxed text-slate-600 sm:text-base">
              Teknik servis, 2. el cihaz, pazaryeri ve dükkan yönetimi üzerine
              sahadan çıkmış rehberler — bir de esnaflarımızın kendi yerel
              içerikleri.
            </p>
          </header>

          {lead && (
            <section className="mt-12" aria-labelledby="one-cikan">
              <h2 id="one-cikan" className="sr-only">
                Öne çıkan yazı
              </h2>
              <PlatformBlogCard post={lead} className="sm:flex-row" />
            </section>
          )}

          {rest.length > 0 && (
            <section className="mt-10" aria-labelledby="platform-yazilar">
              <h2
                id="platform-yazilar"
                className="text-xl font-bold tracking-tight text-slate-900"
              >
                Rehberler
              </h2>
              <ul className="mt-6 grid items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
                {rest.map((post) => (
                  <li key={post.id} className="flex h-full min-h-0">
                    <PlatformBlogCard post={post} className="w-full" />
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className="mt-16" aria-labelledby="esnaf-yazilar">
            <h2
              id="esnaf-yazilar"
              className="text-xl font-bold tracking-tight text-slate-900"
            >
              Esnaflardan
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
              Dijital vitrinini açan esnafların paylaştığı yerel içerikler,
              ipuçları ve duyurular.
            </p>

            <div className="mt-6">
              {shopPosts.length > 0 ? (
                <ul className="grid items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
                  {shopPosts.map((post) => (
                    <li key={post.id} className="flex h-full min-h-0">
                      <BlogPostCard post={post} className="w-full" />
                    </li>
                  ))}
                </ul>
              ) : (
                <BlogComingSoonPlaceholder />
              )}
            </div>
          </section>

          <nav
            className="mt-14 flex flex-wrap gap-4 text-sm"
            aria-label="Site gezintisi"
          >
            <Link
              href="/"
              className="font-medium text-emerald-700 hover:text-emerald-800"
            >
              Ana Sayfa
            </Link>
            <Link
              href="/esnaflar"
              className="font-medium text-emerald-700 hover:text-emerald-800"
            >
              Esnaf Vitrini
            </Link>
            <Link
              href="/dukkan-ac"
              className="font-medium text-emerald-700 hover:text-emerald-800"
            >
              Ücretsiz Dükkan Aç
            </Link>
          </nav>
        </div>
      </main>
      <LandingFooter />
    </div>
  );
}
