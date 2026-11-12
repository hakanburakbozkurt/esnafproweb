"use client";

import { useEffect, useRef, useState } from "react";
import { Crosshair, X } from "lucide-react";
import {
  gorselAdresi,
  gorselOdagi,
  VARSAYILAN_ODAK,
  type GorselOdak,
} from "@/lib/gorsel/odak";

type Props = {
  uri: string;
  onKaydet: (odak: GorselOdak) => void;
  onKapat: () => void;
};

/**
 * Esnaf fotoğrafa dokunarak / sürükleyerek öne çıkacak yeri seçer.
 * Kartlarda ve ilan galerisinde görsel kutuyu doldurur, bu nokta görünür kalır.
 */
export function GorselOdakDuzenleyici({ uri, onKaydet, onKapat }: Props) {
  const [odak, setOdak] = useState<GorselOdak>(() => gorselOdagi(uri));
  const alanRef = useRef<HTMLDivElement | null>(null);
  const surukleniyor = useRef(false);
  const src = gorselAdresi(uri);

  useEffect(() => {
    function tus(e: KeyboardEvent) {
      if (e.key === "Escape") onKapat();
    }
    window.addEventListener("keydown", tus);
    return () => window.removeEventListener("keydown", tus);
  }, [onKapat]);

  function noktayiAyarla(clientX: number, clientY: number) {
    const alan = alanRef.current?.getBoundingClientRect();
    if (!alan) return;
    setOdak({
      x: Math.round(((clientX - alan.left) / alan.width) * 100),
      y: Math.round(((clientY - alan.top) / alan.height) * 100),
    });
  }

  const x = Math.min(100, Math.max(0, odak.x));
  const y = Math.min(100, Math.max(0, odak.y));
  const konum = `${x}% ${y}%`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 p-3 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="odak-baslik"
    >
      <div className="max-h-[94vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white p-4 shadow-xl sm:p-5">
        <div className="flex items-center justify-between gap-3">
          <h3 id="odak-baslik" className="text-base font-semibold text-slate-900">
            Fotoğrafı ortala
          </h3>
          <button
            type="button"
            onClick={onKapat}
            className="inline-flex size-9 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100"
            aria-label="Kapat"
          >
            <X className="size-4" />
          </button>
        </div>
        <p className="mt-1 text-xs leading-relaxed text-slate-500">
          Fotoğrafın tamamı aşağıda. Öne çıkmasını istediğiniz yere dokunun ya da
          noktayı sürükleyin. Kartlarda ve ilanda bu kısım ortada görünür.
        </p>

        {/* Tüm fotoğraf: nokta burada seçilir */}
        <div className="mt-3 flex justify-center rounded-2xl bg-slate-100 p-2">
          <div
            ref={alanRef}
            className="relative inline-block cursor-crosshair touch-none select-none"
            onPointerDown={(e) => {
              surukleniyor.current = true;
              e.currentTarget.setPointerCapture(e.pointerId);
              noktayiAyarla(e.clientX, e.clientY);
            }}
            onPointerMove={(e) => {
              if (surukleniyor.current) noktayiAyarla(e.clientX, e.clientY);
            }}
            onPointerUp={() => {
              surukleniyor.current = false;
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt="Ortalanacak fotoğraf"
              className="block max-h-[42vh] w-auto max-w-full rounded-xl"
              draggable={false}
            />
            <span
              className="pointer-events-none absolute size-9 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-white shadow-[0_0_0_2px_rgb(16_185_129),0_2px_8px_rgba(0,0,0,0.4)]"
              style={{ left: `${x}%`, top: `${y}%` }}
              aria-hidden
            />
          </div>
        </div>

        {/* Önizleme: kartta nasıl görünecek */}
        <div className="mt-4 flex items-center gap-3">
          <div className="relative size-24 shrink-0 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
              style={{ objectPosition: konum }}
              draggable={false}
            />
          </div>
          <p className="text-xs leading-relaxed text-slate-500">
            <span className="font-semibold text-slate-700">Kart önizlemesi.</span>{" "}
            Pazaryerinde ilan kartında fotoğraf böyle görünecek.
          </p>
        </div>

        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={() => setOdak(VARSAYILAN_ODAK)}
            className="inline-flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            <Crosshair className="size-4" aria-hidden />
            Ortaya al
          </button>
          <button
            type="button"
            onClick={() => onKaydet({ x, y })}
            className="inline-flex min-h-11 flex-1 items-center justify-center rounded-full bg-emerald-600 px-4 text-sm font-semibold text-white transition hover:bg-emerald-700"
          >
            Kaydet
          </button>
        </div>
      </div>
    </div>
  );
}
