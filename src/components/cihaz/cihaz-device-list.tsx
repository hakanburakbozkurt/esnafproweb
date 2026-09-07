"use client";

import {
  ExternalLink,
  Loader2,
  Pencil,
  Trash2,
} from "lucide-react";
import Image from "next/image";
import { useState, useTransition } from "react";
import type { useCihazVitrini } from "@/lib/cihaz/use-cihaz-vitrini";
import {
  DEVICE_CATEGORY_META,
  LISTING_TYPE_LABEL,
  type IkinciElCihaz,
} from "@/lib/cihaz/types";
import { cn } from "@/lib/utils/cn";

type VitriniHook = ReturnType<typeof useCihazVitrini>;

function formatPrice(value: number) {
  if (!value || value <= 0) return "—";
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(value);
}

function DeviceThumbnail({ device }: { device: IkinciElCihaz }) {
  const src = device.image_urls?.[0];
  if (!src) {
    return (
      <div className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-xs text-slate-400">
        —
      </div>
    );
  }

  return (
    <div className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-slate-100">
      <Image
        src={src}
        alt=""
        fill
        className="object-cover"
        sizes="56px"
        unoptimized
      />
    </div>
  );
}

function PublishToggle({
  device,
  vitrini,
}: {
  device: IkinciElCihaz;
  vitrini: VitriniHook;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (device.status === "sold") {
    return (
      <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-500">
        Satıldı
      </span>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <label className="inline-flex min-h-10 cursor-pointer items-center gap-2">
        <span className="text-xs font-medium text-slate-500">Web vitrin</span>
        <button
          type="button"
          role="switch"
          aria-checked={device.web_published}
          disabled={pending}
          onClick={() => {
            setError(null);
            startTransition(async () => {
              const result = await vitrini.updateWebPublishing(device.id, {
                web_published: !device.web_published,
              });
              if (!result.success) {
                setError(result.error ?? "Yayın durumu güncellenemedi.");
              }
            });
          }}
          className={cn(
            "relative inline-flex h-6 w-11 shrink-0 rounded-full transition",
            device.web_published ? "bg-emerald-500" : "bg-slate-200",
            pending && "opacity-60"
          )}
        >
          <span
            className={cn(
              "absolute top-0.5 size-5 rounded-full bg-white shadow transition",
              device.web_published ? "left-[22px]" : "left-0.5"
            )}
          />
        </button>
        {pending && (
          <Loader2 className="size-4 animate-spin text-slate-400" aria-hidden />
        )}
      </label>
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  );
}

function DeviceRow({
  device,
  vitrini,
  shopSlug,
}: {
  device: IkinciElCihaz;
  vitrini: VitriniHook;
  shopSlug?: string | null;
}) {
  const [actionPending, startAction] = useTransition();
  const categoryLabel =
    DEVICE_CATEGORY_META[device.device_category ?? "phone"]?.label ?? "Cihaz";
  const listingLabel = LISTING_TYPE_LABEL[device.listing_type ?? "used"];

  return (
    <article className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
      <div className="flex gap-3 sm:gap-4">
        <DeviceThumbnail device={device} />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h3 className="font-semibold text-slate-900">
                {device.brand} {device.model}
              </h3>
              <p className="mt-0.5 text-sm text-slate-500">
                {categoryLabel} · {listingLabel} · {device.condition}
              </p>
            </div>
            <p className="text-base font-bold text-emerald-700">
              {formatPrice(device.sale_price)}
            </p>
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <PublishToggle device={device} vitrini={vitrini} />

            <div className="flex flex-wrap gap-2">
              {device.web_published && shopSlug && (
                <a
                  href={`/${shopSlug}/pazaryeri/${device.web_slug?.trim() || device.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-9 items-center gap-1 rounded-full border border-slate-200 px-3 text-xs font-medium text-slate-600 transition hover:bg-slate-50"
                >
                  <ExternalLink className="size-3.5" />
                  Vitrinde Gör
                </a>
              )}

              <button
                type="button"
                disabled={actionPending || device.status === "sold"}
                onClick={() => vitrini.startEditDevice(device)}
                className="inline-flex min-h-9 items-center gap-1 rounded-full border border-slate-200 px-3 text-xs font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
              >
                <Pencil className="size-3.5" />
                Düzenle
              </button>

              {device.status === "available" && (
                <button
                  type="button"
                  disabled={actionPending}
                  onClick={() => {
                    if (
                      !window.confirm(
                        "Bu cihaz satıldı olarak işaretlenecek ve web vitrininden kaldırılacak. Emin misiniz?"
                      )
                    ) {
                      return;
                    }
                    startAction(async () => {
                      await vitrini.markSold(device.id);
                    });
                  }}
                  className="inline-flex min-h-9 items-center rounded-full border border-amber-200 bg-amber-50 px-3 text-xs font-medium text-amber-800 transition hover:bg-amber-100 disabled:opacity-50"
                >
                  Satıldı
                </button>
              )}

              <button
                type="button"
                disabled={actionPending}
                onClick={() => {
                  if (
                    !window.confirm(
                      "Bu cihaz kaydı kalıcı olarak silinecek. Emin misiniz?"
                    )
                  ) {
                    return;
                  }
                  startAction(async () => {
                    await vitrini.removeDevice(device.id);
                  });
                }}
                className="inline-flex min-h-9 items-center gap-1 rounded-full border border-red-200 px-3 text-xs font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-50"
              >
                <Trash2 className="size-3.5" />
                Sil
              </button>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

type CihazDeviceListProps = {
  vitrini: VitriniHook;
  shopSlug?: string | null;
};

export function CihazDeviceList({ vitrini, shopSlug }: CihazDeviceListProps) {
  const { devices, loading } = vitrini;

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 rounded-3xl border border-slate-200/80 bg-white py-16 text-sm text-slate-500">
        <Loader2 className="size-5 animate-spin text-emerald-600" />
        Cihazlar yükleniyor…
      </div>
    );
  }

  if (devices.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-200 bg-white px-6 py-14 text-center">
        <p className="text-sm font-medium text-slate-700">
          Henüz cihaz kaydı yok
        </p>
        <p className="mt-1 text-sm text-slate-500">
          Yukarıdaki formdan ilk cihazınızı ekleyin; web vitrinine yayınlayarak
          pazaryerinde listeleyebilirsiniz.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3 md:hidden">
        {devices.map((device) => (
          <DeviceRow
            key={device.id}
            device={device}
            vitrini={vitrini}
            shopSlug={shopSlug}
          />
        ))}
      </div>

      <div className="hidden overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm md:block">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-slate-100 bg-slate-50/80 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Cihaz</th>
              <th className="px-4 py-3">Kategori</th>
              <th className="px-4 py-3">Fiyat</th>
              <th className="px-4 py-3">Durum</th>
              <th className="px-4 py-3">Web</th>
              <th className="px-4 py-3 text-right">İşlemler</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {devices.map((device) => (
              <tr key={device.id} className="hover:bg-slate-50/50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <DeviceThumbnail device={device} />
                    <div>
                      <p className="font-medium text-slate-900">
                        {device.brand} {device.model}
                      </p>
                      <p className="text-xs text-slate-500">
                        {LISTING_TYPE_LABEL[device.listing_type ?? "used"]}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {DEVICE_CATEGORY_META[device.device_category ?? "phone"]
                    ?.label ?? "—"}
                </td>
                <td className="px-4 py-3 font-semibold text-emerald-700">
                  {formatPrice(device.sale_price)}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={cn(
                      "inline-flex rounded-full px-2.5 py-1 text-xs font-medium",
                      device.status === "sold"
                        ? "bg-slate-100 text-slate-500"
                        : "bg-emerald-50 text-emerald-700"
                    )}
                  >
                    {device.status === "sold" ? "Satıldı" : "Satılık"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <PublishToggle device={device} vitrini={vitrini} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      disabled={device.status === "sold"}
                      onClick={() => vitrini.startEditDevice(device)}
                      className="inline-flex min-h-9 items-center gap-1 rounded-full border border-slate-200 px-3 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                    >
                      <Pencil className="size-3.5" />
                      Düzenle
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
