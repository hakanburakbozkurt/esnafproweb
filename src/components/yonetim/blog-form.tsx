"use client";

import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import { ImageUploadBox } from "@/components/dukkan/image-upload-box";
import { BlogRichTextEditor } from "@/components/yonetim/blog-rich-text-editor";
import { VitrinDotGrid } from "@/components/dukkan/vitrin/vitrin-open-section";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { BlogFormState } from "@/lib/dukkan/blog-actions";
import { slugify } from "@/lib/utils/slug";
import type { DukkanBlogYazisi } from "@/types/database.types";

type BlogFormPost = Pick<
  DukkanBlogYazisi,
  | "id"
  | "baslik"
  | "slug"
  | "icerik"
  | "kapak_url"
  | "yayinda"
  | "meta_title"
  | "meta_description"
>;

type BlogFormProps = {
  storeSlug: string;
  mode: "create" | "edit";
  initialPost?: BlogFormPost;
  submitAction: (
    prevState: BlogFormState,
    formData: FormData
  ) => Promise<BlogFormState>;
  cancelHref: string;
  submitLabel: string;
  pendingLabel: string;
};

export function BlogForm({
  storeSlug,
  mode,
  initialPost,
  submitAction,
  cancelHref,
  submitLabel,
  pendingLabel,
}: BlogFormProps) {
  const [state, formAction, isPending] = useActionState(submitAction, {});
  const [kapakUrl, setKapakUrl] = useState(initialPost?.kapak_url ?? "");
  const [baslik, setBaslik] = useState(initialPost?.baslik ?? "");
  const [slug, setSlug] = useState(initialPost?.slug ?? "");
  const [metaDescription, setMetaDescription] = useState(
    initialPost?.meta_description ?? ""
  );
  const [slugTouched, setSlugTouched] = useState(mode === "edit");

  useEffect(() => {
    if (mode === "create" && !slugTouched && baslik.trim()) {
      setSlug(slugify(baslik));
    }
  }, [baslik, mode, slugTouched]);

  return (
    <div className="relative mx-auto w-full max-w-3xl">
      <VitrinDotGrid />

      <form
        action={formAction}
        className="space-y-8 rounded-3xl border border-slate-200/60 bg-white/90 p-6 shadow-sm sm:p-8"
      >
        {mode === "edit" && initialPost && (
          <input type="hidden" name="post_id" value={initialPost.id} />
        )}

        <section className="space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Kapak & Başlık</h2>
            <p className="mt-1 text-sm text-slate-500">
              Kapak görselini yükleyin; vitrin kartlarında ve detay sayfasında görünür.
            </p>
          </div>

          <ImageUploadBox
            label="Kapak Görseli"
            hint="Dosya yükleyin veya mevcut görseli değiştirin — mobilde taşma yapmaz"
            name="kapak_url"
            value={kapakUrl}
            onChange={setKapakUrl}
            storeSlug={storeSlug}
            subfolder="blog"
            variant="banner"
          />

          <Field
            label="Blog Başlığı"
            hint="Sayfada görünen ana başlık — okuyucu için net ve çekici olsun"
          >
            <Input
              name="baslik"
              required
              value={baslik}
              onChange={(event) => setBaslik(event.target.value)}
              placeholder="Örn: Apple Watch Kordon Çeşitleri ve Seçim Rehberi"
              className="text-base font-semibold sm:text-lg"
            />
          </Field>
        </section>

        <section className="space-y-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">İçerik</h2>
            <p className="mt-1 text-sm text-slate-500">
              Zengin metin editörü ile biçimlendirin; HTML olarak kaydedilir.
            </p>
          </div>

          <BlogRichTextEditor
            name="icerik"
            defaultValue={initialPost?.icerik}
            placeholder="Ürün, hizmet ve uzmanlık alanlarınızı detaylı anlatın…"
          />
        </section>

        <section className="space-y-6 rounded-2xl border border-slate-200/80 bg-slate-50/60 p-5 sm:p-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900">SEO Ayarları</h2>
            <p className="mt-1 text-sm text-slate-500">
              Google ve sosyal medya paylaşımları için özelleştirilmiş meta etiketler.
            </p>
          </div>

          <Field
            label="Meta Başlık (SEO Title)"
            hint="Boş bırakılırsa blog başlığı kullanılır"
          >
            <Input
              name="meta_title"
              defaultValue={initialPost?.meta_title ?? ""}
              placeholder="Arama sonuçlarında görünecek başlık"
            />
          </Field>

          <Field
            label="Meta Açıklama (Meta Description)"
            hint="Google snippet için 150-160 karakter önerilir"
          >
            <Textarea
              name="meta_description"
              rows={3}
              value={metaDescription}
              onChange={(event) => setMetaDescription(event.target.value)}
              placeholder="Arama sonuçlarında snippet altında görünecek özet"
              maxLength={320}
            />
            <p className="mt-1 text-xs text-slate-400">
              {metaDescription.length} / 160 karakter (önerilen)
            </p>
          </Field>

          <Field
            label="URL Slug"
            hint={`Adres: esnafpro.app/${storeSlug}/blog/…`}
          >
            <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center">
              <span className="shrink-0 text-sm text-slate-400">/{storeSlug}/blog/</span>
              <Input
                name="slug"
                required
                value={slug}
                onChange={(event) => {
                  setSlugTouched(true);
                  setSlug(slugify(event.target.value));
                }}
                placeholder="apple-watch-kordon-cesitleri"
                className="min-w-0 font-mono text-sm"
              />
            </div>
          </Field>
        </section>

        <section className="space-y-4">
          <Field label="Yayın durumu">
            <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-200/80 bg-white px-4 py-3">
              <input
                type="checkbox"
                name="yayinda"
                value="true"
                defaultChecked={initialPost?.yayinda ?? mode === "create"}
                className="mt-0.5 size-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
              <span className="text-sm text-slate-700">
                <span className="font-semibold text-slate-900">Yayında</span>
                <span className="mt-0.5 block text-slate-500">
                  İşaretli değilse yazı taslak olarak kaydedilir; vitrin ve arama
                  sonuçlarında görünmez.
                </span>
              </span>
            </label>
          </Field>
        </section>

        {state.error && (
          <p className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
            {state.error}
          </p>
        )}

        <div className="flex flex-wrap gap-3 border-t border-slate-200/60 pt-6">
          <Button type="submit" disabled={isPending} className="min-h-11">
            {isPending ? pendingLabel : submitLabel}
          </Button>
          <Link
            href={cancelHref}
            className="inline-flex min-h-11 items-center rounded-full border border-slate-200 px-5 text-sm font-semibold text-slate-600 transition hover:border-slate-300"
          >
            Vazgeç
          </Link>
        </div>
      </form>
    </div>
  );
}
