"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";
import { createDukkan, type DukkanFormState } from "@/lib/dukkan/actions";
import { AuthRequiredCard } from "@/components/auth/auth-required-card";
import { DukkanForm } from "@/components/dukkan/dukkan-form";
import { SubPageShell } from "@/components/layout/sub-page-shell";

const initialState: DukkanFormState = {};

function DukkanAcForm() {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(createDukkan, initialState);

  useEffect(() => {
    if (state.success && state.slug) {
      router.push(`/${state.slug}`);
    }
  }, [state.success, state.slug, router]);

  if (state.success && state.slug) {
    return (
      <div className="max-w-lg rounded-2xl border border-slate-200/60 bg-white/80 px-6 py-8 text-center lg:px-8">
        <p className="text-sm text-slate-500 lg:text-base">
          Vitrin sayfanıza yönlendiriliyorsunuz…
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <DukkanForm
        action={formAction}
        submitLabel="Mağazayı Aç"
        error={state.error}
        warning={state.warning}
        isPending={isPending}
        layout="wide"
      />
    </div>
  );
}

export default function DukkanAcPage({
  authenticated,
}: {
  authenticated: boolean;
}) {
  return (
    <SubPageShell
      title={
        <>
          Mağaza <span className="text-emerald-600">Aç</span>
        </>
      }
      description="Giriş yapan esnaf olarak vitrininizi oluşturun ve müşterilerinize dijital olarak ulaşın."
    >
      {!authenticated ? (
        <AuthRequiredCard
          description="Mağaza açmak için EsnafPRO hesabınızla giriş yapmalısınız."
          loginHref="/giris?next=/dukkan-ac"
        />
      ) : (
        <DukkanAcForm />
      )}
    </SubPageShell>
  );
}
