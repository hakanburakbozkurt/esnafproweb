"use client";

import Link from "next/link";
import { useActionState } from "react";
import {
  requestPasswordReset,
  type PasswordResetRequestState,
} from "@/lib/auth/password-actions";
import { SubPageShell } from "@/components/layout/sub-page-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

const initialState: PasswordResetRequestState = {};

export function SifreSifirlaForm() {
  const [state, formAction, isPending] = useActionState(
    requestPasswordReset,
    initialState
  );

  return (
    <SubPageShell
      title={
        <>
          Şifrenizi <span className="text-emerald-600">sıfırlayın</span>
        </>
      }
      description="E-posta adresinizi girin; size güvenli bir şifre yenileme bağlantısı gönderelim."
      contentWidth="md"
      centerHeader
    >
      <Card className="w-full">
        {state.success ? (
          <div className="space-y-5">
            <p className="rounded-xl border border-emerald-200/80 bg-emerald-50 px-4 py-3 text-sm leading-relaxed text-emerald-800">
              {state.message}
            </p>
            <p className="text-sm leading-relaxed text-slate-500">
              Gelen kutunuzu ve gerekiyorsa spam klasörünüzü kontrol edin. Bağlantı
              kısa süre içinde geçerliliğini yitirir.
            </p>
            <Link
              href="/giris"
              className="inline-flex min-h-11 w-full items-center justify-center rounded-full bg-emerald-600 px-5 text-sm font-semibold text-white transition hover:bg-emerald-700"
            >
              Giriş sayfasına dön
            </Link>
          </div>
        ) : (
          <form action={formAction} className="space-y-5">
            <Field label="E-posta" hint="Hesabınızda kayıtlı e-posta adresi">
              <Input
                type="email"
                name="email"
                required
                autoComplete="email"
                placeholder="ornek@esnafpro.com"
              />
            </Field>

            {state.error && (
              <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
                {state.error}
              </p>
            )}

            <Button type="submit" disabled={isPending} className="w-full">
              {isPending ? "Gönderiliyor…" : "Şifre Sıfırlama Bağlantısı Gönder"}
            </Button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-slate-500">
          Şifrenizi hatırladınız mı?{" "}
          <Link href="/giris" className="font-medium text-emerald-600 hover:text-emerald-700">
            Giriş yapın
          </Link>
        </p>
      </Card>
    </SubPageShell>
  );
}
