"use client";

import { Layers, Pencil, Plus, Search, Trash2, X } from "lucide-react";
import { useActionState, useEffect, useMemo, useState } from "react";
import {
  localAccentLabelClass,
  localAlertErrorClass,
  localAlertInfoClass,
  localAlertSuccessClass,
  localBtnPrimaryClass,
  localBtnSecondaryClass,
  localBtnSmallDangerClass,
  localBtnSmallPrimaryClass,
  localBtnSmallSecondaryClass,
  localCardClass,
  localHintClass,
  localInputClass,
  localLabelClass,
  localSectionTitleClass,
  localSelectClass,
  localWorkspaceSectionClass,
} from "@/components/local-yonetim/local-admin-ui";
import { LocalAuthNotice } from "@/components/local-yonetim/local-auth-notice";
import {
  deleteCihazKataloguBrandForm,
  deleteCihazKataloguForm,
  upsertCihazKataloguForm,
} from "@/lib/katalog/cihaz-katalogu-actions";
import {
  CIHAZ_KATALOGU_CATEGORIES,
  CIHAZ_KATALOGU_CATEGORY_LABELS,
  CIHAZ_KATALOGU_SPEC_FIELDS,
  type CihazKataloguAdminState,
  type CihazKataloguRow,
} from "@/lib/katalog/cihaz-katalogu.types";
import type { DeviceCategory } from "@/lib/cihaz/types";
import { cn } from "@/lib/utils/cn";

const initialState: CihazKataloguAdminState = {};

type LocalDeviceCatalogClientProps = {
  rows: CihazKataloguRow[];
  canEdit: boolean;
  loadError?: string;
};

type CatalogFormMode = "create" | "edit";

