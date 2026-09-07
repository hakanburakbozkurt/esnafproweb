"use client";

import { ImagePlus, X } from "lucide-react";
import Image from "next/image";
import { useRef } from "react";
import {
  PHOTO_LABELS,
  PRODUCT_PHOTO_INDICES,
  USED_MODE_PHOTO_INDICES,
} from "@/lib/cihaz/cihaz-photo-slots";
import { cn } from "@/lib/utils/cn";

type CihazPhotoUploaderProps = {
  photoUris: string[];
  listingType: "new" | "used";
  onChange: (photoUris: string[]) => void;
  disabled?: boolean;
};

function getVisibleIndices(listingType: "new" | "used"): readonly number[] {
  return listingType === "new" ? PRODUCT_PHOTO_INDICES : USED_MODE_PHOTO_INDICES;
}

export function CihazPhotoUploader({
  photoUris,
  listingType,
  onChange,
  disabled,
}: CihazPhotoUploaderProps) {
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const visibleIndices = getVisibleIndices(listingType);

  function setSlotUri(index: number, uri: string | null) {
    const next = [...photoUris];
    while (next.length <= index) next.push("");
    next[index] = uri ?? "";
    onChange(next);
  }

  function handleFileChange(index: number, file: File | undefined) {
    if (!file) return;
    const objectUrl = URL.createObjectURL(file);
    setSlotUri(index, objectUrl);
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-slate-500">
        {listingType === "new"
          ? "Vitrin için cihaz görselleri yükleyin (ön, arka, ekran, diğer)."
          : "Cihaz ve hasar fotoğrafları yükleyin. Kimlik ve fatura alanları isteğe bağlıdır."}
      </p>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {visibleIndices.map((index) => {
          const uri = photoUris[index]?.trim() ?? "";
          const label = PHOTO_LABELS[index] ?? `Foto ${index + 1}`;

          return (
            <div
              key={index}
              className="relative overflow-hidden rounded-2xl border border-dashed border-slate-200 bg-slate-50/80"
            >
              <input
                ref={(el) => {
                  inputRefs.current[index] = el;
                }}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="sr-only"
                disabled={disabled}
                onChange={(event) => {
                  handleFileChange(index, event.target.files?.[0]);
                  event.target.value = "";
                }}
              />

              {uri ? (
                <div className="relative aspect-[4/3]">
                  <Image
                    src={uri}
                    alt={label}
                    fill
                    unoptimized
                    className="object-cover"
                    sizes="(max-width: 640px) 50vw, 200px"
                  />
                  {!disabled && (
                    <button
                      type="button"
                      onClick={() => setSlotUri(index, null)}
                      className="absolute right-2 top-2 inline-flex size-8 items-center justify-center rounded-full bg-black/60 text-white transition hover:bg-black/80"
                      aria-label={`${label} kaldır`}
                    >
                      <X className="size-4" />
                    </button>
                  )}
                </div>
              ) : (
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => inputRefs.current[index]?.click()}
                  className={cn(
                    "flex aspect-[4/3] w-full flex-col items-center justify-center gap-2 px-3 text-center transition",
                    disabled
                      ? "cursor-not-allowed opacity-50"
                      : "hover:bg-emerald-50/60"
                  )}
                >
                  <ImagePlus className="size-6 text-emerald-600" aria-hidden />
                  <span className="text-xs font-medium text-slate-600">
                    {label}
                  </span>
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
