import Link from "next/link";
import { ScrollReveal } from "@/components/motion/scroll-reveal";
import { VitrinDotGrid } from "@/components/dukkan/vitrin/vitrin-open-section";
import { vitrinSubpageContainerClass } from "@/lib/utils/layout";
import type { DukkanBlogYazisi } from "@/types/database.types";

function formatBlogDate(value: string) {
  return new Intl.DateTimeFormat("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

export function BlogPostDetailContent({
  shopName,
  shopSlug,
  post,
}: {
  shopName: string;
  shopSlug: string;
  post: DukkanBlogYazisi;
}) {
  return (
    <div className="relative pb-16 pt-8 lg:pb-24 lg:pt-14">
      <VitrinDotGrid />

      <article className={vitrinSubpageContainerClass}>
        <ScrollReveal>
          <Link
            href={`/${shopSlug}/blog`}
            className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-600 transition hover:text-emerald-700"
          >
            ← Blog yazıları
          </Link>

          <header className="mt-6 max-w-3xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-600">
              {shopName}
            </p>
            <time className="mt-3 block text-sm text-slate-400">{formatBlogDate(post.created_at)}</time>
            <h1 className="mt-3 text-3xl font-bold leading-tight tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
              {post.baslik}
            </h1>
          </header>
        </ScrollReveal>

        {post.kapak_url && (
          <ScrollReveal className="mt-8">
            <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-slate-100 shadow-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={post.kapak_url}
                alt={post.baslik}
                className="aspect-[16/9] w-full object-cover"
              />
            </div>
          </ScrollReveal>
        )}

        {post.icerik && (
          <ScrollReveal className="mt-8 max-w-3xl">
            <div className="whitespace-pre-wrap text-base leading-relaxed text-slate-700 sm:text-lg sm:leading-loose">
              {post.icerik}
            </div>
          </ScrollReveal>
        )}

        <ScrollReveal className="mt-8 max-w-3xl">
          <nav
            className="flex flex-wrap gap-4 border-t border-slate-100 pt-8 text-sm"
            aria-label="İlgili sayfalar"
          >
            <Link
              href={`/blog/${post.slug}`}
              className="font-medium text-slate-600 hover:text-emerald-700"
            >
              Esnaf Rehberi&apos;nde oku
            </Link>
            <Link
              href={`/${shopSlug}`}
              className="font-semibold text-emerald-700 hover:text-emerald-800"
            >
              {shopName} vitrini
            </Link>
            <Link href="/" className="font-medium text-slate-600 hover:text-emerald-700">
              Ana sayfa
            </Link>
          </nav>
        </ScrollReveal>
      </article>
    </div>
  );
}
