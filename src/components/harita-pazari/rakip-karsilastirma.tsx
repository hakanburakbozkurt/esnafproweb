import { ArrowRight, Check, Lightbulb, X } from "lucide-react";
import { formatPuan } from "@/lib/harita-pazari/format";
import type { HaritaPazariRaporu, RakipAnalizi } from "@/lib/harita-pazari/rapor";
import { cn } from "@/lib/utils/cn";

function Isaret({ olumlu }: { olumlu: boolean | null }) {
  if (olumlu === null) return null;
  return olumlu ? (
    <Check className="size-4 shrink-0 text-emerald-600" aria-label="Senin lehine" />
  ) : (
    <X className="size-4 shrink-0 text-rose-600" aria-label="Rakibin lehine" />
  );
}

function puanMetni(analiz: RakipAnalizi): { metin: string; olumlu: boolean | null } {
  switch (analiz.puanKiyas) {
    case "senden_dusuk":
      return { metin: "senden düşük", olumlu: true };
    case "senden_yuksek":
      return { metin: "senden yüksek", olumlu: false };
    case "esit":
      return { metin: "seninle eşit", olumlu: null };
    case "bilinmiyor":
      return { metin: "karşılaştırılamadı", olumlu: null };
  }
}

function yorumMetni(oran: number | null): { metin: string; olumlu: boolean | null } {
  if (oran === null) return { metin: "karşılaştırılamadı", olumlu: null };
  if (oran >= 1.5) {
    return { metin: `senden ${oran.toLocaleString("tr-TR", { maximumFractionDigits: 1 })} kat fazla`, olumlu: false };
  }
  if (oran > 1) return { metin: "senden biraz fazla", olumlu: false };
  if (oran === 1) return { metin: "seninle eşit", olumlu: null };
  return { metin: "senden az", olumlu: true };
}

function RakipKarti({ analiz }: { analiz: RakipAnalizi }) {
  const { satir } = analiz;
  const puan = puanMetni(analiz);
  const yorum = yorumMetni(analiz.yorumOrani);

  return (
    <li className="flex flex-col rounded-2xl border border-slate-200/80 bg-white p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-rose-600">Sıra #{satir.sira}</p>
      <h3 className="mt-0.5 line-clamp-2 font-bold text-slate-900">{satir.ad}</h3>

      <dl className="mt-3 space-y-2 text-sm">
        <div className="flex items-start justify-between gap-2">
          <dt className="text-slate-500">Puan</dt>
          <dd className="flex items-center gap-1.5 text-right text-slate-800">
            {formatPuan(satir.puan)}/5,0 <span className="text-slate-400">({puan.metin})</span>
            <Isaret olumlu={puan.olumlu} />
          </dd>
        </div>
        <div className="flex items-start justify-between gap-2">
          <dt className="text-slate-500">Yorumlar</dt>
          <dd className="flex items-center gap-1.5 text-right text-slate-800">
            {(satir.yorumSayisi ?? 0).toLocaleString("tr-TR")}{" "}
            <span className="text-slate-400">({yorum.metin})</span>
            <Isaret olumlu={yorum.olumlu} />
          </dd>
        </div>
        {satir.kategori && (
          <div className="flex items-start justify-between gap-2">
            <dt className="text-slate-500">Kategori</dt>
            <dd className="text-right text-slate-800">{satir.kategori}</dd>
          </div>
        )}
      </dl>

      <p className="mt-3 flex gap-2 rounded-xl bg-slate-50 p-3 text-sm leading-relaxed text-slate-700">
        <Lightbulb className="mt-0.5 size-4 shrink-0 text-amber-500" aria-hidden />
        {analiz.tavsiye}
      </p>
    </li>
  );
}

export function RakipKarsilastirma({ rapor }: { rapor: HaritaPazariRaporu }) {
  if (!rapor.kendi || rapor.rakipAnalizi.length === 0) return null;

  return (
    <section aria-labelledby="rakip-analizi-baslik" className="space-y-4">
      <h2 id="rakip-analizi-baslik" className="text-lg font-bold text-slate-900">
        İlk 3 rakip analizi
      </h2>

      <ul className="grid gap-3 md:grid-cols-3">
        {rapor.rakipAnalizi.map((analiz) => (
          <RakipKarti key={analiz.satir.id} analiz={analiz} />
        ))}
      </ul>

      <div className="rounded-2xl border border-slate-200/80 bg-white p-5">
        <h3 className="text-sm font-bold uppercase tracking-[0.14em] text-slate-500">Özet</h3>
        <ul className="mt-3 space-y-2">
          {rapor.ozet.map((madde) => (
            <li
              key={madde.metin}
              className={cn("flex items-start gap-2 text-sm", madde.olumlu ? "text-slate-800" : "text-slate-700")}
            >
              <Isaret olumlu={madde.olumlu} />
              {madde.metin}
            </li>
          ))}
        </ul>
        <p className="mt-4 flex items-start gap-2 rounded-xl bg-emerald-50 px-3 py-2.5 text-sm font-semibold text-emerald-800">
          <ArrowRight className="mt-0.5 size-4 shrink-0" aria-hidden />
          Aksiyon: {rapor.aksiyon}
        </p>
      </div>
    </section>
  );
}
