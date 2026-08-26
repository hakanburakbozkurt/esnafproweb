"use client";

import { BlogForm } from "@/components/yonetim/blog-form";
import { updateBlogPost } from "@/lib/dukkan/blog-actions";
import type { DukkanBlogYazisi } from "@/types/database.types";

export function BlogDuzenleForm({
  storeSlug,
  post,
}: {
  storeSlug: string;
  post: DukkanBlogYazisi;
}) {
  return (
    <BlogForm
      storeSlug={storeSlug}
      mode="edit"
      initialPost={post}
      submitAction={updateBlogPost}
      cancelHref="/yonetim/blog"
      submitLabel="Değişiklikleri Kaydet"
      pendingLabel="Güncelleniyor…"
    />
  );
}
