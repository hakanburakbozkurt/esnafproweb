"use client";

import { CheckCircle2, Link2Off, RefreshCw, XCircle } from "lucide-react";
import { useActionState, useEffect, useState, useTransition } from "react";
import type { PazaryeriBaglantiOzeti } from "@/components/dukkan/pazaryeri/types";
import { Label } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  trendyolBaglantiKaydet,
  trendyolBaglantiSil,
  trendyolBaglantiTest,
  type TrendyolBaglantiFormState,
} from "@/lib/pazaryeri/trendyol-actions";

const initialState: TrendyolBaglantiFormState = {};

function formatTarih(iso: string | null) {
  if (!iso) return null;
  return new Intl.DateTimeFormat("tr-TR", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Europe/Istanbul",
  }).format(new Date(iso));
}

function BaglantiFormu({ onCancel }: { onCancel?: () => void }) {
  const [state, formAction, isPending] = useActionState(trendyolBaglantiKaydet, initialState);

  useEffect(() => {
    if (state.success) onCancel?.();
  }, [state.success, onCancel]);

  return (
    <form action={formAction} className="space-y-4" autoComplete="off">
      <ol className="list-decimal space-y-1 pl-5 text-sm text-slate-600">
        <li>Trendyol satıcı paneline girin (ana kullanıcı ile).</li>
        <li>
          <span className="font-medium text-slate-800">Hesap Bilgilerim › Entegrasyon Bilgileri</span>{" "}
          sayfasını açın.
        </li>
        <li>Satıcı ID, API Key ve API Secret değerlerini aşağıya yapıştırın.</li>
      </ol>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <Label htmlFor="trendyol-satici-id">Satıcı ID</Label>
          <Input
            id="trendyol-satici-id"
            name="satici_id"
            inputMode="numeric"
            required
            maxLength={20}
            placeholder="Örn: 123456"
            className="w-full"
          />
        </div>
        <div>
          <Label htmlFor="trendyol-api-key">API Key</Label>
          <Input
            id="trendyol-api-key"
            name="api_key"
            type="password"
            required
            maxLength={200}
            autoComplete="off"
            className="w-full"
          />
        </div>
        <div>
          <Label htmlFor="trendyol-api-secret">API Secret</Label>
          <Input
            id="trendyol-api-secret"
            name="api_secret"
            type="password"
            required
            maxLength={200}
            autoComplete="off"
            className="w-full"
          />
        </div>
      </div>

      <p className="text-xs text-slate-500">
        Bilgileriniz şifrelenerek saklanır ve yalnızca sizin isteğinizle Trendyol’a bağlanmak için
        kullanılır. Kaydetmeden önce bağlantı denenir.
      </p>

      {state.error && (
        <p role="alert" className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
          {state.error}
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex min-h-11 items-center justify-center rounded-full bg-emerald-600 px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-60"
        >
          {isPending ? "Bağlantı deneniyor…" : "Bağla ve kaydet"}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex min-h-11 items-center justify-center rounded-full px-5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
          >
            Vazgeç
          </button>
        )}
      </div>
    </form>
  );
}

export function TrendyolBaglantiKarti({ baglanti }: { baglanti: PazaryeriBaglantiOzeti | null }) {
  const [duzenleniyor, setDuzenleniyor] = useState(false);
  const [mesaj, setMesaj] = useState<{ tip: "ok" | "hata"; metin: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  const test = () => {
    setMesaj(null);
    startTransition(async () => {
      const sonuc = await trendyolBaglantiTest();
      setMesaj("error" in sonuc ? { tip: "hata", metin: sonuc.error } : { tip: "ok", metin: "Bağlantı çalışıyor." });
    });
  };

  const sil = () => {
    if (
      !window.confirm(
        "Trendyol bağlantısı kaldırılsın mı? Trendyol’daki ürünleriniz silinmez, yalnızca EsnafPRO’dan gönderim durur."
      )
    ) {
      return;
    }
    setMesaj(null);
    startTransition(async () => {
      const sonuc = await trendyolBaglantiSil();
      if ("error" in sonuc) setMesaj({ tip: "hata", metin: sonuc.error });
    });
  };

  return (
    <section className="rounded-3xl border border-slate-200/70 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Trendyol</h2>
          {baglanti ? (
            <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-600">
              {baglanti.sonTestBasarili === false ? (
                <XCircle className="size-4 text-red-600" aria-hidden />
              ) : (
                <CheckCircle2 className="size-4 text-emerald-600" aria-hidden />
              )}
              {baglanti.sonTestBasarili === false ? "Son denemede bağlanamadı" : "Bağlı"} · Satıcı ID{" "}
              {baglanti.saticiId}
              {baglanti.sonTestAt && (
                <span className="text-slate-400"> · son kontrol {formatTarih(baglanti.sonTestAt)}</span>
              )}
            </p>
          ) : (
            <p className="mt-1 text-sm text-slate-600">
              Kendi Trendyol satıcı hesabınızı bağlayın. Her mağaza yalnızca kendi bilgilerini kullanır.
            </p>
          )}
        </div>

        {baglanti && !duzenleniyor && (
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={test}
              disabled={isPending}
              className="inline-flex min-h-11 items-center gap-2 rounded-full border border-slate-200 px-4 text-sm font-semibold text-slate-700 transition hover:border-emerald-300 hover:text-emerald-700 disabled:opacity-60"
            >
              <RefreshCw className="size-4" aria-hidden />
              Bağlantıyı dene
            </button>
            <button
              type="button"
              onClick={() => setDuzenleniyor(true)}
              className="inline-flex min-h-11 items-center rounded-full border border-slate-200 px-4 text-sm font-semibold text-slate-700 transition hover:border-emerald-300 hover:text-emerald-700"
            >
              Bilgileri değiştir
            </button>
            <button
              type="button"
              onClick={sil}
              disabled={isPending}
              className="inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-60"
            >
              <Link2Off className="size-4" aria-hidden />
              Kaldır
            </button>
          </div>
        )}
      </div>

      {mesaj && (
        <p
          role={mesaj.tip === "hata" ? "alert" : "status"}
          className={
            mesaj.tip === "hata"
              ? "mt-4 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600"
              : "mt-4 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
          }
        >
          {mesaj.metin}
        </p>
      )}

      {(!baglanti || duzenleniyor) && (
        <div className="mt-5 border-t border-slate-100 pt-5">
          <BaglantiFormu onCancel={baglanti ? () => setDuzenleniyor(false) : undefined} />
        </div>
      )}
    </section>
  );
}
