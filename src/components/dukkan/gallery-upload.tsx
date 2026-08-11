"use client";

import { useRef, useState } from "react";
import { uploadDukkanImage } from "@/lib/supabase/upload-dukkan-image";
import { MAX_GALLERY_PHOTOS } from "@/lib/supabase/storage.constants";

export function GalleryUpload({
  values,
  onChange,
  storeSlug,
  hideHeader = false,
}: {
  values: string[];
  onChange: (urls: string[]) => void;
  storeSlug: string;
  hideHeader?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return;

    const remaining = MAX_GALLERY_PHOTOS - values.length;
    if (remaining <= 0) {
      setError(`En fazla ${MAX_GALLERY_PHOTOS} fotoğraf ekleyebilirsiniz.`);
      return;
    }

    setLoading(true);
    setError(null);

    const nextUrls = [...values];
    const selected = Array.from(files).slice(0, remaining);

    for (const file of selected) {
      const result = await uploadDukkanImage(file, storeSlug, "galeri");
      if ("error" in result) {
        setError(result.error);
        break;
      }
      nextUrls.push(result.url);
    }

    onChange(nextUrls);
    setLoading(false);
  }

  return (
    <div className="min-w-0 max-w-full">
      {!hideHeader && (
        <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-500">
            Hakkımızda sayfasında 2&apos;li yatay grid ({values.length}/
            {MAX_GALLERY_PHOTOS})
          </p>
          {values.length < MAX_GALLERY_PHOTOS && (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={loading}
              className="min-h-9 w-full shrink-0 rounded-full border border-slate-200 bg-white px-4 py-1.5 text-sm font-medium text-emerald-600 transition hover:border-emerald-300 hover:bg-emerald-50 disabled:opacity-50 sm:w-auto"
            >
              + Fotoğraf Ekle
            </button>
          )}
        </div>
      )}

      {values.map((url, index) => (
        <input
          key={`${url}-${index}`}
          type="hidden"
          name={`dukkan_fotografi_${index}`}
          value={url}
        />
      ))}

      <div className="grid max-w-2xl grid-cols-2 gap-2.5 sm:gap-3">
        {values.map((url, index) => (
          <div
            key={url}
            className="group relative aspect-square w-full overflow-hidden rounded-xl border border-slate-200/80 bg-slate-50"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={url}
              alt={`Hakkımızda ${index + 1}`}
              className="h-full w-full object-cover object-center"
            />
            <button
              type="button"
              onClick={() => onChange(values.filter((_, i) => i !== index))}
              className="absolute right-1.5 top-1.5 min-h-7 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-medium text-white sm:opacity-0 sm:transition sm:group-hover:opacity-100"
            >
              Sil
            </button>
          </div>
        ))}

        {values.length < MAX_GALLERY_PHOTOS && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={loading}
            className="flex aspect-square w-full flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 text-xs text-slate-400 transition hover:border-emerald-300 hover:text-emerald-600 disabled:opacity-50"
          >
            {loading ? "…" : "+ Ekle"}
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          void handleFiles(e.target.files);
          e.target.value = "";
        }}
      />

      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
    </div>
  );
}
