"use client";

import { AnimatePresence } from "framer-motion";
import { PackagePlus, Plus, Search, SearchX } from "lucide-react";
import { useCallback, useEffect, useId, useMemo, useRef, useState, type FormEvent } from "react";
import { StickySaveBar } from "@/components/dukkan/ayarlar/sticky-save-bar";
import {
  emptyUrunItem,
  isUrunItemSavable,
  normalizeUrunItems,
  UrunHiddenFields,
  type UrunFormItem,
} from "@/components/dukkan/product-photo-editor";
import { UrunCard } from "@/components/dukkan/urunler/urun-card";
import { UrunEditPanel } from "@/components/dukkan/urunler/urun-edit-panel";
import type { UrunItemUpdater } from "@/components/dukkan/urunler/urun-photo-grid";
import { MAX_PRODUCT_PHOTOS } from "@/lib/supabase/storage.constants";
import type { DukkanUrunu } from "@/types/database.types";

const ALL_CATEGORIES = "";
const UNCATEGORIZED = "__kategorisiz__";

type Entry = { key: string; item: UrunFormItem };

type UrunListManagerProps = {
  dukkanId: string;
  storeSlug: string;
  defaultUrunler: DukkanUrunu[];
  action: (formData: FormData) => void;
  isPending: boolean;
  error?: string | null;
  saved?: boolean;
  onCancel: () => void;
};

function toEntries(urunler: DukkanUrunu[]): Entry[] {
  return normalizeUrunItems(urunler).map((item, index) => ({
    key: item.id ?? `mevcut-${index}`,
    item,
  }));
}

function uniqueCategories(entries: Entry[], excludeKey?: string | null): string[] {
  const set = new Set<string>();
  for (const entry of entries) {
    if (entry.key === excludeKey) continue;
    const value = entry.item.urun_kategorisi.trim();
    if (value) set.add(value);
  }
  return [...set].sort((a, b) => a.localeCompare(b, "tr"));
}

function matchesQuery(item: UrunFormItem, query: string): boolean {
  if (!query) return true;
  const haystack = [item.urun_adi, item.urun_aciklama, item.urun_kategorisi, item.fiyat]
    .join(" ")
    .toLocaleLowerCase("tr");
  return haystack.includes(query);
}

