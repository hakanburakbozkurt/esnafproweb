"use client";

import { Package, RefreshCw, Send } from "lucide-react";
import Link from "next/link";
import { useState, useTransition } from "react";
import { TrendyolGonderPaneli } from "@/components/dukkan/pazaryeri/trendyol-gonder-paneli";
import { DURUM_ETIKETLERI, type PazaryeriSayfaUrunu } from "@/components/dukkan/pazaryeri/types";
import { trendyolDurumYenile, trendyolStokFiyatGonder } from "@/lib/pazaryeri/trendyol-actions";
import { cn } from "@/lib/utils/cn";

export function TrendyolUrunListesi({ urunler }: { urunler: PazaryeriSayfaUrunu[] }) {
  const [acikUrun, setAcikUrun] = useState<PazaryeriSayfaUrunu | null>(null);
  const [mesaj, setMesaj] = useState<{ tip: "ok" | "hata"; metin: string } | null>(null);
  const [isPending, startTransition] = useTransition();
  const [yenilenen, setYenilenen] = useState<string | null>(null);

  const barkodSayilari = new Map<string, number>();
  for (const u of urunler) {
    if (u.barkod) barkodSayilari.set(u.barkod, (barkodSayilari.get(u.barkod) ?? 0) + 1);
  }

  const eslenebilir = urunler.filter(
    (u) => u.trendyol && (u.trendyol.durum === "onay_bekliyor" || u.trendyol.durum === "yayinda")
  ).length;

  const stokFiyatGonder = () => {
    setMesaj(null);
    startTransition(async () => {
      const sonuc = await trendyolStokFiyatGonder();
      if ("error" in sonuc) {
        setMesaj({ tip: "hata", metin: sonuc.error });
      } else {
        setMesaj({
          tip: "ok",
          metin:
            `${sonuc.gonderilen} ürünün stok ve fiyatı Trendyol’a gönderildi.` +
            (sonuc.atlanan ? ` ${sonuc.atlanan} ürün fiyatı okunamadığı için atlandı.` : ""),
        });
      }
    });
  };

  const durumYenile = (barkod: string) => {
    setMesaj(null);
    setYenilenen(barkod);
    startTransition(async () => {
      const sonuc = await trendyolDurumYenile(barkod);
      if ("error" in sonuc) setMesaj({ tip: "hata", metin: sonuc.error });
      setYenilenen(null);
    });
  };

  return (
    <section className="rounded-3xl border border-slate-200/70 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Ürünler</h2>
          <p className="mt-1 text-sm text-slate-600">
            Trendyol ürünleri onaydan geçirir; onay birkaç saat ile birkaç gün sürebilir.
          </p>
        </div>
        <button
          type="button"
          onClick={stokFiyatGonder}
          disabled={isPending || eslenebilir === 0}
          title={eslenebilir === 0 ? "Önce bir ürünü Trendyol'a gönderin" : undefined}
          className="inline-flex min-h-11 items-center gap-2 rounded-full bg-slate-900 px-5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50"
        >
          <RefreshCw className="size-4" aria-hidden />
          Stok ve fiyatı eşitle
        </button>
      </div>

      {mesaj && (
        <p
          role={mesaj.tip === "hata" ? "alert" : "status"}
          className={cn(
            "mt-4 rounded-2xl border px-4 py-3 text-sm",
            mesaj.tip === "hata"
              ? "border-red-100 bg-red-50 text-red-600"
              : "border-emerald-100 bg-emerald-50 text-emerald-700"
          )}
        >
          {mesaj.metin}
        </p>
      )}

      {urunler.length === 0 ? (
        <div className="mt-5 rounded-2xl border border-dashed border-slate-200 px-5 py-8 text-center">
          <p className="text-sm font-semibold text-slate-900">Henüz ürününüz yok</p>
          <Link
            href="/dukkan-ayarlari/urunler"
            className="mt-3 inline-flex min-h-11 items-center rounded-full bg-emerald-600 px-5 text-sm font-semibold text-white transition hover:bg-emerald-700"
          >
            Ürün ekle
          </Link>
        </div>
      ) : (
        <ul className="mt-5 divide-y divide-slate-100">
          {urunler.map((urun) => {
            const durum = urun.trendyol?.durum ?? null;
            const etiket = durum ? DURUM_ETIKETLERI[durum] : null;
            const tekrarliBarkod = urun.barkod ? (barkodSayilari.get(urun.barkod) ?? 0) > 1 : false;
            const gonderilebilir = Boolean(urun.barkod) && !tekrarliBarkod;
            const yenilenebilir = durum === "gonderildi" || durum === "onay_bekliyor";

            return (
              <li key={urun.id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center">
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  {urun.fotografUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={urun.fotografUrl}
                      alt=""
                      className="size-14 shrink-0 rounded-2xl border border-slate-100 object-cover"
                    />
                  ) : (
                    <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                      <Package className="size-5" aria-hidden />
                    </span>
                  )}
                  <div className="min-w-0">
                    <p className="line-clamp-2 text-sm font-semibold text-slate-900">{urun.urunAdi}</p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {urun.barkod ? `Barkod ${urun.barkod}` : "Barkod yok"}
                      {urun.fiyat ? ` · ${urun.fiyat}` : ""}
                      {urun.stokAdedi !== null ? ` · Stok ${urun.stokAdedi}` : ""}
                    </p>
                    {etiket && (
                      <span
                        className={cn(
                          "mt-1.5 inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1",
                          etiket.className
                        )}
                      >
                        {etiket.label}
                      </span>
                    )}
                    {durum === "hata" && urun.trendyol?.son_hata && (
                      <p className="mt-1 text-xs text-red-600">{urun.trendyol.son_hata}</p>
                    )}
                    {!urun.barkod && (
                      <p className="mt-1 text-xs text-amber-700">
                        Göndermek için{" "}
                        <Link href="/dukkan-ayarlari/urunler" className="font-semibold underline">
                          ürüne barkod ekleyin
                        </Link>
                        .
                      </p>
                    )}
                    {tekrarliBarkod && (
                      <p className="mt-1 text-xs text-amber-700">
                        Bu barkod başka bir üründe de var. Her ürünün barkodu farklı olmalı.
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex shrink-0 flex-wrap gap-2 sm:justify-end">
                  {yenilenebilir && urun.barkod && (
                    <button
                      type="button"
                      onClick={() => durumYenile(urun.barkod!)}
                      disabled={isPending}
                      className="inline-flex min-h-11 items-center gap-2 rounded-full border border-slate-200 px-4 text-sm font-semibold text-slate-700 transition hover:border-emerald-300 hover:text-emerald-700 disabled:opacity-60"
                    >
                      <RefreshCw
                        className={cn("size-4", yenilenen === urun.barkod && "animate-spin")}
                        aria-hidden
                      />
                      Durumu yenile
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setAcikUrun(urun)}
                    disabled={!gonderilebilir || isPending}
                    className="inline-flex min-h-11 items-center gap-2 rounded-full bg-emerald-600 px-4 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
                  >
                    <Send className="size-4" aria-hidden />
                    {durum && durum !== "taslak" ? "Tekrar gönder" : "Trendyol’a gönder"}
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {acikUrun && (
        <TrendyolGonderPaneli
          key={acikUrun.id}
          urun={acikUrun}
          onClose={() => setAcikUrun(null)}
          onSent={() => {
            setAcikUrun(null);
            setMesaj({
              tip: "ok",
              metin: "Ürün Trendyol’a iletildi. Birkaç dakika sonra “Durumu yenile” ile sonucu görebilirsiniz.",
            });
          }}
        />
      )}
    </section>
  );
}
