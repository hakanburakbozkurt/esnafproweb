"use client";

import Link from "next/link";
import { useActionState } from "react";
import {
  deletePlatformBlogPost,
  togglePlatformBlogPost,
  type PlatformBlogFormState,
} from "@/lib/blog/platform-blog-actions";
import { platformBlogCategoryLabel } from "@/lib/blog/platform-blog.constants";
import { formatBlogDate } from "@/lib/blog/public-blog-post.types";
import type { PlatformBlogYazisi } from "@/types/database.types";

function ToggleButton({ post }: { post: PlatformBlogYazisi }) {
  const [state, formAction, isPending] = useActionState(
    togglePlatformBlogPost,
    {} as PlatformBlogFormState
  );

  return (
    <form action={formAction} className="inline">
      <input type="hidden" name="post_id" value={post.id} />
      <button
        type="submit"
        disabled={isPending}
        className={`inline-flex min-h-9 items-center rounded-lg border px-3.5 text-xs font-semibold transition disabled:opacity-60 ${
          post.yayinda
            ? "border-zinc-700 bg-zinc-900 text-zinc-300 hover:border-zinc-600"
            : "border-emerald-500/40 bg-emerald-500/10 text-emerald-300 hover:border-emerald-400"
        }`}
      >
        {isPending
          ? "Kaydediliyor…"
          : post.yayinda
            ? "Yayından al"
            : "Yayınla"}
      </button>
      {state.error && <p className="mt-2 text-xs text-red-400">{state.error}</p>}
    </form>
  );
}

function DeleteButton({ post }: { post: PlatformBlogYazisi }) {
  const [state, formAction, isPending] = useActionState(
    deletePlatformBlogPost,
    {} as PlatformBlogFormState
  );

  return (
    <form action={formAction} className="inline">
      <input type="hidden" name="post_id" value={post.id} />
      <button
        type="submit"
        disabled={isPending}
        onClick={(event) => {
          if (
            !window.confirm(
              `"${post.baslik}" yazısını kalıcı olarak silmek istiyor musun?`
            )
          ) {
            event.preventDefault();
          }
        }}
        className="inline-flex min-h-9 items-center rounded-lg border border-red-500/40 px-3.5 text-xs font-semibold text-red-300 transition hover:border-red-400 hover:bg-red-500/10 disabled:opacity-60"
      >
        {isPending ? "Siliniyor…" : "Sil"}
      </button>
      {state.error && <p className="mt-2 text-xs text-red-400">{state.error}</p>}
    </form>
  );
}

export function PlatformBlogListClient({
  posts,
}: {
  posts: PlatformBlogYazisi[];
}) {
  const yayindaSayisi = posts.filter((post) => post.yayinda).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-100">
            Platform Blog
          </h1>
          <p className="mt-1.5 text-sm text-zinc-400">
            {posts.length} yazı · {yayindaSayisi} yayında ·{" "}
            <Link href="/blog" className="text-indigo-400 hover:underline">
              /blog
            </Link>
          </p>
        </div>

        <Link
          href="/yonetim/admin/blog/yeni"
          className="inline-flex min-h-11 items-center rounded-lg bg-indigo-500 px-5 text-sm font-semibold text-white transition hover:bg-indigo-400"
        >
          Yeni Yazı
        </Link>
      </div>

      {posts.length === 0 ? (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 px-6 py-12 text-center">
          <p className="text-sm text-zinc-400">
            Henüz platform yazısı yok. İlk yazı organik trafiğin başlangıcı.
          </p>
          <Link
            href="/yonetim/admin/blog/yeni"
            className="mt-4 inline-flex text-sm font-semibold text-indigo-400 hover:underline"
          >
            İlk yazıyı oluştur →
          </Link>
        </div>
      ) : (
        <ul className="divide-y divide-zinc-800 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/60">
          {posts.map((post) => (
            <li
              key={post.id}
              className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="truncate text-base font-semibold text-zinc-100">
                    {post.baslik}
                  </h2>
                  <span
                    className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                      post.yayinda
                        ? "bg-emerald-500/15 text-emerald-300"
                        : "bg-zinc-800 text-zinc-400"
                    }`}
                  >
                    {post.yayinda ? "Yayında" : "Taslak"}
                  </span>
                  <span className="inline-flex rounded-full bg-indigo-500/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-indigo-300">
                    {platformBlogCategoryLabel(post.kategori)}
                  </span>
                </div>
                <p className="mt-1.5 truncate text-xs text-zinc-500">
                  {formatBlogDate(post.yayin_tarihi ?? post.created_at)} ·
                  /blog/{post.slug}
                  {post.anahtar_kelime ? ` · 🎯 ${post.anahtar_kelime}` : ""}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {post.yayinda && (
                  <Link
                    href={`/blog/${post.slug}`}
                    className="inline-flex min-h-9 items-center rounded-lg border border-zinc-700 px-3.5 text-xs font-semibold text-zinc-300 transition hover:border-zinc-600"
                  >
                    Görüntüle
                  </Link>
                )}
                <Link
                  href={`/yonetim/admin/blog/${post.id}/duzenle`}
                  className="inline-flex min-h-9 items-center rounded-lg border border-indigo-500/40 bg-indigo-500/10 px-3.5 text-xs font-semibold text-indigo-300 transition hover:border-indigo-400"
                >
                  Düzenle
                </Link>
                <ToggleButton post={post} />
                <DeleteButton post={post} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
