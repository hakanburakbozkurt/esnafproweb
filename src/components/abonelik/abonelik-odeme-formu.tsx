"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { Label } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { abonelikOdemeBaslat, type AbonelikOdemeState } from "@/lib/abonelik/odeme-actions";
import {
  ABONELIK_SURELERI,
  SURE_ETIKETLERI,
  type AbonelikSuresi,
  type FaturaTipi,
  type SatinAlinabilirPaket,
} from "@/lib/abonelik/odeme-kurallari";
import { cn } from "@/lib/utils/cn";

export type SatilikPaket = {
  planKey: SatinAlinabilirPaket;
  ad: string;
  aciklama: string | null;
  fiyatlar: Record<AbonelikSuresi, number>;
  engel: string | null;
};

const initialState: AbonelikOdemeState = {};

const tl = new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 2 });

function secimKartiClass(secili: boolean, pasif = false) {
  return cn(
    "flex min-h-11 w-full cursor-pointer flex-col rounded-2xl border px-4 py-3 text-left transition",
    secili
      ? "border-emerald-500 bg-emerald-50/70 ring-2 ring-emerald-500/20"
      : "border-slate-200 bg-white hover:border-emerald-300",
    pasif && "cursor-not-allowed opacity-50 hover:border-slate-200"
  );
}

