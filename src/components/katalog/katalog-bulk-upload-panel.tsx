"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { compressKatalogImages } from "@/lib/katalog/compress-katalog-image";
import { bulkCreateKatalogItems } from "@/lib/katalog/katalog-actions";
import { MAX_BULK_KATALOG_IMAGES } from "@/lib/katalog/katalog-constants";
import {
  fetchDeviceModelBrands,
  fetchDeviceModelsForBrand,
} from "@/lib/katalog/device-model-queries";
import { mergeUniqueSorted } from "@/lib/katalog/device-model-normalize";
import { uploadDukkanImage } from "@/lib/supabase/upload-dukkan-image";
import { cn } from "@/lib/utils/cn";

type UploadPreview = {
  id: string;
  file: File;
  previewUrl: string;
  status: "pending" | "compressing" | "uploading" | "done" | "error";
  uploadedUrl?: string;
  error?: string;
};

export function KatalogBulkUploadPanel({
  shopSlug,
  katalogHref,
}: {
  shopSlug: string;
  katalogHref: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [brand, setBrand] = useState("");
  const [modelName, setModelName] = useState("");
  const [productName, setProductName] = useState("");
  const [price, setPrice] = useState("");
  const [brands, setBrands] = useState<string[]>([]);
  const [models, setModels] = useState<string[]>([]);
  const [brandsLoading, setBrandsLoading] = useState(true);
  const [modelsLoading, setModelsLoading] = useState(false);
  const [previews, setPreviews] = useState<UploadPreview[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadBrands() {
      setBrandsLoading(true);
      try {
        const remoteBrands = await fetchDeviceModelBrands();
        if (!cancelled) setBrands(remoteBrands);
      } finally {
        if (!cancelled) setBrandsLoading(false);
      }
    }

    void loadBrands();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!brand) {
      setModels([]);
      return;
    }

    let cancelled = false;

    async function loadModels() {
      setModelsLoading(true);
      try {
        const remoteModels = await fetchDeviceModelsForBrand(brand);
        if (!cancelled) setModels(remoteModels);
      } finally {
        if (!cancelled) setModelsLoading(false);
      }
    }

    void loadModels();
    return () => {
      cancelled = true;
    };
  }, [brand]);

  useEffect(() => {
    return () => {
      for (const preview of previews) {
        URL.revokeObjectURL(preview.previewUrl);
      }
    };
  }, [previews]);

  const doneCount = previews.filter((item) => item.status === "done").length;
  const isUploading = previews.some(
    (item) =>
      item.status === "pending" ||
      item.status === "compressing" ||
      item.status === "uploading"
  );
  const canSubmit =
    brand.trim() &&
    modelName.trim() &&
    doneCount > 0 &&
    !isSubmitting &&
    !isUploading;

  async function handleFiles(fileList: FileList | null) {
    if (!fileList?.length) return;

    setError(null);
    setMessage(null);

    const remaining = MAX_BULK_KATALOG_IMAGES - previews.length;
    if (remaining <= 0) {
      setError(`Tek seferde en fazla ${MAX_BULK_KATALOG_IMAGES} görsel seçebilirsiniz.`);
      return;
    }

    const selected = Array.from(fileList).slice(0, remaining);
    const nextPreviews: UploadPreview[] = selected.map((file) => ({
      id: crypto.randomUUID(),
      file,
      previewUrl: URL.createObjectURL(file),
      status: "pending",
    }));

    setPreviews((current) => [...current, ...nextPreviews]);

    for (const preview of nextPreviews) {
      setPreviews((current) =>
        current.map((item) =>
          item.id === preview.id ? { ...item, status: "compressing" } : item
        )
      );

      try {
        const [compressed] = await compressKatalogImages([preview.file]);

        setPreviews((current) =>
          current.map((item) =>
            item.id === preview.id ? { ...item, status: "uploading" } : item
          )
        );

        const uploadResult = await uploadDukkanImage(compressed, shopSlug, "katalog");

        if ("error" in uploadResult) {
          setPreviews((current) =>
            current.map((item) =>
              item.id === preview.id
                ? { ...item, status: "error", error: uploadResult.error }
                : item
            )
          );
          continue;
        }

        setPreviews((current) =>
          current.map((item) =>
            item.id === preview.id
              ? {
                  ...item,
                  status: "done",
                  uploadedUrl: uploadResult.url,
                }
              : item
          )
        );
      } catch (uploadError) {
        setPreviews((current) =>
          current.map((item) =>
            item.id === preview.id
              ? {
                  ...item,
                  status: "error",
                  error:
                    uploadError instanceof Error
                      ? uploadError.message
                      : "Yükleme başarısız.",
                }
              : item
          )
        );
      }
    }
  }

  function removePreview(id: string) {
    setPreviews((current) => {
      const target = current.find((item) => item.id === id);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return current.filter((item) => item.id !== id);
    });
  }

  async function handleSubmit() {
    if (!canSubmit) return;

    setIsSubmitting(true);
    setError(null);
    setMessage(null);

    const uploadedItems = previews
      .filter((item) => item.status === "done" && item.uploadedUrl)
      .map((item) => ({
        image_url: item.uploadedUrl!,
        brand: brand.trim(),
        model_name: modelName.trim(),
      }));

    const parsedPrice = price.trim() ? Number(price.replace(",", ".")) : null;

    const result = await bulkCreateKatalogItems(
      shopSlug,
      brand,
      modelName,
      uploadedItems,
      {
        productName: productName.trim() || null,
        price: parsedPrice != null && !Number.isNaN(parsedPrice) ? parsedPrice : null,
      }
    );

    setIsSubmitting(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    setMessage(`${result.count ?? uploadedItems.length} görsel kataloğa eklendi.`);

    for (const preview of previews) {
      URL.revokeObjectURL(preview.previewUrl);
    }
    setPreviews([]);
    setProductName("");
    setPrice("");
  }

  const brandOptions = useMemo(
    () => mergeUniqueSorted([...brands, brand.trim()].filter(Boolean)),
    [brands, brand]
  );

  const modelOptions = useMemo(
    () => mergeUniqueSorted([...models, modelName.trim()].filter(Boolean)),
    [models, modelName]
  );

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-lg font-bold text-slate-900">Toplu Ürün Ekle</h2>
        <p className="mt-1 text-sm text-slate-500">
          Aynı marka ve modele ait {MAX_BULK_KATALOG_IMAGES} görsele kadar seçin. Görseller
          yüklemeden önce otomatik sıkıştırılır.
        </p>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <Field label="Marka">
            <input
              list="katalog-brand-options"
              value={brand}
              onChange={(event) => {
                setBrand(event.target.value);
                setModelName("");
              }}
              disabled={brandsLoading || isSubmitting}
              placeholder={brandsLoading ? "Markalar yükleniyor…" : "Örn. Samsung"}
              className={inputClassName}
            />
            <datalist id="katalog-brand-options">
              {brandOptions.map((item) => (
                <option key={item} value={item} />
              ))}
            </datalist>
          </Field>

          <Field label="Model">
            <input
              list="katalog-model-options"
              value={modelName}
              onChange={(event) => setModelName(event.target.value)}
              disabled={!brand.trim() || modelsLoading || isSubmitting}
              placeholder={
                !brand.trim()
                  ? "Önce marka seçin"
                  : modelsLoading
                    ? "Modeller yükleniyor…"
                    : "Örn. Galaxy S24"
              }
              className={inputClassName}
            />
            <datalist id="katalog-model-options">
              {modelOptions.map((item) => (
                <option key={item} value={item} />
              ))}
            </datalist>
          </Field>

          <Field label="Ürün adı (isteğe bağlı)">
            <input
              value={productName}
              onChange={(event) => setProductName(event.target.value)}
              disabled={isSubmitting}
              placeholder="Örn. Silikon Kılıf"
              className={inputClassName}
            />
          </Field>

          <Field label="Fiyat (isteğe bağlı)">
            <input
              value={price}
              onChange={(event) => setPrice(event.target.value)}
              disabled={isSubmitting}
              inputMode="decimal"
              placeholder="Örn. 299"
              className={inputClassName}
            />
          </Field>
        </div>
      </div>

      <div
        className={cn(
          "rounded-2xl border-2 border-dashed p-6 text-center transition",
          previews.length >= MAX_BULK_KATALOG_IMAGES
            ? "border-slate-200 bg-slate-50"
            : "border-emerald-200 bg-emerald-50/40 hover:border-emerald-300"
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(event) => {
            void handleFiles(event.target.files);
            event.target.value = "";
          }}
        />

        <p className="text-sm font-semibold text-slate-800">
          Görselleri sürükleyip bırakın veya dosya seçin
        </p>
        <p className="mt-1 text-xs text-slate-500">
          {previews.length}/{MAX_BULK_KATALOG_IMAGES} görsel · Otomatik sıkıştırma aktif
        </p>

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={previews.length >= MAX_BULK_KATALOG_IMAGES || isSubmitting}
          className="mt-4 inline-flex min-h-11 items-center justify-center rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Görsel Seç
        </button>
      </div>

      {previews.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {previews.map((preview) => (
            <div
              key={preview.id}
              className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
            >
              <div className="relative aspect-square bg-slate-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={preview.previewUrl}
                  alt=""
                  className="h-full w-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => removePreview(preview.id)}
                  className="absolute right-2 top-2 rounded-full bg-slate-900/75 px-2 py-1 text-[10px] font-semibold text-white"
                >
                  Kaldır
                </button>
              </div>
              <div className="px-3 py-2 text-xs font-medium text-slate-600">
                {preview.status === "pending" && "Bekliyor"}
                {preview.status === "compressing" && "Sıkıştırılıyor…"}
                {preview.status === "uploading" && "Yükleniyor…"}
                {preview.status === "done" && "Hazır"}
                {preview.status === "error" && (preview.error ?? "Hata")}
              </div>
            </div>
          ))}
        </div>
      )}

      {error && (
        <p className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </p>
      )}

      {message && (
        <p className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {message}
        </p>
      )}

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => void handleSubmit()}
          disabled={!canSubmit}
          className="inline-flex min-h-11 items-center justify-center rounded-full bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? "Kaydediliyor…" : `Kataloğa Ekle (${doneCount})`}
        </button>

        <Link
          href={katalogHref}
          className="inline-flex min-h-11 items-center justify-center rounded-full border border-slate-200 bg-white px-6 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-emerald-300 hover:text-emerald-700"
        >
          Vitrin Kataloğunu Gör
        </Link>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block min-w-0">
      <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </span>
      {children}
    </label>
  );
}

const inputClassName =
  "h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-800 shadow-sm outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 sm:h-12 sm:px-4";
