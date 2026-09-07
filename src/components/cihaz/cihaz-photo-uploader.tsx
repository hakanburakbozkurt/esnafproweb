"use client";

import { Camera, ImagePlus, Images, X } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ACCEPTED_PHOTO_TYPES,
  fillPhotoSlotsFromFiles,
  getEmptyVisibleSlotIndices,
  getVisiblePhotoIndices,
  PHOTO_LABELS,
  clearPhotoSlot,
} from "@/lib/cihaz/cihaz-photo-slots";
import { validateImageFile } from "@/lib/supabase/upload-dukkan-image";
import { cn } from "@/lib/utils/cn";

type CihazPhotoUploaderProps = {
  photoUris: string[];
  listingType: "new" | "used";
  onChange: (photoUris: string[]) => void;
  disabled?: boolean;
};

function filterValidImageFiles(files: FileList | File[]): {
  valid: File[];
  errors: string[];
} {
  const list = Array.from(files);
  const valid: File[] = [];
  const errors: string[] = [];

  for (const file of list) {
    const error = validateImageFile(file);
    if (error) {
      errors.push(`${file.name}: ${error}`);
    } else {
      valid.push(file);
    }
  }

  return { valid, errors };
}

export function CihazPhotoUploader({
  photoUris,
  listingType,
  onChange,
  disabled,
}: CihazPhotoUploaderProps) {
  const slotInputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const bulkInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);

  const [validationError, setValidationError] = useState<string | null>(null);
  const [cameraSessionOpen, setCameraSessionOpen] = useState(false);
  const [sessionCaptureCount, setSessionCaptureCount] = useState(0);
  const [pendingCameraOpen, setPendingCameraOpen] = useState(false);
  const cameraSessionBootstrappedRef = useRef(false);

  const visibleIndices = getVisiblePhotoIndices(listingType);
  const emptySlotCount = getEmptyVisibleSlotIndices(photoUris, visibleIndices).length;
  const filledCount = visibleIndices.filter((i) => photoUris[i]?.trim()).length;
  const canAddMore = emptySlotCount > 0;

  const assignFiles = useCallback(
    (files: File[], startAtIndex?: number) => {
      if (!files.length) return;

      const { valid, errors } = filterValidImageFiles(files);
      if (errors.length) {
        setValidationError(errors[0]);
      } else {
        setValidationError(null);
      }

      if (!valid.length) return;

      const result = fillPhotoSlotsFromFiles(photoUris, visibleIndices, valid, {
        startAtIndex: startAtIndex,
      });

      onChange(result.next);

      if (result.skipped > 0) {
        setValidationError(
          `${result.assigned} fotoğraf eklendi. ${result.skipped} fotoğraf slot limiti nedeniyle eklenemedi.`
        );
      }

      return result.assigned;
    },
    [onChange, photoUris, visibleIndices]
  );

  const triggerCameraCapture = useCallback(() => {
    if (disabled || !canAddMore) return;
    setPendingCameraOpen(true);
    window.requestAnimationFrame(() => {
      cameraInputRef.current?.click();
      setPendingCameraOpen(false);
    });
  }, [canAddMore, disabled]);

  const startCameraSession = useCallback(() => {
    if (disabled || !canAddMore) return;
    setValidationError(null);
    setSessionCaptureCount(0);
    setCameraSessionOpen(true);
  }, [canAddMore, disabled]);

  useEffect(() => {
    if (!cameraSessionOpen) {
      cameraSessionBootstrappedRef.current = false;
      return;
    }

    if (cameraSessionBootstrappedRef.current || !canAddMore) return;

    cameraSessionBootstrappedRef.current = true;
    triggerCameraCapture();
  }, [cameraSessionOpen, canAddMore, triggerCameraCapture]);

  function finishCameraSession() {
    setCameraSessionOpen(false);
    setSessionCaptureCount(0);
  }

  function handleCameraFile(file: File | undefined) {
    if (!file) return;

    const { valid, errors } = filterValidImageFiles([file]);
    if (errors.length) {
      setValidationError(errors[0]);
      return;
    }

    setValidationError(null);

    const emptyBefore = getEmptyVisibleSlotIndices(photoUris, visibleIndices);
    const startAt = emptyBefore[0];
    if (startAt === undefined) {
      finishCameraSession();
      return;
    }

    const result = fillPhotoSlotsFromFiles(photoUris, visibleIndices, valid, {
      startAtIndex: startAt,
    });
    onChange(result.next);

    if (result.assigned > 0) {
      setSessionCaptureCount((count) => count + result.assigned);
    }

    const remaining = getEmptyVisibleSlotIndices(result.next, visibleIndices).length;
    if (cameraSessionOpen && remaining === 0) {
      finishCameraSession();
    }
  }

  function handleBulkFiles(files: FileList | null, startAtIndex?: number) {
    if (!files?.length) return;
    assignFiles(Array.from(files), startAtIndex);
  }

  function setSlotUri(index: number, uri: string | null) {
    if (uri) {
      const next = [...photoUris];
      while (next.length <= index) next.push("");
      next[index] = uri;
      onChange(next);
      return;
    }
    onChange(clearPhotoSlot(photoUris, index));
  }

  function handleSlotFiles(index: number, files: FileList | null) {
    if (!files?.length) return;

    if (files.length === 1 && !photoUris[index]?.trim()) {
      const { valid, errors } = filterValidImageFiles([files[0]]);
      if (errors.length) {
        setValidationError(errors[0]);
        return;
      }
      setValidationError(null);
      setSlotUri(index, URL.createObjectURL(valid[0]));
      return;
    }

    handleBulkFiles(files, index);
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-slate-500">
        {listingType === "new"
          ? "Vitrin için cihaz görselleri yükleyin. Tek fotoğrafla kaydedebilir veya galeriden çoklu seçim / kamera ile art arda çekim yapabilirsiniz."
          : "Cihaz fotoğrafları isteğe bağlıdır; tek görsel yeterlidir. Galeriden çoklu seçim veya kamera ile art arda çekim desteklenir."}
      </p>

      {!disabled && (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={!canAddMore}
            onClick={() => bulkInputRef.current?.click()}
            className="inline-flex min-h-10 items-center gap-2 rounded-full border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-700 transition hover:border-emerald-300 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm"
          >
            <Images className="size-4 shrink-0" aria-hidden />
            Galeriden seç
          </button>

          <button
            type="button"
            disabled={!canAddMore}
            onClick={startCameraSession}
            className="inline-flex min-h-10 items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 text-xs font-semibold text-emerald-800 transition hover:border-emerald-300 hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm"
          >
            <Camera className="size-4 shrink-0" aria-hidden />
            Kamera ile çek
          </button>

          <span className="inline-flex min-h-10 items-center text-xs text-slate-400">
            {filledCount}/{visibleIndices.length} slot dolu
          </span>
        </div>
      )}

      <input
        ref={bulkInputRef}
        type="file"
        accept={ACCEPTED_PHOTO_TYPES}
        multiple
        className="sr-only"
        disabled={disabled}
        onChange={(event) => {
          handleBulkFiles(event.target.files);
          event.target.value = "";
        }}
      />

      <input
        ref={cameraInputRef}
        type="file"
        accept={ACCEPTED_PHOTO_TYPES}
        capture="environment"
        className="sr-only"
        disabled={disabled || pendingCameraOpen}
        onChange={(event) => {
          handleCameraFile(event.target.files?.[0]);
          event.target.value = "";
        }}
      />

      {validationError && (
        <p role="alert" className="text-xs text-amber-700">
          {validationError}
        </p>
      )}

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
                  slotInputRefs.current[index] = el;
                }}
                type="file"
                accept={ACCEPTED_PHOTO_TYPES}
                multiple
                className="sr-only"
                disabled={disabled}
                onChange={(event) => {
                  handleSlotFiles(index, event.target.files);
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
                    className="object-contain p-1"
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
                  onClick={() => slotInputRefs.current[index]?.click()}
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

      {cameraSessionOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 p-4 sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="camera-session-title"
        >
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-xl">
            <h3
              id="camera-session-title"
              className="text-base font-semibold text-slate-900"
            >
              Kamera ile fotoğraf ekle
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              Her çekimden sonra yeni fotoğraf ekleyebilir veya{" "}
              <strong>Tamam</strong> ile istediğiniz zaman bitirebilirsiniz.
              Tek fotoğrafla kaydetmek yeterlidir.
            </p>

            <p className="mt-4 text-sm font-medium text-emerald-700">
              Bu oturumda {sessionCaptureCount} fotoğraf eklendi
              {canAddMore
                ? ` · ${emptySlotCount} boş slot kaldı`
                : " · Tüm slotlar dolu"}
            </p>

            <div className="mt-5 flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                disabled={!canAddMore || pendingCameraOpen}
                onClick={triggerCameraCapture}
                className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full bg-emerald-600 px-4 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Camera className="size-4" aria-hidden />
                Bir fotoğraf daha
              </button>
              <button
                type="button"
                onClick={finishCameraSession}
                className="inline-flex min-h-11 flex-1 items-center justify-center rounded-full border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Tamam
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
