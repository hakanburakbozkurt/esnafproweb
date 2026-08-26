"use client";

import { BlogForm } from "@/components/yonetim/blog-form";
import { createBlogPost } from "@/lib/dukkan/blog-actions";

export function BlogYeniForm({ storeSlug }: { storeSlug: string }) {
  return (
    <BlogForm
      storeSlug={storeSlug}
      mode="create"
      submitAction={createBlogPost}
      cancelHref="/yonetim/blog"
      submitLabel="Yazıyı Yayınla"
      pendingLabel="Kaydediliyor…"
    />
  );
}
