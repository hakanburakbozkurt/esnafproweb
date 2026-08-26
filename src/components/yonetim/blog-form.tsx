"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { ImageUploadBox } from "@/components/dukkan/image-upload-box";
import { VitrinDotGrid } from "@/components/dukkan/vitrin/vitrin-open-section";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { BlogFormState } from "@/lib/dukkan/blog-actions";
import type { DukkanBlogYazisi } from "@/types/database.types";

type BlogFormProps = {
  storeSlug: string;
  mode: "create" | "edit";
  initialPost?: Pick<
    DukkanBlogYazisi,
    "id" | "baslik" | "icerik" | "kapak_url" | "yayinda"
  >;
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

  return (
    <div className="relative mx-auto w-full max-w-3xl">
      <VitrinDotGrid />

      <form
        action={formAction}
        className="space-y-6 rounded-3xl border border-slate-200/60 bg-white/90 p-6 shadow-sm sm:p-8"
      >
        {mode === "edit" && initialPost && (
          <input type="hidden" name="post_id" value={initialPost.id} />
        )}

        <ImageUploadBox
          label="Kapak Görseli"
          hint="Dikey veya yatay görsel yükleyebilirsiniz — kartlarda kırpılmadan gösterilir"
          name="kapak_url"
          value={kapakUrl}
          onChange={setKapakUrl}
          storeSlug={storeSlug}
          subfolder="blog"
          variant="banner"
        />

        <Field
          label="Blog Başlığı"
          hint="Yerel aramalarda görünecek ana başlık — kısa ve dikkat çekici olsun"
        >
          <Input
            name="baslik"
            required
            defaultValue={initialPost?.baslik ?? ""}
            placeholder="Örn: Kadıköy'de en hızlı telefon tamiri"
            className="text-base font-semibold sm:text-lg"
          />
        </Field>

        <Field
          label="İçerik"
          hint="Mahalle, hizmet ve uzmanlık alanlarınızı SEO uyumlu, samimi bir dille anlatın"
        >
          <Textarea
            name="icerik"
            rows={14}
            defaultValue={initialPost?.icerik ?? ""}
            placeholder="Müşterilerinize ve arama motorlarına yönelik bilgilendirici bir yazı yazın…"
            className="min-h-[280px] resize-y text-base leading-relaxed sm:min-h-[320px]"
          />
        </Field>

        {mode === "edit" && (
          <Field label="Yayın durumu">
            <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-slate-200/80 bg-slate-50/80 px-4 py-3">
              <input
                type="checkbox"
                name="yayinda"
                value="true"
                defaultChecked={initialPost?.yayinda ?? true}
                className="size-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
              <span className="text-sm text-slate-700">
                Yazı vitrinde ve arama sonuçlarında yayında görünsün
              </span>
            </label>
          </Field>
        )}

        {state.error && (
          <p className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
            {state.error}
          </p>
        )}

        <div className="flex flex-wrap gap-3">
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
