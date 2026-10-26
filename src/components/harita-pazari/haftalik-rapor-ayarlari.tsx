"use client";

import { Check, LoaderCircle, Mail } from "lucide-react";
import { useActionState, useState } from "react";
import {
  haritaRaporAyarlariniKaydet,
  type HaritaRaporAyarlariState,
} from "@/lib/harita-pazari/actions";
import { cn } from "@/lib/utils/cn";

const GUNLER = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"];
const SAATLER = Array.from({ length: 24 }, (_, saat) => saat);

export type HaftalikRaporAyarlariDegerleri = {
  eposta_aktif: boolean;
  ayrintili: boolean;
  gonderim_gunu: number;
  gonderim_saati: number;
};

const formatSaat = (saat: number) => `${String(saat).padStart(2, "0")}:00`;

function Anahtar({
  name,
  checked,
  onChange,
  label,
  description,
}: {
  name: string;
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
  description: string;
}) {
  return (
    <label className="flex min-h-11 cursor-pointer items-start justify-between gap-4">
      <span>
        <span className="block text-sm font-semibold text-slate-900">{label}</span>
        <span className="block text-xs text-slate-500">{description}</span>
      </span>
      <input type="hidden" name={name} value={checked ? "true" : "false"} />
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative mt-0.5 inline-flex h-7 w-12 shrink-0 items-center rounded-full transition",
          checked ? "bg-emerald-600" : "bg-slate-300"
        )}
      >
        <span
          className={cn(
            "inline-block size-5 rounded-full bg-white shadow transition-transform motion-reduce:transition-none",
            checked ? "translate-x-6" : "translate-x-1"
          )}
        />
      </button>
    </label>
  );
}

export function HaftalikRaporAyarlari({
  email,
  initial,
}: {
  email: string | null;
  initial: HaftalikRaporAyarlariDegerleri;
}) {
  const [state, formAction, pending] = useActionState<HaritaRaporAyarlariState, FormData>(
    haritaRaporAyarlariniKaydet,
    {}
  );
  const [epostaAktif, setEpostaAktif] = useState(initial.eposta_aktif);
  const [ayrintili, setAyrintili] = useState(initial.ayrintili);
  const [gun, setGun] = useState(initial.gonderim_gunu);
  const [saat, setSaat] = useState(initial.gonderim_saati);
  const [zamanAcik, setZamanAcik] = useState(false);

  return (
    <section aria-labelledby="haftalik-rapor-baslik" className="space-y-4">
      <h2 id="haftalik-rapor-baslik" className="text-lg font-bold text-slate-900">
        Haftalık rapor
      </h2>

      <form action={formAction} className="space-y-5 rounded-2xl border border-slate-200/80 bg-white p-5">
        <div className="flex items-start gap-3">
          <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <Mail className="size-5" aria-hidden />
          </span>
          <div className="min-w-0 text-sm">
            <p className="font-semibold text-slate-900">Otomatik haftalık rapor</p>
            <p className="text-slate-600">
              Gönderici: EsnafPRO{email ? <> · Alıcı: <span className="break-all font-medium">{email}</span></> : null}
            </p>
            <p className="text-slate-600">
              Zamanlama: Her {GUNLER[gun - 1]} {formatSaat(saat)}
            </p>
            <p className="mt-2 text-xs text-slate-500">
              İçerik: bu haftaki sıran, rakiplerin hareketleri, puan ve yorum sayıları, 3 uygulanabilir tavsiye.
            </p>
          </div>
        </div>

        <p className="rounded-xl bg-sky-50 px-3 py-2 text-xs text-sky-900">
          E-posta gönderimi yakında başlıyor; tercihlerin şimdiden kaydedilir.
        </p>

        <div className="space-y-3 border-t border-slate-100 pt-4">
          <Anahtar
            name="eposta_aktif"
            checked={epostaAktif}
            onChange={setEpostaAktif}
            label="Raporları e-postaya gönder"
            description="Her hafta özet raporu e-posta adresine gelir."
          />
          <Anahtar
            name="ayrintili"
            checked={ayrintili}
            onChange={setAyrintili}
            label="Raporları ayrıntılı yap"
            description="İlk 3 yerine ilk 20 dükkanın tamamını içerir."
          />
        </div>

        <input type="hidden" name="gonderim_gunu" value={gun} />
        <input type="hidden" name="gonderim_saati" value={saat} />

        {zamanAcik ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="space-y-1 text-sm">
              <span className="font-medium text-slate-700">Gün</span>
              <select
                value={gun}
                onChange={(e) => setGun(Number(e.target.value))}
                className="min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-slate-900"
              >
                {GUNLER.map((ad, index) => (
                  <option key={ad} value={index + 1}>
                    {ad}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-1 text-sm">
              <span className="font-medium text-slate-700">Saat</span>
              <select
                value={saat}
                onChange={(e) => setSaat(Number(e.target.value))}
                className="min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-slate-900"
              >
                {SAATLER.map((s) => (
                  <option key={s} value={s}>
                    {formatSaat(s)}
                  </option>
                ))}
              </select>
            </label>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setZamanAcik(true)}
            className="inline-flex min-h-11 items-center text-sm font-semibold text-emerald-700 hover:underline"
          >
            Zamanı değiştir ›
          </button>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={pending}
            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-slate-900 px-5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
          >
            {pending && <LoaderCircle className="size-4 animate-spin" aria-hidden />}
            {pending ? "Kaydediliyor…" : "Ayarları kaydet"}
          </button>
          <p aria-live="polite" className="text-sm">
            {state.error && <span className="text-red-600">{state.error}</span>}
            {state.success && !pending && (
              <span className="inline-flex items-center gap-1 text-emerald-700">
                <Check className="size-4" aria-hidden />
                {state.success}
              </span>
            )}
          </p>
        </div>
      </form>
    </section>
  );
}
