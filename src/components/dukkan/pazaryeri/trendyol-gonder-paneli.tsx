"use client";

import { Search, X } from "lucide-react";
import { useEffect, useId, useMemo, useRef, useState, useTransition } from "react";
import type { PazaryeriSayfaUrunu } from "@/components/dukkan/pazaryeri/types";
import { Label } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  trendyolKategoriAra,
  trendyolKategoriOzellikleri,
  trendyolMarkaAra,
  trendyolUrunGonder,
  type TrendyolZorunluOzellik,
} from "@/lib/pazaryeri/trendyol-actions";
import {
  TRENDYOL_KDV_ORANLARI,
  type TrendyolOzellikSecimi,
} from "@/lib/pazaryeri/trendyol/payload";
import { cn } from "@/lib/utils/cn";

type Secim = { id: number; ad: string };

function readOzellikler(raw: unknown): Map<number, TrendyolOzellikSecimi> {
  const map = new Map<number, TrendyolOzellikSecimi>();
  if (!Array.isArray(raw)) return map;
  for (const item of raw) {
    if (item && typeof item === "object" && typeof (item as TrendyolOzellikSecimi).attributeId === "number") {
      const o = item as TrendyolOzellikSecimi;
      map.set(o.attributeId, o);
    }
  }
  return map;
}