function CatalogEntryModal({
  mode,
  row,
  canEdit,
  onClose,
}: {
  mode: CatalogFormMode;
  row?: CihazKataloguRow;
  canEdit: boolean;
  onClose: () => void;
}) {
  const [state, formAction, isPending] = useActionState(
    upsertCihazKataloguForm,
    initialState
  );

  useEffect(() => {
    if (state.success) onClose();
  }, [state.success, onClose]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="catalog-form-title"
    >
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-neutral-100 bg-white p-6 shadow-xl sm:p-8">
        <div className="flex items-start justify-between gap-4 border-b border-neutral-100 pb-4">
          <div>
            <p className={localAccentLabelClass}>
              {mode === "create" ? "Yeni kayıt" : "Kayıt düzenle"}
            </p>
            <h2
              id="catalog-form-title"
              className="mt-1 text-xl font-bold text-neutral-900"
            >
              {mode === "create" ? "Model ekle" : `${row?.brand} ${row?.model_name}`}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex size-9 items-center justify-center rounded-full border border-neutral-200 text-neutral-500 transition hover:bg-neutral-50"
            aria-label="Kapat"
          >
            <X className="size-4" />
          </button>
        </div>

        <form action={formAction} className="mt-5 space-y-4">
          {row?.id && <input type="hidden" name="id" value={row.id} />}

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={localLabelClass} htmlFor="category">
                Kategori
              </label>
              <select
                id="category"
                name="category"
                defaultValue={row?.category ?? "phone"}
                disabled={!canEdit || isPending}
                className={localSelectClass}
                required
              >
                {CIHAZ_KATALOGU_CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {CIHAZ_KATALOGU_CATEGORY_LABELS[category]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={localLabelClass} htmlFor="sort_order">
                Sıra
              </label>
              <input
                id="sort_order"
                name="sort_order"
                type="number"
                min={0}
                defaultValue={row?.sort_order ?? 0}
                disabled={!canEdit || isPending}
                className={localInputClass}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={localLabelClass} htmlFor="brand">
                Marka
              </label>
              <input
                id="brand"
                name="brand"
                defaultValue={row?.brand ?? ""}
                disabled={!canEdit || isPending}
                className={localInputClass}
                placeholder="Apple, Samsung, Xiaomi…"
                required
              />
            </div>

            <div>
              <label className={localLabelClass} htmlFor="model_name">
                Model
              </label>
              <input
                id="model_name"
                name="model_name"
                defaultValue={row?.model_name ?? ""}
                disabled={!canEdit || isPending}
                className={localInputClass}
                placeholder="iPhone 15 Pro, Galaxy S24…"
                required
              />
            </div>
          </div>

          <div>
            <p className={localLabelClass}>Temel özellikler</p>
            <p className={localHintClass}>
              İsteğe bağlı — vitrin ve cihaz formlarında referans olarak kullanılır.
            </p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {CIHAZ_KATALOGU_SPEC_FIELDS.map((field) => (
                <div key={field.key}>
                  <label className="text-xs font-medium text-neutral-600" htmlFor={`spec_${field.key}`}>
                    {field.label}
                  </label>
                  <input
                    id={`spec_${field.key}`}
                    name={`spec_${field.key}`}
                    defaultValue={row?.base_specs[field.key] ?? ""}
                    disabled={!canEdit || isPending}
                    className={localInputClass}
                    placeholder={field.placeholder}
                  />
                </div>
              ))}
            </div>
          </div>

          {state.error && <p className={localAlertErrorClass}>{state.error}</p>}
          {state.success && (
            <p className={localAlertSuccessClass}>Kayıt başarıyla güncellendi.</p>
          )}

          <div className="flex flex-wrap gap-2 pt-2">
            <button
              type="submit"
              disabled={!canEdit || isPending}
              className={localBtnPrimaryClass}
            >
              {isPending ? "Kaydediliyor…" : mode === "create" ? "Ekle" : "Güncelle"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className={localBtnSecondaryClass}
            >
              İptal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DeleteEntryButton({
  row,
  canEdit,
}: {
  row: CihazKataloguRow;
  canEdit: boolean;
}) {
  const [state, formAction, isPending] = useActionState(
    deleteCihazKataloguForm,
    initialState
  );

  return (
    <form action={formAction}>
      <input type="hidden" name="id" value={row.id} />
      <button
        type="submit"
        disabled={!canEdit || isPending}
        className={localBtnSmallDangerClass}
        title="Modeli sil"
      >
        <Trash2 className="size-3.5" />
      </button>
      {state.error && (
        <span className="sr-only">{state.error}</span>
      )}
    </form>
  );
}

function DeleteBrandButton({
  category,
  brand,
  modelCount,
  canEdit,
}: {
  category: DeviceCategory;
  brand: string;
  modelCount: number;
  canEdit: boolean;
}) {
  const [state, formAction, isPending] = useActionState(
    deleteCihazKataloguBrandForm,
    initialState
  );

  if (!canEdit) return null;

  return (
    <form
      action={formAction}
      onSubmit={(event) => {
        const confirmed = window.confirm(
          `"${brand}" markasına ait ${modelCount} model silinecek. Emin misiniz?`
        );
        if (!confirmed) event.preventDefault();
      }}
    >
      <input type="hidden" name="category" value={category} />
      <input type="hidden" name="brand" value={brand} />
      <button
        type="submit"
        disabled={isPending}
        className={localBtnSmallDangerClass}
      >
        Markayı sil
      </button>
      {state.error && <p className={localAlertErrorClass}>{state.error}</p>}
    </form>
  );
}

export function LocalDeviceCatalogClient({
  rows,
  canEdit,
  loadError,
}: LocalDeviceCatalogClientProps) {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<DeviceCategory | "all">(
    "all"
  );
  const [brandFilter, setBrandFilter] = useState<string>("all");
  const [modal, setModal] = useState<
    { mode: CatalogFormMode; row?: CihazKataloguRow } | null
  >(null);

  const brands = useMemo(
    () =>
      [...new Set(rows.map((row) => row.brand).filter(Boolean))].sort((a, b) =>
        a.localeCompare(b, "tr")
      ),
    [rows]
  );

  const filteredRows = useMemo(() => {
    const query = search.trim().toLowerCase();

    return rows.filter((row) => {
      if (categoryFilter !== "all" && row.category !== categoryFilter) {
        return false;
      }

      if (brandFilter !== "all" && row.brand !== brandFilter) {
        return false;
      }

      if (!query) return true;

      const haystack = [
        row.brand,
        row.model_name,
        CIHAZ_KATALOGU_CATEGORY_LABELS[row.category],
        ...Object.values(row.base_specs),
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(query);
    });
  }, [rows, search, categoryFilter, brandFilter]);

  const grouped = useMemo(() => {
    const map = new Map<
      DeviceCategory,
      Map<string, CihazKataloguRow[]>
    >();

    for (const row of filteredRows) {
      if (!map.has(row.category)) {
        map.set(row.category, new Map());
      }

      const brandMap = map.get(row.category)!;
      if (!brandMap.has(row.brand)) {
        brandMap.set(row.brand, []);
      }

      brandMap.get(row.brand)!.push(row);
    }

    return map;
  }, [filteredRows]);

  const stats = useMemo(() => {
    const byCategory = CIHAZ_KATALOGU_CATEGORIES.map((category) => ({
      category,
      count: rows.filter((row) => row.category === category).length,
    }));

    return {
      total: rows.length,
      brands: brands.length,
      byCategory,
    };
  }, [rows, brands.length]);

  return (
    <div className="space-y-6">
      <div>
        <p className={localAccentLabelClass}>Global havuz</p>
        <h1 className={localSectionTitleClass}>Cihaz Kataloğu</h1>
        <p className="mt-2 max-w-3xl text-sm text-neutral-600">
          Marka, model, kategori ve temel özellikleri platform genelinde yönetin.
          Telefon ve tablet kayıtları otomatik olarak{" "}
          <code className="rounded bg-emerald-50 px-1.5 py-0.5 text-xs text-emerald-700">
            phone_models
          </code>{" "}
          /{" "}
          <code className="rounded bg-emerald-50 px-1.5 py-0.5 text-xs text-emerald-700">
            tablet_models
          </code>{" "}
          tablolarıyla senkronize edilir.
        </p>
      </div>

      <LocalAuthNotice canEdit={canEdit} nextPath="/local-yonetim/katalog" />

      {loadError && <p className={localAlertErrorClass}>{loadError}</p>}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <div className={localCardClass}>
          <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
            Toplam model
          </p>
          <p className="mt-1 text-2xl font-bold text-neutral-900">{stats.total}</p>
        </div>
        <div className={localCardClass}>
          <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
            Marka
          </p>
          <p className="mt-1 text-2xl font-bold text-neutral-900">{stats.brands}</p>
        </div>
        {stats.byCategory.slice(0, 3).map((item) => (
          <div key={item.category} className={localCardClass}>
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
              {CIHAZ_KATALOGU_CATEGORY_LABELS[item.category]}
            </p>
            <p className="mt-1 text-2xl font-bold text-emerald-700">{item.count}</p>
          </div>
        ))}
      </div>

      <section className={localWorkspaceSectionClass}>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="grid flex-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div className="sm:col-span-2 lg:col-span-1">
              <label className={localLabelClass} htmlFor="catalog-search">
                Ara
              </label>
              <div className="relative mt-1.5">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />
                <input
                  id="catalog-search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  className={cn(localInputClass, "mt-0 pl-9")}
                  placeholder="Marka, model veya özellik…"
                />
              </div>
            </div>

            <div>
              <label className={localLabelClass} htmlFor="category-filter">
                Kategori
              </label>
              <select
                id="category-filter"
                value={categoryFilter}
                onChange={(event) =>
                  setCategoryFilter(event.target.value as DeviceCategory | "all")
                }
                className={localSelectClass}
              >
                <option value="all">Tümü</option>
                {CIHAZ_KATALOGU_CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {CIHAZ_KATALOGU_CATEGORY_LABELS[category]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={localLabelClass} htmlFor="brand-filter">
                Marka
              </label>
              <select
                id="brand-filter"
                value={brandFilter}
                onChange={(event) => setBrandFilter(event.target.value)}
                className={localSelectClass}
              >
                <option value="all">Tüm markalar</option>
                {brands.map((brand) => (
                  <option key={brand} value={brand}>
                    {brand}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="button"
            disabled={!canEdit}
            onClick={() => setModal({ mode: "create" })}
            className={cn(localBtnPrimaryClass, "gap-2")}
          >
            <Plus className="size-4" />
            Model ekle
          </button>
        </div>

        <p className="mt-4 text-sm text-neutral-500">
          {filteredRows.length} kayıt gösteriliyor
          {search || categoryFilter !== "all" || brandFilter !== "all"
            ? ` (${rows.length} toplam)`
            : ""}
        </p>
      </section>

      {filteredRows.length === 0 ? (
        <div className={localAlertInfoClass}>
          {rows.length === 0
            ? "Henüz katalog kaydı yok. İlk modeli ekleyerek başlayın."
            : "Filtrelere uyan kayıt bulunamadı."}
        </div>
      ) : (
        <div className="space-y-6">
          {CIHAZ_KATALOGU_CATEGORIES.map((category) => {
            const brandMap = grouped.get(category);
            if (!brandMap?.size) return null;

            return (
              <section key={category} className={localWorkspaceSectionClass}>
                <div className="mb-4 flex items-center gap-2">
                  <Layers className="size-5 text-emerald-600" aria-hidden />
                  <h2 className="text-base font-bold text-neutral-900">
                    {CIHAZ_KATALOGU_CATEGORY_LABELS[category]}
                  </h2>
                  <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                    {[...brandMap.values()].reduce(
                      (sum, models) => sum + models.length,
                      0
                    )}{" "}
                    model
                  </span>
                </div>

                <div className="space-y-4">
                  {[...brandMap.entries()]
                    .sort(([a], [b]) => a.localeCompare(b, "tr"))
                    .map(([brand, models]) => (
                      <div
                        key={`${category}-${brand}`}
                        className="rounded-2xl border border-neutral-100 bg-neutral-50/60 p-4 sm:p-5"
                      >
                        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <p className="text-sm font-bold text-neutral-900">{brand}</p>
                            <p className="text-xs text-neutral-500">
                              {models.length} model
                            </p>
                          </div>
                          <DeleteBrandButton
                            category={category}
                            brand={brand}
                            modelCount={models.length}
                            canEdit={canEdit}
                          />
                        </div>

                        <ul className="space-y-2">
                          {models.map((row) => {
                            const specSummary = Object.entries(row.base_specs)
                              .slice(0, 3)
                              .map(([key, value]) => `${key}: ${value}`)
                              .join(" · ");

                            return (
                              <li
                                key={row.id}
                                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-neutral-100 bg-white px-4 py-3"
                              >
                                <div className="min-w-0 flex-1">
                                  <p className="font-medium text-neutral-900">
                                    {row.model_name}
                                  </p>
                                  {specSummary ? (
                                    <p className="mt-0.5 truncate text-xs text-neutral-500">
                                      {specSummary}
                                    </p>
                                  ) : (
                                    <p className="mt-0.5 text-xs text-neutral-400">
                                      Temel özellik girilmedi
                                    </p>
                                  )}
                                </div>

                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    disabled={!canEdit}
                                    onClick={() =>
                                      setModal({ mode: "edit", row })
                                    }
                                    className={localBtnSmallSecondaryClass}
                                    title="Düzenle"
                                  >
                                    <Pencil className="size-3.5" />
                                  </button>
                                  <DeleteEntryButton row={row} canEdit={canEdit} />
                                </div>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    ))}
                </div>
              </section>
            );
          })}
        </div>
      )}

      {modal && (
        <CatalogEntryModal
          mode={modal.mode}
          row={modal.row}
          canEdit={canEdit}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}
