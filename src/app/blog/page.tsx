import Link from "next/link";
import { LandingFooter } from "@/components/landing/landing-footer";
import { LandingNavbar } from "@/components/landing/landing-navbar";
import {
  BlogComingSoonPlaceholder,
  BlogPostCard,
} from "@/components/landing/blog-post-card";
import { getPublicBlogPosts } from "@/lib/blog/public-blog-posts";
import { buildPageMetadata } from "@/lib/seo/page-metadata";
import type { Metadata } from "next";

export const metadata: Metadata = buildPageMetadata({
  title: "Esnaf Rehberi | EsnafPRO Blog",
  description:
    "EsnafPRO mağazalarından yerel SEO yazıları, sektör rehberleri ve duyurular.",
  path: "/blog",
});

export default async function BlogIndexPage() {
  const posts = await getPublicBlogPosts();

  return (
    <div className="min-h-screen overflow-x-hidden bg-white text-slate-900">
      <LandingNavbar />
      <main className="px-4 py-16 sm:px-6 md:py-24">
        <div className="mx-auto w-full min-w-0 max-w-6xl">
          <header className="max-w-3xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-600">
              Blog & Rehber
            </p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Esnaf Rehberi
            </h1>
            <p className="mt-4 text-sm leading-relaxed text-slate-600 sm:text-base">
              Dijital vitrinini açan esnafların paylaştığı yerel içerikler,
              ipuçları ve duyurular.
            </p>
          </header>

          <div className="mt-10">
            {posts.length > 0 ? (
              <ul className="grid items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
                {posts.map((post) => (
                  <li key={post.id} className="flex h-full min-h-0">
                    <BlogPostCard post={post} className="w-full" />
                  </li>
                ))}
              </ul>
            ) : (
              <BlogComingSoonPlaceholder />
            )}
          </div>

          <nav
            className="mt-10 flex flex-wrap gap-4 text-sm"
            aria-label="Site gezintisi"
          >
            <Link href="/" className="font-medium text-emerald-700 hover:text-emerald-800">
              Ana Sayfa
            </Link>
            <Link
              href="/esnaflar"
              className="font-medium text-emerald-700 hover:text-emerald-800"
            >
              Esnaf Vitrini
            </Link>
          </nav>
        </div>
      </main>
      <LandingFooter />
    </div>
  );
}
