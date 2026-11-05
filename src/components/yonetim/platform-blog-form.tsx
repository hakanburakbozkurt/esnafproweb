"use client";

import Link from "next/link";
import { useActionState, useState, type FormEvent } from "react";
import { ImageUploadBox } from "@/components/dukkan/image-upload-box";
import { BlogRichTextEditor } from "@/components/yonetim/blog-rich-text-editor";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  PLATFORM_BLOG_CATEGORIES,
  PLATFORM_BLOG_DEFAULT_CATEGORY,
  PLATFORM_BLOG_PUBLISH_INFO,
  validatePlatformBlogPublish,
} from "@/lib/blog/platform-blog.constants";
import type { PlatformBlogFormState } from "@/lib/blog/platform-blog-actions";
import { slugify } from "@/lib/utils/slug";
import type { PlatformBlogYazisi } from "@/types/database.types";

/** Kapak görselleri store-assets/esnafpro-blog/ altında tutulur */
const PLATFORM_BLOG_ASSET_SLUG = "esnafpro-blog";

type PlatformBlogFormProps = {
  mode: "create" | "edit";
  initialPost?: PlatformBlogYazisi;
  submitAction: (
    prevState: PlatformBlogFormState,
    formData: FormData
  ) => Promise<PlatformBlogFormState>;
  submitLabel: string;
  pendingLabel: string;
};

