"use client";

import Link from "next/link";
import { useActionState } from "react";
import { AuthRequiredCard } from "@/components/auth/auth-required-card";
import { SubPageShell } from "@/components/layout/sub-page-shell";
import { ToptanciProfileForm } from "@/components/toptanci/toptanci-profile-form";
import {
  createToptanciProfile,
  type ToptanciFormState,
} from "@/lib/toptanci/actions";

const initialState: ToptanciFormState = {};

function ToptanciAcForm() {
  const [state, formAction, isPending] = useActionState(
    createToptanciProfile,
    initialState
  );

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-emerald-100/80 bg-white/80 px-6 py-5 shadow-sm lg:px-8">
        <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-700">
          Toptancı Kaydı
        </span>
        <p className="mt-4 text-sm leading-relaxed text-slate-500 lg:text-base">
          Mağaza açmadan firma bilgilerinizi tanımlayın ve size özel bir slug alın.
          Profiliniz tamamlandığında doğrudan XML yönetim paneline yönlendirileceksiniz.
        </p>
      </div>

      <ToptanciProfileForm
        action={formAction}
        submitLabel="Profili Kaydet ve XML Paneline Geç"
        pendingLabel="Kaydediliyor…"
        error={state.error}
        isPending={isPending}
      />

      <p className="text-center text-sm text-slate-500">
        Esnaf mısınız?{" "}
        <Link
          href="/dukkan-ac"
          className="font-medium text-emerald-600 hover:text-emerald-700"
        >
          Mağaza açın
        </Link>
      </p>
    </div>
  );
}

export default function ToptanciAcPage({
  authenticated,
}: {
  authenticated: boolean;
}) {
  return (
    <SubPageShell
      title={
        <>
          Toptancı <span className="text-emerald-600">Profili</span>
        </>
      }
      description="Firma bilgilerinizi tanımlayın, slug adresinizi alın ve XML stok besleme paneline geçin."
      contentWidth="2xl"
      centerHeader
    >
      {!authenticated ? (
        <AuthRequiredCard
          description="Toptancı profili oluşturmak için EsnafPRO hesabınızla giriş yapmalısınız."
          loginHref="/giris?role=toptanci&next=/toptanci-ac"
        />
      ) : (
        <ToptanciAcForm />
      )}
    </SubPageShell>
  );
}
