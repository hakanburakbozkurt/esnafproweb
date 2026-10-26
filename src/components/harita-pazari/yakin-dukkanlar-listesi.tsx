import { ArrowDown, ArrowUp, ExternalLink, Minus, Star } from "lucide-react";
import {
  degisimMetni,
  formatMesafe,
  formatPuan,
  siraEtiketi,
} from "@/lib/harita-pazari/format";
import type { HaritaRaporSatiri } from "@/lib/harita-pazari/rapor";
import { cn } from "@/lib/utils/cn";

const SIRA_TON_CLASSES = {
  iyi: "bg-emerald-50 text-emerald-700 ring-emerald-600/15",
  orta: "bg-sky-50 text-sky-700 ring-sky-600/15",
  zayif: "bg-amber-50 text-amber-800 ring-amber-600/20",
} as const;

function DegisimRozeti({ satir }: { satir: HaritaRaporSatiri }) {
  const { degisim } = satir;
  const yukari = degisim.tur === "yukseldi" || degisim.tur === "yeni";
  const asagi = degisim.tur === "dustu" || degisim.tur === "listeden_cikti";
  const Icon = yukari ? ArrowUp : asagi ? ArrowDown : Minus;
  // Rakibin yükselişi senin için tehdit; renk mağaza sahibinin bakış açısına göre.
  const iyi = satir.kendi ? yukari : asagi;
  const kotu = satir.kendi ? asagi : yukari;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-xs font-medium",
        iyi ? "text-emerald-700" : kotu ? "text-rose-600" : "text-slate-500"
      )}
    >
      <Icon className="size-3.5" aria-hidden />
      {degisimMetni(degisim)}
    </span>
  );
}

function DukkanSatiri({ satir }: { satir: HaritaRaporSatiri }) {
  const etiket = siraEtiketi(satir.sira);

  return (
    <li
      className={cn(
        "flex gap-3 rounded-2xl border p-4 sm:gap-4",
        satir.kendi ? "border-emerald-200 bg-emerald-50/50" : "border-slate-200/80 bg-white"
      )}
    >
      <div className="flex shrink-0 flex-col items-center gap-1.5 pt-0.5">
        <span
          aria-hidden
          className={cn("size-2.5 rounded-full", satir.kendi ? "bg-emerald-500" : "bg-rose-500")}
        />
        <span className="text-lg font-extrabold tabular-nums text-slate-900">
          {satir.sira ? `#${satir.sira}` : "—"}
        </span>
      </div>

      <div className="min-w-0 flex-1 space-y-1.5">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="line-clamp-2 font-semibold text-slate-900">{satir.ad}</h3>
          {satir.kendi ? (
            <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-[11px] font-bold text-white">SEN</span>
          ) : (
            <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[11px] font-semibold text-rose-700">Rakip</span>
          )}
        </div>

        <dl className="grid gap-x-4 gap-y-1 text-sm text-slate-600 sm:grid-cols-2">
          <div className="flex gap-1.5">
            <dt className="text-slate-400">Mesafe:</dt>
            <dd>{formatMesafe(satir.mesafeKm, satir.kendi)}</dd>
          </div>
          <div className="flex items-center gap-1.5">
            <dt className="text-slate-400">Google puanı:</dt>
            <dd className="inline-flex items-center gap-1">
              {formatPuan(satir.puan)}
              <Star className="size-3.5 fill-amber-400 text-amber-400" aria-hidden />
              <span className="text-slate-400">({(satir.yorumSayisi ?? 0).toLocaleString("tr-TR")} yorum)</span>
            </dd>
          </div>
        </dl>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
          <span
            className={cn(
              "rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1",
              SIRA_TON_CLASSES[etiket.ton]
            )}
          >
            {etiket.metin}
          </span>
          <DegisimRozeti satir={satir} />
        </div>
      </div>

      {satir.haritaUrl && (
        <a
          href={satir.haritaUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${satir.ad} — Google Haritalar'da aç`}
          className="inline-flex size-11 shrink-0 items-center justify-center self-start rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
        >
          <ExternalLink className="size-4" aria-hidden />
        </a>
      )}
    </li>
  );
}

export function YakinDukkanlarListesi({
  kendi,
  rakipler,
  toplamSonuc,
  karsilastirma,
}: {
  kendi: HaritaRaporSatiri | null;
  rakipler: HaritaRaporSatiri[];
  toplamSonuc: number;
  karsilastirma: string | null;
}) {
  return (
    <section aria-labelledby="yakin-dukkanlar-baslik" className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 id="yakin-dukkanlar-baslik" className="text-lg font-bold text-slate-900">
            Yakın bölgedeki dükkanlar
          </h2>
          <p className="text-sm text-slate-500">
            5 km içindeki {toplamSonuc} telefoncu arasında Google&apos;ın öne çıkardığı sıra
            {karsilastirma ? ` · Değişim: ${karsilastirma}` : ""}
          </p>
        </div>
        <p className="flex items-center gap-3 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-emerald-500" aria-hidden /> Senin dükkanın
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-rose-500" aria-hidden /> Rakipler
          </span>
        </p>
      </div>

      {!kendi && (
        <p role="status" className="rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Google kaydını bu bölgede bulamadık. Google İşletme profilindeki adın, mağaza adınla
          (Dükkan Ayarları) aynı olduğundan emin ol.
        </p>
      )}

      {rakipler.length === 0 && !kendi ? (
        <p className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-8 text-center text-sm text-slate-500">
          5 km içinde Google&apos;da kayıtlı başka telefoncu bulunamadı.
        </p>
      ) : (
        <ol className="space-y-3">
          {kendi && <DukkanSatiri satir={kendi} />}
          {rakipler.map((satir) => (
            <DukkanSatiri key={satir.id} satir={satir} />
          ))}
        </ol>
      )}

      <p className="text-xs leading-relaxed text-slate-400">
        Sıra, Google Places&apos;ın bölgedeki öne çıkma sıralamasıdır; müşterinin kendi aramasında
        gördüğü sıra konumuna ve arama kelimesine göre farklılık gösterebilir.
      </p>
    </section>
  );
}