export function PlatformBlogForm({
  mode,
  initialPost,
  submitAction,
  submitLabel,
  pendingLabel,
}: PlatformBlogFormProps) {
  const [state, formAction, isPending] = useActionState(submitAction, {});
  const [baslik, setBaslik] = useState(initialPost?.baslik ?? "");
  const [slug, setSlug] = useState(initialPost?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(mode === "edit");
  const [kapakUrl, setKapakUrl] = useState(initialPost?.kapak_url ?? "");
  const [ozet, setOzet] = useState(initialPost?.ozet ?? "");
  const [metaDescription, setMetaDescription] = useState(
    initialPost?.meta_description ?? ""
  );
  const [clientError, setClientError] = useState<string | null>(null);

  /** Başlık yazılırken slug'ı türetir — kullanıcı slug'a dokunduysa karışmaz */
  function handleBaslikChange(value: string) {
    setBaslik(value);

    if (mode === "create" && !slugTouched) {
      setSlug(slugify(value));
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    setClientError(null);

    const formData = new FormData(event.currentTarget);
    if (formData.get("yayinda") !== "true") return;

    const check = validatePlatformBlogPublish({
      ozet: String(formData.get("ozet") ?? ""),
      icerik: String(formData.get("icerik") ?? ""),
      kapak_url: String(formData.get("kapak_url") ?? ""),
    });

    if (!check.ok) {
      event.preventDefault();
      setClientError(check.error);
    }
  }

  return (
    <div className="mx-auto w-full max-w-3xl">
      <div
        role="status"
        className="mb-6 rounded-2xl border border-sky-100 bg-sky-50/80 px-4 py-3.5 text-sm leading-relaxed text-sky-900 sm:px-5"
      >
        {PLATFORM_BLOG_PUBLISH_INFO}
      </div>

      <form
        action={formAction}
        onSubmit={handleSubmit}
        className="space-y-8 rounded-3xl border border-slate-200/60 bg-white p-6 shadow-sm sm:p-8"
      >
        {mode === "edit" && initialPost && (
          <input type="hidden" name="post_id" value={initialPost.id} />
        )}

        <section className="space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Kapak & Başlık</h2>
            <p className="mt-1 text-sm text-slate-500">
              Kapak görseli liste kartlarında ve sosyal paylaşımda görünür.
            </p>
          </div>

          <ImageUploadBox
            label="Kapak Görseli"
            hint="Yatay (16:9) görsel yükleyin"
            name="kapak_url"
            value={kapakUrl}
            onChange={setKapakUrl}
            storeSlug={PLATFORM_BLOG_ASSET_SLUG}
            subfolder="platform-blog"
            variant="banner"
          />

          <Field
            label="Kapak Görseli URL (yükleme yerine elle girmek için)"
            hint="Yükleme yaptıysan burayı boş bırak — otomatik dolar"
          >
            <Input
              value={kapakUrl}
              onChange={(event) => setKapakUrl(event.target.value)}
              placeholder="https://…"
              className="font-mono text-xs"
            />
          </Field>

          <Field
            label="Yazı Başlığı"
            hint="Hedef aramayı başlıkta geçir — örn. 'Telefon Ekran Değişimi Fiyatları 2026'"
          >
            <Input
              name="baslik"
              required
              value={baslik}
              onChange={(event) => handleBaslikChange(event.target.value)}
              placeholder="Örn: Telefon Ekran Değişimi Fiyatları ve Dikkat Edilecekler"
              className="text-base font-semibold sm:text-lg"
            />
          </Field>

          <Field
            label="Kısa Özet"
            hint="Liste kartlarında görünür; yayın için zorunlu (140-200 karakter)"
          >
            <Textarea
              name="ozet"
              rows={3}
              value={ozet}
              onChange={(event) => setOzet(event.target.value)}
              placeholder="Yazının ne anlattığını tek paragrafta özetle"
              maxLength={320}
            />
            <p className="mt-1 text-xs text-slate-400">
              {ozet.length} / 200 karakter (önerilen)
            </p>
          </Field>

          <Field label="Kategori" hint="Blog listesinde filtre olarak kullanılır">
            <select
              name="kategori"
              defaultValue={initialPost?.kategori ?? PLATFORM_BLOG_DEFAULT_CATEGORY}
              className="min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
            >
              {PLATFORM_BLOG_CATEGORIES.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </Field>
        </section>

        <section className="space-y-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">İçerik</h2>
            <p className="mt-1 text-sm text-slate-500">
              H2/H3 alt başlıklar kullan — Google bölümleri böyle ayırt eder.
            </p>
          </div>

          <BlogRichTextEditor
            name="icerik"
            defaultValue={initialPost?.icerik}
            placeholder="Yazıyı buraya yaz…"
          />
        </section>

        <section className="space-y-6 rounded-2xl border border-slate-200/80 bg-slate-50/60 p-5 sm:p-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900">SEO Ayarları</h2>
            <p className="mt-1 text-sm text-slate-500">
              Arama sonuçlarında ve sosyal paylaşımlarda görünen meta etiketler.
            </p>
          </div>

          <Field
            label="Hedef Anahtar Kelime"
            hint="Takip için — örn. 'telefon ekran değişimi fiyatları'"
          >
            <Input
              name="anahtar_kelime"
              defaultValue={initialPost?.anahtar_kelime ?? ""}
              placeholder="telefon ekran değişimi fiyatları"
            />
          </Field>

          <Field
            label="Meta Başlık (SEO Title)"
            hint="Boş bırakılırsa yazı başlığı kullanılır"
          >
            <Input
              name="meta_title"
              defaultValue={initialPost?.meta_title ?? ""}
              placeholder="Arama sonuçlarında görünecek başlık"
            />
          </Field>

          <Field
            label="Meta Açıklama"
            hint="Google snippet için 150-160 karakter önerilir"
          >
            <Textarea
              name="meta_description"
              rows={3}
              value={metaDescription}
              onChange={(event) => setMetaDescription(event.target.value)}
              placeholder="Arama sonuçlarında snippet olarak görünecek özet"
              maxLength={320}
            />
            <p className="mt-1 text-xs text-slate-400">
              {metaDescription.length} / 160 karakter (önerilen)
            </p>
          </Field>

          <Field label="URL Slug" hint="Adres: esnafpro.app/blog/…">
            <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center">
              <span className="shrink-0 text-sm text-slate-400">/blog/</span>
              <Input
                name="slug"
                required
                value={slug}
                onChange={(event) => {
                  setSlugTouched(true);
                  setSlug(slugify(event.target.value));
                }}
                placeholder="telefon-ekran-degisimi-fiyatlari"
                className="min-w-0 font-mono text-sm"
              />
            </div>
          </Field>

          <Field label="Yazar" hint="Boş bırakılırsa EsnafPRO yazılır">
            <Input
              name="yazar_adi"
              defaultValue={initialPost?.yazar_adi ?? "EsnafPRO"}
              placeholder="EsnafPRO"
            />
          </Field>
        </section>

        <section className="space-y-4">
          <Field label="Yayın durumu">
            <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-200/80 bg-white px-4 py-3">
              <input
                type="checkbox"
                name="yayinda"
                value="true"
                defaultChecked={initialPost?.yayinda ?? false}
                className="mt-0.5 size-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
              <span className="text-sm text-slate-700">
                <span className="font-semibold text-slate-900">Yayında</span>
                <span className="mt-0.5 block text-slate-500">
                  Kapak görseli, özet ve en az 600 karakter içerik olmadan
                  yayınlanamaz. İşaretli değilse taslak olarak kaydedilir.
                </span>
              </span>
            </label>
          </Field>
        </section>

        {(clientError || state.error) && (
          <p className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
            {clientError ?? state.error}
          </p>
        )}

        <div className="flex flex-wrap gap-3 border-t border-slate-200/60 pt-6">
          <Button type="submit" disabled={isPending} className="min-h-11">
            {isPending ? pendingLabel : submitLabel}
          </Button>
          <Link
            href="/yonetim/admin/blog"
            className="inline-flex min-h-11 items-center rounded-full border border-slate-200 px-5 text-sm font-semibold text-slate-600 transition hover:border-slate-300"
          >
            Vazgeç
          </Link>
        </div>
      </form>
    </div>
  );
}
