"use client";

import Link from "next/link";
import { useActionState } from "react";
import { updateDukkan, type DukkanFormState } from "@/lib/dukkan/actions";
import { AuthRequiredCard } from "@/components/auth/auth-required-card";
import { DukkanForm } from "@/components/dukkan/dukkan-form";
import { VitrinDotGrid } from "@/components/dukkan/vitrin/vitrin-open-section";
import { SubPageShell } from "@/components/layout/sub-page-shell";
import type { Dukkan, DukkanUrunu } from "@/types/database.types";

const initialState: DukkanFormState = {};

function DukkanAyarlariForm({
  dukkan,
  urunler,
}: {
  dukkan: Dukkan;
  urunler: DukkanUrunu[];
}) {
  const [state, formAction, isPending] = useActionState(updateDukkan, initialState);

  return (
    <div className="space-y-6">
      {state.success && (
        <p className="rounded-2xl border border-emerald-100 bg-emerald-50 px-5 py-4 text-sm text-emerald-700 lg:text-base">
          Mağaza bilgileriniz güncellendi.{" "}
          {state.slug && (
            <Link
              href={`/${state.slug}`}
              className="font-medium underline underline-offset-2"
            >
              Vitrini görüntüle
            </Link>
          )}
        </p>
      )}

      {state.warning && (
        <p className="rounded-2xl border border-amber-100 bg-amber-50 px-5 py-4 text-sm text-amber-800 lg:text-base">
          {state.warning}
        </p>
      )}

      <div className="relative mx-auto w-full max-w-5xl">
        <VitrinDotGrid />
        <DukkanForm
          action={formAction}
          submitLabel="Değişiklikleri Kaydet"
          pendingLabel="Güncelleniyor…"
          error={state.error}
          warning={state.warning}
          isPending={isPending}
          defaultValues={dukkan}
          defaultUrunler={urunler}
          hiddenFields={{ dukkan_id: dukkan.id }}
          layout="wide"
          showSeoFields
        />
      </div>
    </div>
  );
}

export default function DukkanAyarlariPage({
  authenticated,
  dukkan,
  urunler,
}: {
  authenticated: boolean;
  dukkan: Dukkan | null;
  urunler: DukkanUrunu[];
}) {
  return (
    <SubPageShell
      title={
        <>
          Mağaza <span className="text-emerald-600">Ayarları</span>
        </>
      }
      description="Logo, kapak, galeri, ürün fotoğrafları, iletişim ve SSS içeriğinizi geniş ekranda rahatça yönetin."
    >
      {!authenticated ? (
        <AuthRequiredCard
          description="Mağaza ayarlarına erişmek için giriş yapmalısınız."
          loginHref="/giris?next=/dukkan-ayarlari"
        />
      ) : !dukkan ? (
        <div className="max-w-lg rounded-2xl border border-slate-200/60 bg-white/80 px-6 py-8 text-center lg:px-8">
          <h2 className="text-lg font-semibold text-slate-900 lg:text-xl">
            Henüz mağazanız yok
          </h2>
          <p className="mt-2 text-sm text-slate-500 lg:text-base">
            Ayarları yönetebilmek için önce mağaza açmanız gerekiyor.
          </p>
          <Link
            href="/dukkan-ac"
            className="mt-6 inline-flex rounded-full bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-slate-800"
          >
            Mağaza Aç
          </Link>
        </div>
      ) : (
        <DukkanAyarlariForm dukkan={dukkan} urunler={urunler} />
      )}
    </SubPageShell>
  );
}
