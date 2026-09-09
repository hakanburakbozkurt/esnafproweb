"use client";

import { useActionState, useMemo, useState } from "react";
import {
  localAccentLabelClass,
  localAlertErrorClass,
  localAlertInfoClass,
  localAlertSuccessClass,
  localBtnPrimaryClass,
  localInputClass,
  localLabelClass,
  localSelectClass,
  localWorkspaceSectionClass,
} from "@/components/local-yonetim/local-admin-ui";
import { LocalAuthNotice } from "@/components/local-yonetim/local-auth-notice";
import { applyTamirBulkPriceAdjustmentForm } from "@/lib/local-yonetim/tamir-wizard/tamir-price-wizard-actions";
import type {
  TamirPriceWizardState,
  TamirWizardMarkaOption,
} from "@/lib/local-yonetim/subscriptions/types";
import { cn } from "@/lib/utils/cn";

const initialState: TamirPriceWizardState = {};

type LocalTamirPriceWizardClientProps = {
  markalar: TamirWizardMarkaOption[];
  categories: string[];
  canEdit: boolean;
  loadError?: string;
};

export function LocalTamirPriceWizardClient({
  markalar,
  categories,
  canEdit,
  loadError,
}: LocalTamirPriceWizardClientProps) {
  const [selectedMarkaId, setSelectedMarkaId] = useState(markalar[0]?.id ?? "");
  const [selectedSeriIds, setSelectedSeriIds] = useState<string[]>([]);
  const [category, setCategory] = useState("");
  const [state, formAction, isPending] = useActionState(
    applyTamirBulkPriceAdjustmentForm,
    initialState
  );

  const selectedMarka = useMemo(
    () => markalar.find((marka) => marka.id === selectedMarkaId) ?? markalar[0],
    [markalar, selectedMarkaId]
  );

  const selectedPriceCount = useMemo(() => {
    if (!selectedMarka) return 0;
    const idSet = new Set(selectedSeriIds);
    return selectedMarka.seriler
      .filter((seri) => idSet.has(seri.id))
      .reduce((sum, seri) => sum + seri.price_count, 0);
  }, [selectedMarka, selectedSeriIds]);

  function toggleSeri(seriId: string) {
    setSelectedSeriIds((current) =>
      current.includes(seriId)
        ? current.filter((id) => id !== seriId)
        : [...current, seriId]
    );
  }

  function selectAllSeries() {
    if (!selectedMarka) return;
    setSelectedSeriIds(selectedMarka.seriler.map((seri) => seri.id));
  }

  return (
    <div className="space-y-8">
      <header className="space-y-4 border-b border-neutral-100 pb-6">
        <p className={localAccentLabelClass}>Tamir Fiyatları</p>
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
          Fiyat sihirbazı
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-neutral-600">
          iPhone serileri ve modelleri için tamir fiyat tablolarında toplu yüzde
          veya sabit tutar artış/azalış uygulayın.
        </p>

        <LocalAuthNotice canEdit={canEdit} nextPath="/local-yonetim/fiyat-sihirbazi" />
        {loadError && <p className={localAlertErrorClass}>Veritabanı hatası: {loadError}</p>}
      </header>

      <form action={formAction} className="space-y-6">
        <section className={localWorkspaceSectionClass}>
          <h2 className="text-lg font-bold text-neutral-900">1. Marka & seri seçimi</h2>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className={localLabelClass} htmlFor="marka">
                Marka
              </label>
              <select
                id="marka"
                value={selectedMarkaId}
                onChange={(event) => {
                  setSelectedMarkaId(event.target.value);
                  setSelectedSeriIds([]);
                }}
                className={localSelectClass}
                disabled={!canEdit}
              >
                {markalar.map((marka) => (
                  <option key={marka.id} value={marka.id}>
                    {marka.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                type="button"
                onClick={selectAllSeries}
                disabled={!canEdit || !selectedMarka?.seriler.length}
                className="rounded-full border border-neutral-200 bg-white px-4 py-2 text-xs font-semibold text-neutral-700 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 disabled:opacity-50"
              >
                Tüm serileri seç
              </button>
            </div>
          </div>

          <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
            {selectedMarka?.seriler.map((seri) => {
              const checked = selectedSeriIds.includes(seri.id);
              return (
                <label
                  key={seri.id}
                  className={cn(
                    "flex cursor-pointer items-start gap-3 rounded-2xl border px-4 py-3 transition",
                    checked
                      ? "border-emerald-200 bg-emerald-50/70"
                      : "border-neutral-100 bg-neutral-50/50 hover:border-emerald-100"
                  )}
                >
                  <input
                    type="checkbox"
                    name="seri_ids"
                    value={seri.id}
                    checked={checked}
                    onChange={() => toggleSeri(seri.id)}
                    disabled={!canEdit}
                    className="mt-0.5 size-4 rounded border-neutral-300 text-emerald-600"
                  />
                  <span>
                    <span className="block text-sm font-medium text-neutral-900">{seri.name}</span>
                    <span className="mt-0.5 block text-xs text-neutral-500">
                      {seri.model_count} model · {seri.price_count} fiyat
                    </span>
                  </span>
                </label>
              );
            })}
          </div>

          {!selectedMarka?.seriler.length && (
            <p className={cn("mt-4", localAlertInfoClass)}>Bu marka için seri bulunamadı.</p>
          )}
        </section>

        <section className={localWorkspaceSectionClass}>
          <h2 className="text-lg font-bold text-neutral-900">2. Ayarlama kuralları</h2>

          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div>
              <label className={localLabelClass} htmlFor="category">
                Kategori (opsiyonel)
              </label>
              <select
                id="category"
                name="category"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                className={localSelectClass}
                disabled={!canEdit}
              >
                <option value="">Tüm kategoriler</option>
                {categories.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={localLabelClass} htmlFor="adjustment_type">
                Tip
              </label>
              <select
                id="adjustment_type"
                name="adjustment_type"
                defaultValue="percent"
                className={localSelectClass}
                disabled={!canEdit}
              >
                <option value="percent">Yüzde (%)</option>
                <option value="fixed">Sabit tutar (₺)</option>
              </select>
            </div>

            <div>
              <label className={localLabelClass} htmlFor="direction">
                Yön
              </label>
              <select
                id="direction"
                name="direction"
                defaultValue="increase"
                className={localSelectClass}
                disabled={!canEdit}
              >
                <option value="increase">Artır</option>
                <option value="decrease">Azalt</option>
              </select>
            </div>

            <div>
              <label className={localLabelClass} htmlFor="adjustment_value">
                Değer
              </label>
              <input
                id="adjustment_value"
                name="adjustment_value"
                type="number"
                min="0.01"
                step="0.01"
                defaultValue="10"
                required
                disabled={!canEdit}
                className={localInputClass}
              />
            </div>
          </div>

          <p className="mt-4 rounded-2xl border border-emerald-100 bg-emerald-50/60 px-4 py-3 text-sm text-emerald-900">
            Seçili serilerde yaklaşık{" "}
            <strong className="font-semibold">{selectedPriceCount}</strong> fiyat kaydı
            etkilenecek.
          </p>
        </section>

        {state.error && <p className={localAlertErrorClass}>{state.error}</p>}
        {state.success && <p className={localAlertSuccessClass}>{state.success}</p>}

        {canEdit && (
          <button
            type="submit"
            disabled={isPending || selectedSeriIds.length === 0}
            className={localBtnPrimaryClass}
          >
            {isPending ? "Uygulanıyor…" : "Toplu fiyat güncellemesini uygula"}
          </button>
        )}
      </form>
    </div>
  );
}
