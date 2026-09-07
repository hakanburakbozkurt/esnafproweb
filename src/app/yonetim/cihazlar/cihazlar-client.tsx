"use client";

import { RefreshCw, Smartphone } from "lucide-react";
import { useCallback, useRef, useState, useTransition } from "react";
import { CihazDeviceForm } from "@/components/cihaz/cihaz-device-form";
import { CihazDeviceList } from "@/components/cihaz/cihaz-device-list";
import { useCihazVitrini } from "@/lib/cihaz/use-cihaz-vitrini";
import type { IkinciElCihaz } from "@/lib/cihaz/types";

type CihazlarClientProps = {
  initialDevices: IkinciElCihaz[];
  shopSlug: string;
};

export function CihazlarClient({
  initialDevices,
  shopSlug,
}: CihazlarClientProps) {
  const vitrini = useCihazVitrini(initialDevices);
  const formRef = useRef<HTMLDivElement>(null);
  const [refreshError, setRefreshError] = useState<string | null>(null);
  const [isRefreshing, startRefresh] = useTransition();

  const scrollToForm = useCallback(() => {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  function handleRefresh() {
    setRefreshError(null);
    startRefresh(async () => {
      const result = await vitrini.fetchDevices();
      if (!result.ok) {
        setRefreshError(result.error);
      }
    });
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-emerald-100 bg-gradient-to-br from-emerald-50/80 to-white p-4 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <span className="inline-flex size-10 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
              <Smartphone className="size-5" aria-hidden />
            </span>
            <div>
              <p className="text-sm font-semibold text-slate-900">
                Cihaz envanteri & pazaryeri
              </p>
              <p className="mt-1 max-w-2xl text-sm text-slate-600">
                Cihaz ekleyin, düzenleyin ve{" "}
                <strong className="font-medium">Web vitrin</strong> anahtarını
                açarak kayıtları{" "}
                <a
                  href="/pazaryeri"
                  className="font-medium text-emerald-700 underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  esnafpro.app/pazaryeri
                </a>{" "}
                ve mağaza vitrininize taşıyın.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing || vitrini.loading}
            className="inline-flex min-h-10 items-center gap-2 rounded-full border border-slate-200 bg-white px-4 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-60"
          >
            <RefreshCw
              className={isRefreshing ? "size-4 animate-spin" : "size-4"}
              aria-hidden
            />
            Yenile
          </button>
        </div>
      </div>

      {refreshError && (
        <div
          role="alert"
          className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {refreshError}
        </div>
      )}

      <div ref={formRef}>
        <CihazDeviceForm
          vitrini={vitrini}
          onSaved={() => {
            if (vitrini.editingDeviceId) return;
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        />
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-slate-800">
            Envanter ({vitrini.devices.length})
          </h2>
          {vitrini.editingDeviceId && (
            <button
              type="button"
              onClick={scrollToForm}
              className="text-xs font-medium text-emerald-600 underline"
            >
              Forma dön
            </button>
          )}
        </div>
        <CihazDeviceList vitrini={vitrini} shopSlug={shopSlug} />
      </div>
    </div>
  );
}
