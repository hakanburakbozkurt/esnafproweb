import Link from "next/link";
import { notFound } from "next/navigation";
import { LandingFooter } from "@/components/landing/landing-footer";
import { LandingNavbar } from "@/components/landing/landing-navbar";
import {
  formatBlogDate,
  getPublicBlogPostBySlug,
} from "@/lib/blog/public-blog-posts";
import type { Metadata } from "next";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublicBlogPostBySlug(slug);

  if (!post) {
    return { title: "Yazı Bulunamadı | Esnaf Rehberi" };
  }

  return {
    title: `${post.baslik} | Esnaf Rehberi`,
    description: post.icerik?.slice(0, 160) ?? post.baslik,
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await getPublicBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-white text-slate-900">
      <LandingNavbar />
      <main className="px-4 py-16 sm:px-6 md:py-24">
        <article className="mx-auto w-full min-w-0 max-w-3xl">
          <nav aria-label="Blog gezintisi">
            <Link
              href="/blog"
              className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-600 transition hover:text-emerald-700"
            >
              ← Esnaf Rehberi
            </Link>
          </nav>

          <header className="mt-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-600">
              {post.shop_name}
            </p>
            <time
              dateTime={post.created_at}
              className="mt-3 block text-sm text-slate-400"
            >
              {formatBlogDate(post.created_at)}
            </time>
            <h1 className="mt-3 text-3xl font-bold leading-tight tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
              {post.baslik}
            </h1>
          </header>

          {post.kapak_url && (
            <figure className="mt-8 overflow-hidden rounded-3xl border border-slate-200/80 bg-slate-100 shadow-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={post.kapak_url}
                alt={post.baslik}
                className="aspect-[16/9] w-full object-cover"
              />
            </figure>
          )}

          {post.icerik && (
            <div className="prose prose-slate mt-8 max-w-none whitespace-pre-wrap text-base leading-relaxed text-slate-700 sm:text-lg sm:leading-loose">
              {post.icerik}
            </div>
          )}

          <nav
            className="mt-10 flex flex-wrap gap-4 border-t border-slate-100 pt-8 text-sm"
            aria-label="İlgili sayfalar"
          >
            <Link
              href={`/${post.shop_slug}`}
              className="font-semibold text-emerald-700 hover:text-emerald-800"
            >
              {post.shop_name} vitrinini ziyaret et
            </Link>
            <Link
              href={`/${post.shop_slug}/blog`}
              className="font-medium text-slate-600 hover:text-emerald-700"
            >
              Mağaza blog yazıları
            </Link>
            <Link
              href="/esnaflar"
              className="font-medium text-slate-600 hover:text-emerald-700"
            >
              Diğer esnaflar
            </Link>
            <Link href="/" className="font-medium text-slate-600 hover:text-emerald-700">
              Ana sayfa
            </Link>
          </nav>
        </article>
      </main>
      <LandingFooter />
    </div>
  );
}
