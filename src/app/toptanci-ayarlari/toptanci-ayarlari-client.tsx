"use client";

import Link from "next/link";
import { useActionState } from "react";
import { AuthRequiredCard } from "@/components/auth/auth-required-card";
import { SubPageShell } from "@/components/layout/sub-page-shell";
import { ToptanciProfileForm } from "@/components/toptanci/toptanci-profile-form";
import { WHOLESALER_XML_PATH } from "@/lib/auth/wholesaler";
import {
  updateToptanciProfile,
  type ToptanciFormState,
} from "@/lib/toptanci/actions";
import type { Toptanci } from "@/types/database.types";

const initialState: ToptanciFormState = {};

function ToptanciAyarlariForm({ toptanci }: { toptanci: Toptanci }) {
  const [state, formAction, isPending] = useActionState(
    updateToptanciProfile,
    initialState
  );

  return (
    <div className="space-y-6">
      {state.success && (
        <p className="rounded-2xl border border-emerald-100 bg-emerald-50 px-5 py-4 text-sm text-emerald-700 lg:text-base">
          Firma bilgileriniz güncellendi.{" "}
          <Link
            href={WHOLESALER_XML_PATH}
            className="font-medium underline underline-offset-2"
          >
            XML paneline dön
          </Link>
        </p>
      )}

      <ToptanciProfileForm
        action={formAction}
        submitLabel="Değişiklikleri Kaydet"
        pendingLabel="Güncelleniyor…"
        error={state.error}
        success={state.success}
        isPending={isPending}
        defaultValues={toptanci}
      />
    </div>
  );
}

export default function ToptanciAyarlariPage({
  authenticated,
  toptanci,
}: {
  authenticated: boolean;
  toptanci: Toptanci | null;
}) {
  return (
    <SubPageShell
      title={
        <>
          Firma <span className="text-emerald-600">Profili</span>
        </>
      }
      description="Toptancı firma bilgilerinizi güncelleyin. Slug değişikliği vitrin adresinizi etkiler."
      contentWidth="2xl"
      centerHeader
    >
      {!authenticated ? (
        <AuthRequiredCard
          description="Firma profiline erişmek için giriş yapmalısınız."
          loginHref="/giris?role=toptanci&next=/toptanci-ayarlari"
        />
      ) : !toptanci ? (
        <div className="rounded-2xl border border-slate-200/60 bg-white/80 px-6 py-8 text-center lg:px-8">
          <h2 className="text-lg font-semibold text-slate-900 lg:text-xl">
            Henüz firma profiliniz yok
          </h2>
          <p className="mt-2 text-sm text-slate-500 lg:text-base">
            Ayarları yönetebilmek için önce toptancı profilinizi oluşturmalısınız.
          </p>
          <Link
            href="/toptanci-ac"
            className="mt-6 inline-flex rounded-full bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-slate-800"
          >
            Profil Oluştur
          </Link>
        </div>
      ) : (
        <ToptanciAyarlariForm toptanci={toptanci} />
      )}
    </SubPageShell>
  );
}
