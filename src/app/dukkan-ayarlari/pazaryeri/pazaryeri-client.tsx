"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { AuthRequiredCard } from "@/components/auth/auth-required-card";
import { TrendyolBaglantiKarti } from "@/components/dukkan/pazaryeri/trendyol-baglanti-karti";
import { TrendyolUrunListesi } from "@/components/dukkan/pazaryeri/trendyol-urun-listesi";
import type {
  PazaryeriBaglantiOzeti,
  PazaryeriSayfaUrunu,
} from "@/components/dukkan/pazaryeri/types";
import { YonetimPageShell } from "@/components/yonetim/yonetim-page-shell";

export function PazaryeriClient({
  authenticated,
  dukkan,
  baglanti,
  urunler,
  loadError,
}: {
  authenticated: boolean;
  dukkan: { id: string; slug: string } | null;
  baglanti: PazaryeriBaglantiOzeti | null;
  urunler: PazaryeriSayfaUrunu[];
  loadError: string | null;
}) {
  return (
    <YonetimPageShell
      showYonetimNav={!!dukkan}
      title={
        <>
          Pazaryeri <span className="text-emerald-600">Bağlantıları</span>
        </>
      }
      description="Ürünlerinizi kendi Trendyol mağazanıza gönderin; stok ve fiyatı buradan eşitleyin."
    >
      {!authenticated ? (
        <AuthRequiredCard
          description="Pazaryeri bağlantılarını yönetmek için giriş yapmalısınız."
          loginHref="/giris?next=/dukkan-ayarlari/pazaryeri"
        />
      ) : !dukkan ? (
        <div className="max-w-lg rounded-2xl border border-slate-200/60 bg-white/80 px-6 py-8 text-center lg:px-8">
          <h2 className="text-lg font-semibold text-slate-900 lg:text-xl">
            {loadError ? "Mağaza yüklenemedi" : "Henüz mağazanız yok"}
          </h2>
          <p className="mt-2 text-sm text-slate-500 lg:text-base">
            {loadError ?? "Pazaryeri bağlantısı için önce mağaza açmanız gerekiyor."}
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
        <div className="mx-auto w-full max-w-4xl space-y-5">
          <Link
            href="/dukkan-ayarlari/urunler"
            className="inline-flex min-h-11 items-center gap-2 rounded-full px-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
          >
            <ArrowLeft className="size-4" aria-hidden />
            Ürün yönetimi
          </Link>

          {loadError && (
            <p
              role="alert"
              className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600"
            >
              {loadError}
            </p>
          )}

          <TrendyolBaglantiKarti baglanti={baglanti} />

          {baglanti && <TrendyolUrunListesi urunler={urunler} />}
        </div>
      )}
    </YonetimPageShell>
  );
}
