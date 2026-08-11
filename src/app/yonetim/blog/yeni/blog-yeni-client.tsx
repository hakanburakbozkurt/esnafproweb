"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { ImageUploadBox } from "@/components/dukkan/image-upload-box";
import { VitrinDotGrid } from "@/components/dukkan/vitrin/vitrin-open-section";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createBlogPost, type BlogFormState } from "@/lib/dukkan/blog-actions";

const initialState: BlogFormState = {};

export function BlogYeniForm({ storeSlug }: { storeSlug: string }) {
  const [state, formAction, isPending] = useActionState(createBlogPost, initialState);
  const [kapakUrl, setKapakUrl] = useState("");

  return (
    <div className="relative mx-auto w-full max-w-3xl">
      <VitrinDotGrid />

      <form
        action={formAction}
        className="space-y-6 rounded-3xl border border-slate-200/60 bg-white/90 p-6 shadow-sm sm:p-8"
      >
        <ImageUploadBox
          label="Kapak Görseli"
          hint="Yatay (16:9) format önerilir — yazınızın vitrinde ve detay sayfasında görünür"
          name="kapak_url"
          value={kapakUrl}
          onChange={setKapakUrl}
          storeSlug={storeSlug}
          subfolder="blog"
          variant="banner"
        />

        <Field label="Blog Başlığı" hint="Yerel aramalarda görünecek ana başlık — kısa ve dikkat çekici olsun">
          <Input
            name="baslik"
            required
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
            placeholder="Müşterilerinize ve arama motorlarına yönelik bilgilendirici bir yazı yazın. Hizmet bölgeniz, uzmanlık alanlarınız ve müşterilerinize sunduğunuz değer hakkında detaylı bilgi verin…"
            className="min-h-[280px] resize-y text-base leading-relaxed sm:min-h-[320px]"
          />
        </Field>

        {state.error && (
          <p className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
            {state.error}
          </p>
        )}

        <div className="flex flex-wrap gap-3">
          <Button type="submit" disabled={isPending} className="min-h-11">
            {isPending ? "Kaydediliyor…" : "Yazıyı Yayınla"}
          </Button>
          <Link
            href="/yonetim"
            className="inline-flex min-h-11 items-center rounded-full border border-slate-200 px-5 text-sm font-semibold text-slate-600 transition hover:border-slate-300"
          >
            Vazgeç
          </Link>
        </div>
      </form>
    </div>
  );
}
