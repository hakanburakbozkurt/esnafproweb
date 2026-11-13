"use client";

import Link from "next/link";
import { useActionState } from "react";
import { SubPageShell } from "@/components/layout/sub-page-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { esnafKosullariOnayla } from "@/lib/dukkan/esnaf-adina-actions";
import { MARKA_TERMS_LABEL } from "@/lib/dukkan/marka-terms";

const kutuClass =
  "mt-0.5 h-5 w-5 shrink-0 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500";

export function DukkanOnaylaForm({
  dukkanAdi,
  vitrinUrl,
}: {
  dukkanAdi: string;
  vitrinUrl: string;
}) {
  const [state, formAction, isPending] = useActionState(esnafKosullariOnayla, {});

  return (
    <SubPageShell
      title={
        <>
          <span className="text-emerald-600">{dukkanAdi}</span> sayfanız hazır
        </>
      }
      description="Mağaza sayfanızı sizin için kurduk. Yayına almadan önce son bir onayınız gerekiyor."
      contentWidth="md"
      centerHeader
    >
      <Card className="w-full space-y-6">
        <div className="rounded-xl bg-emerald-50 px-4 py-3 text-sm leading-relaxed text-emerald-900">
          Sayfanızı açıp kontrol edin:{" "}
          <a
            href={vitrinUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="break-all font-semibold underline"
          >
            {vitrinUrl}
          </a>
          <br />
          Onayladığınızda sayfanız Google&apos;a açılır. Bilgileri daha sonra panelden
          değiştirebilirsiniz.
        </div>

        <form action={formAction} className="space-y-4">
          <label className="flex gap-3 text-sm leading-relaxed text-slate-700">
            <input type="checkbox" name="kosullar" className={kutuClass} required />
            <span>
              <Link href="/kullanim-kosullari" target="_blank" className="font-medium text-emerald-700 underline">
                Kullanım Koşulları
              </Link>
              &apos;nı ve{" "}
              <Link href="/kvkk-aydinlatma-metni" target="_blank" className="font-medium text-emerald-700 underline">
                KVKK Aydınlatma Metni
              </Link>
              &apos;ni okudum, kabul ediyorum. Mağaza bilgilerimin ve fotoğraflarımın bu sayfada
              yayınlanmasına izin veriyorum.
            </span>
          </label>

          <label className="flex gap-3 text-sm leading-relaxed text-slate-700">
            <input type="checkbox" name="marka" className={kutuClass} required />
            <span>{MARKA_TERMS_LABEL}</span>
          </label>

          {state.error && (
            <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{state.error}</p>
          )}

          <Button type="submit" disabled={isPending} className="w-full">
            {isPending ? "Kaydediliyor…" : "Onaylıyorum, sayfamı yayına al"}
          </Button>
        </form>
      </Card>
    </SubPageShell>
  );
}
