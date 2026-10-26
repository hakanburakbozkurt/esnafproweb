"use client";

import { ArrowLeft, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useActionState, useMemo, useState } from "react";
import { AuthRequiredCard } from "@/components/auth/auth-required-card";
import { UrunListManager } from "@/components/dukkan/urunler/urun-list-manager";
import { YonetimPageShell } from "@/components/yonetim/yonetim-page-shell";
import {
  updateDukkanUrunleri,
  type DukkanUrunleriFormState,
} from "@/lib/dukkan/urun-actions";
import type { DukkanUrunu } from "@/types/database.types";

const initialState: DukkanUrunleriFormState = {};

type ShopSummary = { id: string; slug: string; dukkan_adi: string };

function hashString(value: string): string {
  let hash = 5381;
  for (let i = 0; i < value.length; i += 1) {
    hash = ((hash << 5) + hash + value.charCodeAt(i)) | 0;
  }
  return (hash >>> 0).toString(36);
}

function UrunlerForm({
  dukkan,
  urunler,
  loadError,
}: {
  dukkan: ShopSummary;
  urunler: DukkanUrunu[];
  loadError: string | null;
}) {
  const [state, formAction, isPending] = useActionState(updateDukkanUrunleri, initialState);
  const [resetCount, setResetCount] = useState(0);
  /** Kayıt sonrası sunucudan gelen ürünler değişince liste yeni verilerle kurulur. */
  const dataKey = useMemo(() => hashString(JSON.stringify(urunler)), [urunler]);

  return (
    <div className="mx-auto w-full max-w-6xl space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/dukkan-ayarlari"
          className="inline-flex min-h-11 items-center gap-2 rounded-full px-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Mağaza ayarları
        </Link>
        <Link
          href={`/${dukkan.slug}`}
          target="_blank"
          className="inline-flex min-h-11 items-center gap-2 rounded-full px-3 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50"
        >
          Vitrini görüntüle
          <ExternalLink className="size-4" aria-hidden />
        </Link>
      </div>

      {loadError && (
        <p role="alert" className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
          {loadError}
        </p>
      )}

      {state.success && (
        <p className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          Ürünler kaydedildi ({state.savedCount ?? 0} ürün vitrinde).
        </p>
      )}

      {state.warning && (
        <p className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {state.warning}
        </p>
      )}

      <UrunListManager
        key={`${dataKey}-${resetCount}`}
        dukkanId={dukkan.id}
        storeSlug={dukkan.slug}
        defaultUrunler={urunler}
        action={formAction}
        isPending={isPending}
        error={state.error}
        saved={Boolean(state.success)}
        onCancel={() => setResetCount((count) => count + 1)}
      />
    </div>
  );
}

export default function DukkanUrunleriPage({
  authenticated,
  dukkan,
  urunler,
  loadError,
}: {
  authenticated: boolean;
  dukkan: ShopSummary | null;
  urunler: DukkanUrunu[];
  loadError: string | null;
}) {
  return (
    <YonetimPageShell
      showYonetimNav={!!dukkan}
      title={
        <>
          Ürün <span className="text-emerald-600">Yönetimi</span>
        </>
      }
      description="Vitrininizdeki ürünleri kategori, fiyat ve stok bilgisiyle düzenleyin."
    >
      {!authenticated ? (
        <AuthRequiredCard
          description="Ürünlerinizi yönetmek için giriş yapmalısınız."
          loginHref="/giris?next=/dukkan-ayarlari/urunler"
        />
      ) : !dukkan ? (
        <div className="max-w-lg rounded-2xl border border-slate-200/60 bg-white/80 px-6 py-8 text-center lg:px-8">
          <h2 className="text-lg font-semibold text-slate-900 lg:text-xl">
            {loadError ? "Mağaza yüklenemedi" : "Henüz mağazanız yok"}
          </h2>
          <p className="mt-2 text-sm text-slate-500 lg:text-base">
            {loadError ?? "Ürün ekleyebilmek için önce mağaza açmanız gerekiyor."}
          </p>
          {!loadError && (
            <Link
              href="/dukkan-ac"
              className="mt-6 inline-flex min-h-11 items-center rounded-full bg-slate-900 px-5 text-sm font-medium text-white transition-colors hover:bg-slate-800"
            >
              Mağaza Aç
            </Link>
          )}
        </div>
      ) : (
        <UrunlerForm dukkan={dukkan} urunler={urunler} loadError={loadError} />
      )}
    </YonetimPageShell>
  );
}