export function UrunListManager({
  dukkanId,
  storeSlug,
  defaultUrunler,
  action,
  isPending,
  error,
  saved = false,
  onCancel,
}: UrunListManagerProps) {
  const formId = useId();
  const formRef = useRef<HTMLFormElement>(null);
  /** "Tamam" ile başlatılan kayıt bitince paneli kapatmak için */
  const [closeAfterSave, setCloseAfterSave] = useState(false);
  const [wasPending, setWasPending] = useState(isPending);
  const [entries, setEntries] = useState<Entry[]>(() => toEntries(defaultUrunler));
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState(ALL_CATEGORIES);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [uploadingCount, setUploadingCount] = useState(0);
  const isUploading = uploadingCount > 0;

  const snapshot = useMemo(
    () => JSON.stringify(entries.map((entry) => entry.item)),
    [entries]
  );
  const [initialSnapshot] = useState(snapshot);
  const isDirty = snapshot !== initialSnapshot;

  useEffect(() => {
    if (!isDirty || isPending) return;
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty, isPending]);

  const categories = useMemo(() => uniqueCategories(entries), [entries]);
  const hasUncategorized = entries.some((entry) => !entry.item.urun_kategorisi.trim());
  const normalizedQuery = query.trim().toLocaleLowerCase("tr");

  const visible = entries
    .map((entry, index) => ({ ...entry, position: index + 1 }))
    .filter(({ item }) => {
      const kategori = item.urun_kategorisi.trim();
      if (categoryFilter === UNCATEGORIZED && kategori) return false;
      if (
        categoryFilter !== ALL_CATEGORIES &&
        categoryFilter !== UNCATEGORIZED &&
        kategori !== categoryFilter
      ) {
        return false;
      }
      return matchesQuery(item, normalizedQuery);
    });

  const limitReached = entries.length >= MAX_PRODUCT_PHOTOS;
  const unsavableCount = entries.filter((entry) => !isUrunItemSavable(entry.item)).length;
  const editingIndex = entries.findIndex((entry) => entry.key === editingKey);
  const editingEntry = editingIndex >= 0 ? entries[editingIndex] : null;
  const filtersActive = Boolean(normalizedQuery) || categoryFilter !== ALL_CATEGORIES;

  const closePanel = useCallback(() => setEditingKey(null), []);

  function addProduct() {
    if (limitReached) return;
    const key = `yeni-${crypto.randomUUID()}`;
    const kategori =
      categoryFilter !== ALL_CATEGORIES && categoryFilter !== UNCATEGORIZED
        ? categoryFilter
        : "";
    setEntries((prev) => [...prev, { key, item: { ...emptyUrunItem(), urun_kategorisi: kategori } }]);
    setEditingKey(key);
  }

  function updateEntry(key: string, next: UrunFormItem | UrunItemUpdater) {
    setEntries((prev) =>
      prev.map((entry) =>
        entry.key === key
          ? { ...entry, item: typeof next === "function" ? next(entry.item) : next }
          : entry
      )
    );
  }

  // Panelden kayıt denendiyse: kayıt bitince başarılıysa paneli kapat, hata varsa açık bırak.
  if (wasPending !== isPending) {
    setWasPending(isPending);
    if (!isPending && closeAfterSave) {
      setCloseAfterSave(false);
      if (!error) setEditingKey(null);
    }
  }

  function handleDone() {
    if (isUploading) return;
    if (!isDirty) {
      closePanel();
      return;
    }
    setCloseAfterSave(true);
    formRef.current?.requestSubmit();
  }

  const handleBusyChange = useCallback((busy: boolean) => {
    setUploadingCount((count) => Math.max(0, count + (busy ? 1 : -1)));
  }, []);

  function removeEntry(key: string) {
    setEntries((prev) => prev.filter((entry) => entry.key !== key));
    setEditingKey(null);
  }

  function handleCancel() {
    if (!isDirty) return;
    if (window.confirm("Kaydedilmemiş ürün değişiklikleri silinecek. Emin misiniz?")) {
      onCancel();
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    if (
      unsavableCount > 0 &&
      !window.confirm(
        `${unsavableCount} ürünün fotoğrafı yok ve kaydedilmeyecek. Yine de devam edilsin mi?`
      )
    ) {
      event.preventDefault();
      setCloseAfterSave(false);
    }
  }

  const addButton = (
    <button
      type="button"
      onClick={addProduct}
      disabled={limitReached}
      title={limitReached ? `En fazla ${MAX_PRODUCT_PHOTOS} ürün ekleyebilirsiniz` : undefined}
      className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-full bg-emerald-600 px-5 text-sm font-semibold text-white shadow-sm shadow-emerald-600/20 transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500 disabled:shadow-none"
    >
      <Plus className="size-4" aria-hidden />
      Ürün ekle
    </button>
  );

  return (
    <>
      <form
        ref={formRef}
        id={formId}
        action={action}
        onSubmit={handleSubmit}
        className="space-y-6 pb-36 sm:pb-28"
      >
        <input type="hidden" name="dukkan_id" value={dukkanId} />
        {entries.map((entry, index) => (
          <UrunHiddenFields key={entry.key} index={index} item={entry.item} />
        ))}

        <div className="rounded-3xl border border-slate-200/80 bg-white/95 p-3 shadow-sm sm:p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <label className="relative flex-1">
              <span className="sr-only">Ürün ara</span>
              <Search
                className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400"
                aria-hidden
              />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Ürün adı, açıklama veya fiyat ara"
                className="min-h-11 w-full rounded-full border border-slate-200 bg-slate-50/80 pl-11 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </label>
            <div className="flex gap-2">
              <label className="min-w-0 flex-1 md:w-56 md:flex-none">
                <span className="sr-only">Kategoriye göre filtrele</span>
                <select
                  value={categoryFilter}
                  onChange={(event) => setCategoryFilter(event.target.value)}
                  className="min-h-11 w-full rounded-full border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option value={ALL_CATEGORIES}>Tüm kategoriler</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                  {hasUncategorized && categories.length > 0 && (
                    <option value={UNCATEGORIZED}>Kategorisiz</option>
                  )}
                </select>
              </label>
              {addButton}
            </div>
          </div>
          <p className="mt-3 px-1 text-xs text-slate-500" aria-live="polite">
            {entries.length}/{MAX_PRODUCT_PHOTOS} ürün
            {filtersActive && ` · ${visible.length} sonuç gösteriliyor`}
            {limitReached && " · En fazla 8 ürün ekleyebilirsiniz"}
          </p>
        </div>

        {!entries.length ? (
          <div className="flex flex-col items-center rounded-3xl border border-dashed border-slate-200 bg-white/70 px-6 py-14 text-center">
            <span className="flex size-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
              <PackagePlus className="size-7" aria-hidden />
            </span>
            <h2 className="mt-4 text-base font-semibold text-slate-900">Henüz ürün eklemediniz</h2>
            <p className="mt-1 max-w-sm text-sm text-slate-500">
              Vitrininizde sergilemek istediğiniz ürün veya hizmetleri fotoğraf, fiyat ve stok
              bilgisiyle ekleyin.
            </p>
            <div className="mt-5">{addButton}</div>
          </div>
        ) : !visible.length ? (
          <div className="flex flex-col items-center rounded-3xl border border-slate-200 bg-white/70 px-6 py-12 text-center">
            <SearchX className="size-8 text-slate-400" aria-hidden />
            <p className="mt-3 text-sm font-semibold text-slate-800">
              Bu filtreye uyan ürün yok
            </p>
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setCategoryFilter(ALL_CATEGORIES);
              }}
              className="mt-4 inline-flex min-h-11 items-center rounded-full border border-slate-200 px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Filtreleri temizle
            </button>
          </div>
        ) : (
          <ul className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
            {visible.map((entry) => (
              <li key={entry.key} className="flex">
                <UrunCard
                  item={entry.item}
                  position={entry.position}
                  onEdit={() => setEditingKey(entry.key)}
                />
              </li>
            ))}
          </ul>
        )}
      </form>

      <AnimatePresence>
        {editingEntry && (
          <UrunEditPanel
            key={editingEntry.key}
            item={editingEntry.item}
            position={editingIndex + 1}
            categories={uniqueCategories(entries, editingEntry.key)}
            storeSlug={storeSlug}
            onChange={(next) => updateEntry(editingEntry.key, next)}
            onBusyChange={handleBusyChange}
            onRemove={() => removeEntry(editingEntry.key)}
            onClose={closePanel}
            onDone={handleDone}
            saveError={error ?? null}
          />
        )}
      </AnimatePresence>

      <StickySaveBar
        formId={formId}
        isDirty={isDirty}
        isPending={isPending}
        saveDisabled={!isDirty || isUploading}
        disabledReason={isUploading ? "Fotoğraflar yükleniyor, lütfen bekleyin…" : null}
        error={error}
        saved={saved}
        submitLabel="Ürünleri kaydet"
        pendingLabel="Kaydediliyor…"
        onCancel={handleCancel}
        collapseWhenClean
      />
    </>
  );
}
