import Link from "next/link";
import { BlogCardCover } from "@/components/landing/blog-card-cover";
import { platformBlogCategoryLabel } from "@/lib/blog/platform-blog.constants";
import type { PlatformBlogListItem } from "@/lib/blog/platform-blog-posts";
import { formatBlogDate } from "@/lib/blog/public-blog-post.types";
import { cn } from "@/lib/utils/cn";

export function PlatformBlogCard({
  post,
  className,
}: {
  post: PlatformBlogListItem;
  className?: string;
}) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm transition hover:border-emerald-200 hover:shadow-md",
        className
      )}
    >
      <BlogCardCover src={post.kapak_url} alt={post.baslik} />

      <div className="flex min-h-0 flex-1 flex-col p-5 sm:p-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-600">
          {platformBlogCategoryLabel(post.kategori)}
        </p>
        <p className="mt-2 text-xs font-medium text-slate-400">
          {formatBlogDate(post.yayin_tarihi ?? post.created_at)} ·{" "}
          {post.okuma_suresi} dk okuma
        </p>
        <h2 className="mt-2 line-clamp-2 text-lg font-bold leading-snug text-slate-900 transition group-hover:text-emerald-700 sm:text-xl">
          {post.baslik}
        </h2>
        <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-slate-600">
          {post.gorunen_ozet}
        </p>
      </div>
    </Link>
  );
}
