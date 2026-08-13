import Link from "next/link";
import {
  blogExcerpt,
  formatBlogDate,
  type PublicBlogPost,
} from "@/lib/blog/public-blog-post.types";
import { cn } from "@/lib/utils/cn";

export function BlogPostCard({
  post,
  className,
  detailHref,
}: {
  post: PublicBlogPost;
  className?: string;
  /** Platform rehber detayı; verilmezse mağaza blog detayına gider */
  detailHref?: string;
}) {
  const href = detailHref ?? `/blog/${post.slug}`;

  return (
    <Link
      href={href}
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm transition hover:border-emerald-200 hover:shadow-md",
        className
      )}
    >
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-100">
        {post.kapak_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.kapak_url}
            alt={post.baslik}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-slate-100 to-emerald-50 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Esnaf Rehberi
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-600">
          {post.shop_name}
        </p>
        <time className="mt-2 text-xs font-medium text-slate-400">
          {formatBlogDate(post.created_at)}
        </time>
        <h2 className="mt-2 text-lg font-bold leading-snug text-slate-900 transition group-hover:text-emerald-700 sm:text-xl">
          {post.baslik}
        </h2>
        {post.icerik && (
          <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-slate-600">
            {blogExcerpt(post.icerik)}
          </p>
        )}
      </div>
    </Link>
  );
}

export function BlogComingSoonPlaceholder() {
  return (
    <div className="rounded-3xl border border-emerald-100 bg-gradient-to-br from-emerald-50/80 via-white to-teal-50/40 p-8 text-center shadow-sm sm:p-10">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-600">
        Esnaf Rehberi
      </p>
      <h3 className="mt-3 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
        Yakında Esnaf Rehberimiz Yayında
      </h3>
      <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-slate-600 sm:text-base">
        Esnaflarımızın yerel ipuçları, sektör rehberleri ve mağaza duyuruları
        burada listelenecek. İlk yazınızı eklemek için mağaza panelinizi
        kullanabilirsiniz.
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/blog"
          className="inline-flex min-h-11 items-center justify-center rounded-full border border-emerald-200 bg-white px-5 py-2.5 text-sm font-semibold text-emerald-700 transition hover:border-emerald-300 hover:bg-emerald-50"
        >
          Rehber Sayfası
        </Link>
        <Link
          href="/giris?next=/yonetim/blog/yeni"
          className="inline-flex min-h-11 items-center justify-center rounded-full bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-500 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-emerald-500/20 transition hover:shadow-emerald-500/30"
        >
          İlk Yazını Ekle
        </Link>
      </div>
    </div>
  );
}
