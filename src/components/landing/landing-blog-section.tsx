import Link from "next/link";
import {
  BlogComingSoonPlaceholder,
  BlogPostCard,
} from "@/components/landing/blog-post-card";
import type { PublicBlogPost } from "@/lib/blog/public-blog-post.types";

export function LandingBlogSection({ posts }: { posts: PublicBlogPost[] }) {
  return (
    <section
      id="esnaf-rehberi"
      className="overflow-x-hidden bg-slate-50/60 px-4 py-16 sm:px-6 md:py-24"
    >
      <div className="mx-auto w-full min-w-0 max-w-6xl">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-600">
              Blog & Rehber
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Esnaf Rehberi
            </h2>
            <p className="mt-3 max-w-xl text-sm text-slate-500 sm:text-base">
              Aktif dükkanlardan yerel SEO yazıları, ipuçları ve sektör
              duyuruları.
            </p>
          </div>
          {posts.length > 0 && (
            <Link
              href="/blog"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700 transition hover:text-emerald-800"
            >
              Tüm yazılar
              <span aria-hidden>→</span>
            </Link>
          )}
        </div>

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
      </div>
    </section>
  );
}
