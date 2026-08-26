"use client";

import Link from "next/link";
import { useActionState } from "react";
import { deleteBlogPost, type BlogFormState } from "@/lib/dukkan/blog-actions";
import type { DukkanBlogYazisi } from "@/types/database.types";
import { formatBlogDate } from "@/lib/blog/public-blog-post.types";

function DeleteBlogButton({ postId, baslik }: { postId: string; baslik: string }) {
  const [state, formAction, isPending] = useActionState(deleteBlogPost, {} as BlogFormState);

  return (
    <form action={formAction} className="inline">
      <input type="hidden" name="post_id" value={postId} />
      <button
        type="submit"
        disabled={isPending}
        onClick={(event) => {
          if (
            !window.confirm(
              `"${baslik}" yazısını kalıcı olarak silmek istediğinize emin misiniz?`
            )
          ) {
            event.preventDefault();
          }
        }}
        className="inline-flex min-h-9 items-center rounded-full border border-red-200 px-4 text-xs font-semibold text-red-600 transition hover:border-red-300 hover:bg-red-50 disabled:opacity-60"
      >
        {isPending ? "Siliniyor…" : "Sil"}
      </button>
      {state.error && (
        <p className="mt-2 text-xs text-red-600">{state.error}</p>
      )}
    </form>
  );
}

export function BlogYonetimClient({
  posts,
  shopSlug,
}: {
  posts: DukkanBlogYazisi[];
  shopSlug: string;
}) {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-600">
          {posts.length} blog yazısı · Vitrin:{" "}
          <Link href={`/${shopSlug}/blog`} className="font-medium text-emerald-700 hover:underline">
            /{shopSlug}/blog
          </Link>
        </p>
        <Link
          href="/yonetim/blog/yeni"
          className="inline-flex min-h-11 items-center rounded-full bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-500 px-5 text-sm font-bold text-white shadow-lg shadow-emerald-500/20 transition hover:shadow-emerald-500/30"
        >
          Yeni Yazı Ekle
        </Link>
      </div>

      {posts.length === 0 ? (
        <div className="rounded-3xl border border-emerald-100 bg-emerald-50/50 px-6 py-10 text-center">
          <p className="text-sm text-slate-600">Henüz blog yazınız yok.</p>
          <Link
            href="/yonetim/blog/yeni"
            className="mt-4 inline-flex text-sm font-semibold text-emerald-700 hover:underline"
          >
            İlk yazınızı oluşturun →
          </Link>
        </div>
      ) : (
        <ul className="divide-y divide-slate-200/80 overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm">
          {posts.map((post) => (
            <li
              key={post.id}
              className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="truncate text-base font-bold text-slate-900 sm:text-lg">
                    {post.baslik}
                  </h2>
                  <span
                    className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                      post.yayinda
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {post.yayinda ? "Yayında" : "Taslak"}
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-400">
                  {formatBlogDate(post.created_at)} · /{shopSlug}/blog/{post.slug}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {post.yayinda && (
                  <Link
                    href={`/${shopSlug}/blog/${post.slug}`}
                    className="inline-flex min-h-9 items-center rounded-full border border-slate-200 px-4 text-xs font-semibold text-slate-600 transition hover:border-emerald-300 hover:text-emerald-700"
                  >
                    Görüntüle
                  </Link>
                )}
                <Link
                  href={`/yonetim/blog/${post.id}/duzenle`}
                  className="inline-flex min-h-9 items-center rounded-full border border-emerald-200 bg-emerald-50 px-4 text-xs font-semibold text-emerald-700 transition hover:border-emerald-300"
                >
                  Düzenle
                </Link>
                <DeleteBlogButton postId={post.id} baslik={post.baslik} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
