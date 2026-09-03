"use client";

import { useEffect, useState } from "react";
import { X, ZoomIn } from "lucide-react";
import type { ServiceDevicePhoto } from "@/lib/servis/servis-yonetim-utils";
import { cn } from "@/lib/utils/cn";

type TechnicalServicePhotoGalleryProps = {
  photos: ServiceDevicePhoto[];
};

export function TechnicalServicePhotoGallery({
  photos,
}: TechnicalServicePhotoGalleryProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewLabel, setPreviewLabel] = useState("");

  useEffect(() => {
    if (!previewUrl) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setPreviewUrl(null);
    }

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [previewUrl]);

  if (photos.length === 0) {
    return (
      <p className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-500">
        Teslim alım sırasında fotoğraf yüklenmemiş.
      </p>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {photos.map((photo) => (
          <button
            key={`${photo.label}-${photo.url}`}
            type="button"
            onClick={() => {
              setPreviewUrl(photo.url);
              setPreviewLabel(photo.label);
            }}
            className="group relative overflow-hidden rounded-xl border border-slate-200 bg-slate-50 text-left"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photo.url}
              alt={`Cihaz fotoğrafı — ${photo.label}`}
              className="aspect-[4/3] w-full object-cover transition group-hover:scale-[1.02]"
            />
            <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-900/70 to-transparent px-2.5 py-2 text-xs font-semibold text-white">
              {photo.label}
            </span>
            <span className="absolute right-2 top-2 inline-flex size-8 items-center justify-center rounded-full bg-white/90 text-slate-700 opacity-0 shadow transition group-hover:opacity-100">
              <ZoomIn className="size-4" aria-hidden />
            </span>
          </button>
        ))}
      </div>

      {previewUrl && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/80 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label="Fotoğraf önizleme"
          onClick={() => setPreviewUrl(null)}
        >
          <div
            className="relative max-h-[90vh] max-w-5xl"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setPreviewUrl(null)}
              className="absolute -right-2 -top-2 z-10 inline-flex size-10 items-center justify-center rounded-full bg-white text-slate-700 shadow-lg"
              aria-label="Kapat"
            >
              <X className="size-5" />
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewUrl}
              alt={previewLabel}
              className={cn(
                "max-h-[85vh] w-auto max-w-full rounded-2xl object-contain shadow-2xl"
              )}
            />
            {previewLabel && (
              <p className="mt-3 text-center text-sm font-medium text-white">
                {previewLabel}
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
