"use client";

import { useRef, useState } from "react";
import { Field } from "@/components/ui/field";
import { uploadDukkanImage } from "@/lib/supabase/upload-dukkan-image";
import { cn } from "@/lib/utils/cn";

type ImageUploadBoxProps = {
  label: string;
  hint?: string;
  name: string;
  value: string;
  onChange: (url: string) => void;
  subfolder: string;
  variant: "logo" | "banner";
};

export function ImageUploadBox({
  label,
  hint,
  name,
  value,
  onChange,
  subfolder,
  variant,
}: ImageUploadBoxProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isLogo = variant === "logo";

  async function handleFileChange(file: File | undefined) {
    if (!file) return;

    setLoading(true);
    setError(null);

    const result = await uploadDukkanImage(file, subfolder);

    setLoading(false);

    if ("error" in result) {
      setError(result.error);
      return;
    }

    onChange(result.url);
  }

  const box = (
    <div
      className={cn(
        "group relative shrink-0 overflow-hidden border border-dashed border-slate-200 bg-slate-50/80",
        isLogo
          ? "size-[120px] rounded-full"
          : "aspect-[16/9] w-full rounded-2xl"
      )}
    >
      {value ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={value}
          alt={label}
          className="h-full w-full object-cover"
        />
      ) : (
        <div
          className={cn(
            "flex h-full flex-col items-center justify-center gap-1.5 px-3 text-center text-slate-400",
            isLogo ? "text-[10px]" : "text-xs"
          )}
        >
          <svg
            className={cn("text-slate-300", isLogo ? "size-6" : "size-8")}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
            aria-hidden
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z"
            />
          </svg>
          {!isLogo && <span>Görsel seçin</span>}
        </div>
      )}

      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/85 backdrop-blur-sm">
          <span
            className={cn(
              "rounded-full bg-slate-900 font-medium text-white",
              isLogo ? "px-2 py-1 text-[10px]" : "px-3 py-1.5 text-xs"
            )}
          >
            Yükleniyor…
          </span>
        </div>
      )}

      {isLogo ? (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={loading}
          aria-label={value ? "Logoyu değiştir" : "Logo yükle"}
          className="absolute inset-0 flex items-end justify-center bg-gradient-to-t from-black/45 via-transparent to-transparent pb-2 opacity-100 transition group-hover:from-black/55 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-within:opacity-100"
        >
          <span className="min-h-8 rounded-full bg-white/95 px-3 py-1.5 text-[11px] font-medium text-slate-900">
            {value ? "Değiştir" : "Yükle"}
          </span>
        </button>
      ) : (
        <div className="absolute inset-x-0 bottom-0 flex flex-wrap gap-2 bg-gradient-to-t from-black/50 to-transparent p-3">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={loading}
            className="min-h-11 rounded-full bg-white/95 px-4 py-2 text-sm font-medium text-slate-900 transition hover:bg-white disabled:opacity-60"
          >
            {value ? "Değiştir" : "Yükle"}
          </button>
          {value && !loading && (
            <button
              type="button"
              onClick={() => onChange("")}
              className="min-h-11 rounded-full bg-white/20 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm transition hover:bg-white/30"
            >
              Kaldır
            </button>
          )}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          void handleFileChange(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
    </div>
  );

  if (isLogo) {
    return (
      <Field label={label} hint={hint}>
        <input type="hidden" name={name} value={value} />
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {box}
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={loading}
              className="min-h-11 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-emerald-300 hover:text-emerald-600 disabled:opacity-50"
            >
              {value ? "Logoyu Değiştir" : "Logo Yükle"}
            </button>
            {value && !loading && (
              <button
                type="button"
                onClick={() => onChange("")}
                className="min-h-11 rounded-full px-4 py-2 text-sm font-medium text-slate-400 transition hover:text-red-600"
              >
                Kaldır
              </button>
            )}
          </div>
        </div>
        {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
      </Field>
    );
  }

  return (
    <Field label={label} hint={hint}>
      <input type="hidden" name={name} value={value} />
      {box}
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
    </Field>
  );
}