export function AbonelikOdemeFormu({
  paketler,
  varsayilanEposta,
}: {
  paketler: SatilikPaket[];
  varsayilanEposta: string;
}) {
  const [state, formAction, isPending] = useActionState(abonelikOdemeBaslat, initialState);
  const ilkUygun = paketler.find((p) => !p.engel) ?? paketler[0];
  const [paketKey, setPaketKey] = useState<SatinAlinabilirPaket | undefined>(ilkUygun?.planKey);
  const [sure, setSure] = useState<AbonelikSuresi>(12);
  const [faturaTipi, setFaturaTipi] = useState<FaturaTipi>("bireysel");

  const paket = paketler.find((p) => p.planKey === paketKey);
  const tutar = paket ? paket.fiyatlar[sure] : 0;
  const aylikEsdeger = paket ? paket.fiyatlar[sure] / sure : 0;

  if (!paket) {
    return <p className="text-sm text-slate-500">Şu an satın alınabilecek paket yok.</p>;
  }

  return (
    <form action={formAction} className="space-y-8">
      <input type="hidden" name="plan_key" value={paket.planKey} />
      <input type="hidden" name="sure_ay" value={sure} />
      <input type="hidden" name="fatura_tipi" value={faturaTipi} />

      <fieldset>
        <legend className="text-sm font-semibold text-slate-900">1. Paket</legend>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {paketler.map((p) => (
            <button
              key={p.planKey}
              type="button"
              disabled={Boolean(p.engel)}
              aria-pressed={p.planKey === paket.planKey}
              onClick={() => setPaketKey(p.planKey)}
              className={secimKartiClass(p.planKey === paket.planKey, Boolean(p.engel))}
            >
              <span className="text-base font-bold text-slate-900">{p.ad}</span>
              <span className="mt-0.5 text-sm text-slate-500">
                {tl.format(p.fiyatlar[1])} / ay&apos;dan başlayan
              </span>
              {p.engel && <span className="mt-1 text-xs text-amber-700">{p.engel}</span>}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-sm font-semibold text-slate-900">2. Süre</legend>
        <div className="mt-3 grid grid-cols-3 gap-2 sm:gap-3">
          {ABONELIK_SURELERI.map((s) => (
            <button
              key={s}
              type="button"
              aria-pressed={s === sure}
              onClick={() => setSure(s)}
              className={secimKartiClass(s === sure)}
            >
              <span className="text-sm font-bold text-slate-900">{SURE_ETIKETLERI[s]}</span>
              <span className="mt-0.5 text-xs text-slate-500 sm:text-sm">{tl.format(paket.fiyatlar[s])}</span>
            </button>
          ))}
        </div>
        <p className="mt-2 text-xs text-slate-500">
          Aylık ortalama {tl.format(aylikEsdeger)}. Fiyatlara KDV dahildir. Otomatik yenileme yoktur.
        </p>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="text-sm font-semibold text-slate-900">3. Fatura bilgileri</legend>
        <div className="grid grid-cols-2 gap-2 sm:max-w-sm">
          {(["bireysel", "kurumsal"] as const).map((tip) => (
            <button
              key={tip}
              type="button"
              aria-pressed={tip === faturaTipi}
              onClick={() => setFaturaTipi(tip)}
              className={secimKartiClass(tip === faturaTipi)}
            >
              <span className="text-sm font-semibold text-slate-900">
                {tip === "bireysel" ? "Bireysel" : "Kurumsal"}
              </span>
            </button>
          ))}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label htmlFor="fatura_ad_unvan">{faturaTipi === "bireysel" ? "Ad soyad" : "Şirket ünvanı"}</Label>
            <Input id="fatura_ad_unvan" name="fatura_ad_unvan" required autoComplete={faturaTipi === "bireysel" ? "name" : "organization"} className="w-full" />
          </div>
          <div>
            <Label htmlFor="fatura_kimlik_no">{faturaTipi === "bireysel" ? "T.C. kimlik no" : "Vergi no"}</Label>
            <Input
              id="fatura_kimlik_no"
              name="fatura_kimlik_no"
              required
              inputMode="numeric"
              maxLength={faturaTipi === "bireysel" ? 11 : 10}
              className="w-full"
            />
          </div>
          {faturaTipi === "kurumsal" && (
            <div>
              <Label htmlFor="fatura_vergi_dairesi">Vergi dairesi</Label>
              <Input id="fatura_vergi_dairesi" name="fatura_vergi_dairesi" required className="w-full" />
            </div>
          )}
          <div className="sm:col-span-2">
            <Label htmlFor="fatura_adres">Adres</Label>
            <Input id="fatura_adres" name="fatura_adres" required autoComplete="street-address" className="w-full" />
          </div>
          <div>
            <Label htmlFor="fatura_il">İl</Label>
            <Input id="fatura_il" name="fatura_il" required autoComplete="address-level1" className="w-full" />
          </div>
          <div>
            <Label htmlFor="fatura_ilce">İlçe</Label>
            <Input id="fatura_ilce" name="fatura_ilce" required autoComplete="address-level2" className="w-full" />
          </div>
          <div>
            <Label htmlFor="fatura_eposta">E-posta (fatura gönderilir)</Label>
            <Input id="fatura_eposta" name="fatura_eposta" type="email" required defaultValue={varsayilanEposta} autoComplete="email" className="w-full" />
          </div>
          <div>
            <Label htmlFor="fatura_telefon">Cep telefonu</Label>
            <Input id="fatura_telefon" name="fatura_telefon" type="tel" required placeholder="05xx xxx xx xx" autoComplete="tel" className="w-full" />
          </div>
        </div>
      </fieldset>

      <label className="flex items-start gap-3 text-sm text-slate-600">
        <input type="checkbox" name="sozlesme_onay" required className="mt-1 size-4 shrink-0 accent-emerald-600" />
        <span>
          <Link href="/on-bilgilendirme-formu" target="_blank" className="font-medium text-emerald-700 underline">
            Ön bilgilendirme formunu
          </Link>{" "}
          ve{" "}
          <Link href="/mesafeli-satis-sozlesmesi" target="_blank" className="font-medium text-emerald-700 underline">
            mesafeli satış sözleşmesini
          </Link>{" "}
          okudum, onaylıyorum. Hizmet anında ifa edildiği için cayma hakkı bulunmadığını biliyorum.
        </span>
      </label>

      {state.error && (
        <p role="alert" className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.error}
        </p>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-600">
          Toplam: <span className="text-lg font-bold text-slate-900">{tl.format(tutar)}</span>{" "}
          <span className="text-xs text-slate-400">(KDV dahil)</span>
        </p>
        <button
          type="submit"
          disabled={isPending || Boolean(paket.engel)}
          className="inline-flex min-h-12 items-center justify-center rounded-full bg-emerald-600 px-6 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "Ödeme sayfası açılıyor…" : "iyzico ile güvenli öde"}
        </button>
      </div>
      <p className="text-xs text-slate-400">
        Kart bilgileriniz iyzico&apos;nun güvenli ödeme sayfasında girilir; EsnafPRO kart bilgisi saklamaz.
      </p>
    </form>
  );
}