/** Yazdıkça sunucuda arayan küçük seçici (marka ve kategori için). */
function AramaliSecici({
  label,
  placeholder,
  secili,
  onSec,
  ara,
}: {
  label: string;
  placeholder: string;
  secili: Secim | null;
  onSec: (secim: Secim | null) => void;
  ara: (sorgu: string) => Promise<{ sonuclar: { id: number; ad: string; alt?: string }[] } | { error: string }>;
}) {
  const id = useId();
  const [sorgu, setSorgu] = useState("");
  const [sonuclar, setSonuclar] = useState<{ id: number; ad: string; alt?: string }[]>([]);
  const [hata, setHata] = useState<string | null>(null);
  const [yukleniyor, setYukleniyor] = useState(false);
  const istekNo = useRef(0);

  useEffect(() => {
    const metin = sorgu.trim();
    const no = ++istekNo.current;
    if (metin.length < 2) return;
    const timer = window.setTimeout(async () => {
      setYukleniyor(true);
      const sonuc = await ara(metin);
      if (no !== istekNo.current) return;
      setYukleniyor(false);
      if ("error" in sonuc) {
        setHata(sonuc.error);
        setSonuclar([]);
      } else {
        setHata(null);
        setSonuclar(sonuc.sonuclar);
      }
    }, 350);
    return () => window.clearTimeout(timer);
  }, [sorgu, ara]);

  const gorunenSonuclar = sorgu.trim().length >= 2 ? sonuclar : [];

  if (secili) {
    return (
      <div>
        <Label>{label}</Label>
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/60 px-4 py-2.5">
          <span className="min-w-0 text-sm font-medium text-slate-900">{secili.ad}</span>
          <button
            type="button"
            onClick={() => onSec(null)}
            className="inline-flex min-h-11 shrink-0 items-center rounded-full px-3 text-sm font-semibold text-emerald-700 hover:bg-emerald-100"
          >
            Değiştir
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" aria-hidden />
        <Input
          id={id}
          value={sorgu}
          onChange={(event) => setSorgu(event.target.value)}
          placeholder={placeholder}
          autoComplete="off"
          className="w-full pl-9"
        />
      </div>
      {yukleniyor && <p className="mt-1.5 text-xs text-slate-400">Aranıyor…</p>}
      {hata && <p className="mt-1.5 text-xs text-red-600">{hata}</p>}
      {!yukleniyor && !hata && sorgu.trim().length >= 2 && gorunenSonuclar.length === 0 && (
        <p className="mt-1.5 text-xs text-slate-500">Sonuç yok. Başka bir kelime deneyin.</p>
      )}
      {gorunenSonuclar.length > 0 && (
        <ul className="mt-2 max-h-56 overflow-y-auto rounded-2xl border border-slate-200">
          {gorunenSonuclar.map((s) => (
            <li key={s.id}>
              <button
                type="button"
                onClick={() => onSec({ id: s.id, ad: s.alt ?? s.ad })}
                className="block min-h-11 w-full px-4 py-2 text-left text-sm hover:bg-emerald-50"
              >
                <span className="font-medium text-slate-900">{s.ad}</span>
                {s.alt && <span className="block text-xs text-slate-500">{s.alt}</span>}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/** Zorunlu özellik için değer seçici: listeden seçim, izin varsa serbest metin. */
function OzellikAlani({
  ozellik,
  secim,
  onChange,
}: {
  ozellik: TrendyolZorunluOzellik;
  secim: TrendyolOzellikSecimi | undefined;
  onChange: (secim: TrendyolOzellikSecimi | null) => void;
}) {
  const id = useId();
  const [filtre, setFiltre] = useState("");
  const secili = ozellik.degerler.find((d) => d.id === secim?.attributeValueId) ?? null;
  const filtreli = useMemo(() => {
    const f = filtre.trim().toLocaleLowerCase("tr");
    const liste = f
      ? ozellik.degerler.filter((d) => d.ad.toLocaleLowerCase("tr").includes(f))
      : ozellik.degerler;
    return liste.slice(0, 50);
  }, [filtre, ozellik.degerler]);

  if (ozellik.degerler.length === 0) {
    return (
      <div>
        <Label htmlFor={id}>{ozellik.name}</Label>
        <Input
          id={id}
          value={secim?.customAttributeValue ?? ""}
          maxLength={100}
          onChange={(event) =>
            onChange(
              event.target.value
                ? { attributeId: ozellik.attributeId, customAttributeValue: event.target.value }
                : null
            )
          }
          className="w-full"
        />
      </div>
    );
  }

  if (secili) {
    return (
      <div>
        <Label>{ozellik.name}</Label>
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/60 px-4 py-2.5">
          <span className="text-sm font-medium text-slate-900">{secili.ad}</span>
          <button
            type="button"
            onClick={() => onChange(null)}
            className="inline-flex min-h-11 items-center rounded-full px-3 text-sm font-semibold text-emerald-700 hover:bg-emerald-100"
          >
            Değiştir
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Label htmlFor={id}>{ozellik.name}</Label>
      <Input
        id={id}
        value={filtre}
        onChange={(event) => setFiltre(event.target.value)}
        placeholder={`${ozellik.degerler.length} seçenek içinde ara`}
        autoComplete="off"
        className="w-full"
      />
      <ul className="mt-2 max-h-44 overflow-y-auto rounded-2xl border border-slate-200">
        {filtreli.map((d) => (
          <li key={d.id}>
            <button
              type="button"
              onClick={() => onChange({ attributeId: ozellik.attributeId, attributeValueId: d.id })}
              className="block min-h-11 w-full px-4 py-2 text-left text-sm text-slate-800 hover:bg-emerald-50"
            >
              {d.ad}
            </button>
          </li>
        ))}
        {filtreli.length === 0 && (
          <li className="px-4 py-3 text-xs text-slate-500">Eşleşen seçenek yok.</li>
        )}
      </ul>
      {ozellik.allowCustom && filtre.trim() && (
        <button
          type="button"
          onClick={() =>
            onChange({ attributeId: ozellik.attributeId, customAttributeValue: filtre.trim() })
          }
          className="mt-2 inline-flex min-h-11 items-center rounded-full border border-slate-200 px-4 text-sm font-semibold text-slate-700 hover:border-emerald-300"
        >
          “{filtre.trim()}” olarak yaz
        </button>
      )}
      {secim?.customAttributeValue && (
        <p className="mt-1.5 text-xs text-emerald-700">Yazılan değer: {secim.customAttributeValue}</p>
      )}
    </div>
  );
}

export function TrendyolGonderPaneli({
  urun,
  onClose,
  onSent,
}: {
  urun: PazaryeriSayfaUrunu;
  onClose: () => void;
  onSent: () => void;
}) {
  const titleId = useId();
  const kdvId = useId();
  const onceki = urun.trendyol;

  const [marka, setMarka] = useState<Secim | null>(
    onceki?.marka_id ? { id: onceki.marka_id, ad: onceki.marka_adi ?? `Marka ${onceki.marka_id}` } : null
  );
  const [kategori, setKategori] = useState<Secim | null>(
    onceki?.kategori_id
      ? { id: onceki.kategori_id, ad: onceki.kategori_adi ?? `Kategori ${onceki.kategori_id}` }
      : null
  );
  const [kdv, setKdv] = useState<number>(onceki?.kdv_orani ?? 20);
  const [secimler, setSecimler] = useState(() => readOzellikler(onceki?.ozellikler));
  const [ozellikDurumu, setOzellikDurumu] = useState<{
    kategoriId: number;
    ozellikler: TrendyolZorunluOzellik[] | null;
    hata: string | null;
  } | null>(null);
  const [hata, setHata] = useState<{ metin: string; liste?: string[] } | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isPending) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, isPending]);

  const kategoriId = kategori?.id ?? null;
  useEffect(() => {
    if (kategoriId === null) return;
    let iptal = false;
    trendyolKategoriOzellikleri(kategoriId).then((sonuc) => {
      if (iptal) return;
      setOzellikDurumu(
        "error" in sonuc
          ? { kategoriId, ozellikler: null, hata: sonuc.error }
          : { kategoriId, ozellikler: sonuc.ozellikler, hata: null }
      );
    });
    return () => {
      iptal = true;
    };
  }, [kategoriId]);

  const guncelDurum = ozellikDurumu && ozellikDurumu.kategoriId === kategoriId ? ozellikDurumu : null;
  const ozellikler = guncelDurum?.ozellikler ?? null;
  const ozellikHatasi = guncelDurum?.hata ?? null;

  const markaAra = useMemo(
    () => async (sorgu: string) => {
      const sonuc = await trendyolMarkaAra(sorgu);
      return "error" in sonuc ? sonuc : { sonuclar: sonuc.markalar };
    },
    []
  );
  const kategoriAra = useMemo(
    () => async (sorgu: string) => {
      const sonuc = await trendyolKategoriAra(sorgu);
      return "error" in sonuc
        ? sonuc
        : { sonuclar: sonuc.kategoriler.map((k) => ({ id: k.id, ad: k.ad, alt: k.yol })) };
    },
    []
  );

  const gonder = () => {
    if (!urun.barkod || !marka || !kategori || !ozellikler) return;
    setHata(null);
    const ozellikListesi = ozellikler
      .map((o) => secimler.get(o.attributeId))
      .filter((o): o is TrendyolOzellikSecimi => Boolean(o));

    startTransition(async () => {
      const sonuc = await trendyolUrunGonder({
        barkod: urun.barkod,
        markaId: marka.id,
        markaAdi: marka.ad,
        kategoriId: kategori.id,
        kategoriAdi: kategori.ad,
        kdvOrani: kdv,
        ozellikler: ozellikListesi,
      });
      if ("error" in sonuc) {
        setHata({ metin: sonuc.error, liste: "hatalar" in sonuc ? sonuc.hatalar : undefined });
      } else {
        onSent();
      }
    });
  };

  const hazir = Boolean(marka && kategori && ozellikler);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 sm:items-center sm:p-6">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="flex max-h-[92dvh] w-full max-w-2xl flex-col rounded-t-3xl bg-white shadow-xl sm:rounded-3xl"
      >
        <header className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-600">
              Trendyol’a gönder
            </p>
            <h2 id={titleId} className="mt-1 line-clamp-2 text-base font-semibold text-slate-900">
              {urun.urunAdi}
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Barkod {urun.barkod} · {urun.fiyat ?? "fiyat yok"} · Stok {urun.stokAdedi ?? 0}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            aria-label="Kapat"
            className="inline-flex size-11 shrink-0 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100"
          >
            <X className="size-5" aria-hidden />
          </button>
        </header>

        <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5">
          <AramaliSecici
            label="Trendyol markası"
            placeholder="Örn: Apple, Samsung, Baseus"
            secili={marka}
            onSec={setMarka}
            ara={markaAra}
          />

          <AramaliSecici
            label="Trendyol kategorisi"
            placeholder="Örn: telefon kılıfı, ekran koruyucu, şarj kablosu"
            secili={kategori}
            onSec={(secim) => {
              setKategori(secim);
              setSecimler(new Map());
            }}
            ara={kategoriAra}
          />

          <div>
            <Label htmlFor={kdvId}>KDV oranı</Label>
            <select
              id={kdvId}
              value={kdv}
              onChange={(event) => setKdv(Number(event.target.value))}
              className="min-h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900"
            >
              {TRENDYOL_KDV_ORANLARI.map((oran) => (
                <option key={oran} value={oran}>
                  %{oran}
                </option>
              ))}
            </select>
            <p className="mt-1.5 text-xs text-slate-400">
              Telefon aksesuarlarında genellikle %20’dir; emin değilseniz muhasebecinize sorun.
            </p>
          </div>

          {kategori && (
            <div className="space-y-4 rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
              <p className="text-sm font-semibold text-slate-900">Kategorinin zorunlu özellikleri</p>
              {ozellikHatasi && <p className="text-sm text-red-600">{ozellikHatasi}</p>}
              {!ozellikler && !ozellikHatasi && (
                <p className="text-sm text-slate-500">Özellikler yükleniyor…</p>
              )}
              {ozellikler?.length === 0 && (
                <p className="text-sm text-slate-500">Bu kategoride zorunlu özellik yok.</p>
              )}
              {ozellikler?.map((ozellik) => (
                <OzellikAlani
                  key={ozellik.attributeId}
                  ozellik={ozellik}
                  secim={secimler.get(ozellik.attributeId)}
                  onChange={(secim) =>
                    setSecimler((onceki) => {
                      const yeni = new Map(onceki);
                      if (secim) yeni.set(ozellik.attributeId, secim);
                      else yeni.delete(ozellik.attributeId);
                      return yeni;
                    })
                  }
                />
              ))}
            </div>
          )}

          {hata && (
            <div role="alert" className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
              <p>{hata.metin}</p>
              {hata.liste && (
                <ul className="mt-2 list-disc space-y-1 pl-5">
                  {hata.liste.map((madde) => (
                    <li key={madde}>{madde}</li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        <footer className="flex gap-2 border-t border-slate-100 px-5 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="inline-flex min-h-11 items-center rounded-full px-5 text-sm font-semibold text-slate-600 hover:bg-slate-100"
          >
            Vazgeç
          </button>
          <button
            type="button"
            onClick={gonder}
            disabled={!hazir || isPending}
            className={cn(
              "ml-auto inline-flex min-h-11 items-center rounded-full bg-emerald-600 px-6 text-sm font-semibold text-white transition hover:bg-emerald-700",
              (!hazir || isPending) && "opacity-50"
            )}
          >
            {isPending ? "Gönderiliyor…" : "Trendyol’a gönder"}
          </button>
        </footer>
      </div>
    </div>
  );
}
