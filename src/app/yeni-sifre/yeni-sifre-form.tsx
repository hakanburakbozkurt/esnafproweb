"use client";

import Link from "next/link";
import { useActionState } from "react";
import {
  updatePasswordAndRedirect,
  type UpdatePasswordState,
} from "@/lib/auth/password-actions";
import { SubPageShell } from "@/components/layout/sub-page-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

const initialState: UpdatePasswordState = {};

export function YeniSifreForm({ hasSession }: { hasSession: boolean }) {
  const [state, formAction, isPending] = useActionState(
    updatePasswordAndRedirect,
    initialState
  );

  return (
    <SubPageShell
      title={
        <>
          Yeni <span className="text-emerald-600">şifrenizi</span> belirleyin
        </>
      }
      description="Güçlü ve hatırlaması kolay bir şifre seçin; ardından panele yönlendirileceksiniz."
      contentWidth="md"
      centerHeader
    >
      <Card className="w-full">
        {!hasSession ? (
          <div className="space-y-5">
            <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm leading-relaxed text-amber-800">
              Şifre yenileme oturumu bulunamadı veya süresi dolmuş. Lütfen yeni bir
              sıfırlama bağlantısı isteyin.
            </p>
            <Link
              href="/sifre-sifirla"
              className="inline-flex min-h-11 w-full items-center justify-center rounded-full bg-emerald-600 px-5 text-sm font-semibold text-white transition hover:bg-emerald-700"
            >
              Şifre sıfırlama bağlantısı gönder
            </Link>
          </div>
        ) : (
          <form action={formAction} className="space-y-5">
            <Field label="Yeni şifre" hint="En az 6 karakter kullanın.">
              <Input
                type="password"
                name="password"
                required
                minLength={6}
                autoComplete="new-password"
                placeholder="••••••••"
              />
            </Field>

            <Field label="Yeni şifre (tekrar)">
              <Input
                type="password"
                name="confirmPassword"
                required
                minLength={6}
                autoComplete="new-password"
                placeholder="••••••••"
              />
            </Field>

            {state.error && (
              <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
                {state.error}
              </p>
            )}

            <Button type="submit" disabled={isPending} className="w-full">
              {isPending ? "Kaydediliyor…" : "Şifremi Güncelle"}
            </Button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-slate-500">
          <Link href="/giris" className="font-medium text-emerald-600 hover:text-emerald-700">
            Giriş sayfasına dön
          </Link>
        </p>
      </Card>
    </SubPageShell>
  );
}
