"use client";

import {
  Camera,
  ChevronLeft,
  ChevronRight,
  Images,
  Star,
  X,
} from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ACCEPTED_PHOTO_TYPES,
  appendFilesToPhotoQueue,
  getPhotoQueueRemainingCapacity,
  MAX_PHOTO_QUEUE,
  movePhotoInQueue,
  normalizePhotoQueue,
  removePhotoAtIndex,
  setCoverPhotoIndex,
} from "@/lib/cihaz/cihaz-photo-slots";
import { validateImageFile } from "@/lib/supabase/upload-dukkan-image";
import { cn } from "@/lib/utils/cn";

type CihazPhotoUploaderProps = {
  photoUris: string[];
  listingType?: "new" | "used";
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
  onChange,
  disabled,
}: CihazPhotoUploaderProps) {
  const bulkInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const [validationError, setValidationError] = useState<string | null>(null);
  const [cameraSessionOpen, setCameraSessionOpen] = useState(false);
  const [sessionCaptureCount, setSessionCaptureCount] = useState(0);
  const [pendingCameraOpen, setPendingCameraOpen] = useState(false);
  const cameraSessionBootstrappedRef = useRef(false);

  const queue = useMemo(() => normalizePhotoQueue(photoUris), [photoUris]);
  const remainingCapacity = getPhotoQueueRemainingCapacity(queue);
  const canAddMore = remainingCapacity > 0;

  const emitQueue = useCallback(
    (next: string[]) => {
      onChange(normalizePhotoQueue(next));
    },
    [onChange]
  );

  const assignFiles = useCallback(
    (files: File[]) => {
      if (!files.length) return 0;

      const { valid, errors } = filterValidImageFiles(files);
      if (errors.length) {
        setValidationError(errors[0]);
      } else {
        setValidationError(null);
      }

      if (!valid.length) return 0;

      const result = appendFilesToPhotoQueue(queue, valid);
      emitQueue(result.next);

      if (result.skipped > 0) {
        setValidationError(
          `${result.assigned} fotoğraf eklendi. En fazla ${MAX_PHOTO_QUEUE} fotoğraf yükleyebilirsiniz.`
        );
      }

      requestAnimationFrame(() => {
        scrollRef.current?.scrollTo({
          left: scrollRef.current.scrollWidth,
          behavior: "smooth",
        });
      });

      return result.assigned;
    },
    [emitQueue, queue]
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
    if (!valid.length) return;

    const result = appendFilesToPhotoQueue(queue, valid);
    emitQueue(result.next);

    if (result.assigned > 0) {
      setSessionCaptureCount((count) => count + result.assigned);
    }

    if (result.skipped > 0) {
      setValidationError(
        `En fazla ${MAX_PHOTO_QUEUE} fotoğraf yükleyebilirsiniz.`
      );
    }

    if (cameraSessionOpen && result.next.length >= MAX_PHOTO_QUEUE) {
      finishCameraSession();
    }
  }

  function handleRemove(index: number) {
    emitQueue(removePhotoAtIndex(queue, index));
  }

  function handleMoveLeft(index: number) {
    if (index <= 0) return;
    emitQueue(movePhotoInQueue(queue, index, index - 1));
  }

  function handleMoveRight(index: number) {
    if (index >= queue.length - 1) return;
    emitQueue(movePhotoInQueue(queue, index, index + 1));
  }

  function handleSetCover(index: number) {
    if (index === 0) return;
    emitQueue(setCoverPhotoIndex(queue, index));
    scrollRef.current?.scrollTo({ left: 0, behavior: "smooth" });
  }

  return (
    <div className="space-y-4">
      <p className="text-xs leading-relaxed text-slate-500">
        En az bir fotoğraf yeterlidir. İlk sıradaki görsel{" "}
        <span className="font-medium text-slate-700">kapak fotoğrafı</span>{" "}
        olarak vitrinde gösterilir. En fazla {MAX_PHOTO_QUEUE} fotoğraf
        ekleyebilirsiniz.
      </p>

      {!disabled && (
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            disabled={!canAddMore}
            onClick={() => bulkInputRef.current?.click()}
            className="inline-flex min-h-10 items-center gap-2 rounded-full border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-emerald-300 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm"
          >
            <Images className="size-4 shrink-0" aria-hidden />
            Galeriden seç
          </button>

          <button
            type="button"
            disabled={!canAddMore}
            onClick={startCameraSession}
            className="inline-flex min-h-10 items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 text-xs font-semibold text-emerald-800 shadow-sm transition hover:border-emerald-300 hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm"
          >
            <Camera className="size-4 shrink-0" aria-hidden />
            Kamera ile çek
          </button>

          <span className="text-xs text-slate-400">
            {queue.length}/{MAX_PHOTO_QUEUE} fotoğraf
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
          if (event.target.files?.length) {
            assignFiles(Array.from(event.target.files));
          }
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

      <div
        ref={scrollRef}
        className={cn(
          "flex gap-3 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:thin]",
          "[&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-200"
        )}
      >
        {queue.length === 0 ? (
          <div className="flex h-36 min-w-[min(100%,280px)] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 px-6 text-center">
            <Images className="size-8 text-slate-300" aria-hidden />
            <p className="mt-2 text-sm font-medium text-slate-500">
              Henüz fotoğraf yok
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Galeriden seçin veya kamera ile çekin
            </p>
          </div>
        ) : (
          queue.map((uri, index) => (
            <div
              key={`${uri}-${index}`}
              className="group relative w-32 shrink-0 sm:w-36"
            >
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-slate-200/80 bg-slate-100 shadow-sm">
                <Image
                  src={uri}
                  alt={index === 0 ? "Kapak fotoğrafı" : `Fotoğraf ${index + 1}`}
                  fill
                  unoptimized
                  className="object-contain p-1.5"
                  sizes="144px"
                />

                {index === 0 && (
                  <span className="absolute bottom-2 left-2 inline-flex items-center rounded-full bg-slate-900/80 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur-sm">
                    Kapak
                  </span>
                )}

                {!disabled && (
                  <button
                    type="button"
                    onClick={() => handleRemove(index)}
                    className="absolute right-1.5 top-1.5 inline-flex size-7 items-center justify-center rounded-full bg-black/55 text-white opacity-100 transition hover:bg-black/75 sm:opacity-90"
                    aria-label={`Fotoğraf ${index + 1} kaldır`}
                  >
                    <X className="size-3.5" />
                  </button>
                )}
              </div>

              {!disabled && (
                <div className="mt-1.5 flex items-center justify-between gap-1">
                  <div className="flex gap-0.5">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => handleMoveLeft(index)}
                      className="inline-flex size-7 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:border-emerald-200 hover:text-emerald-700 disabled:opacity-30"
                      aria-label="Sola taşı"
                    >
                      <ChevronLeft className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={index === queue.length - 1}
                      onClick={() => handleMoveRight(index)}
                      className="inline-flex size-7 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:border-emerald-200 hover:text-emerald-700 disabled:opacity-30"
                      aria-label="Sağa taşı"
                    >
                      <ChevronRight className="size-3.5" />
                    </button>
                  </div>

                  {index !== 0 && (
                    <button
                      type="button"
                      onClick={() => handleSetCover(index)}
                      className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-semibold text-emerald-700 transition hover:bg-emerald-50"
                      title="Kapak fotoğrafı yap"
                    >
                      <Star className="size-3" aria-hidden />
                      Kapak yap
                    </button>
                  )}
                </div>
              )}
            </div>
          ))
        )}

        {!disabled && canAddMore && queue.length > 0 && (
          <button
            type="button"
            onClick={() => bulkInputRef.current?.click()}
            className="flex h-[calc(9rem+1.875rem)] w-28 shrink-0 flex-col items-center justify-center gap-2 self-start rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 text-slate-500 transition hover:border-emerald-300 hover:bg-emerald-50/50 hover:text-emerald-700 sm:h-[calc(6.75rem+1.875rem)] sm:w-32"
            aria-label="Daha fazla fotoğraf ekle"
          >
            <Images className="size-6" aria-hidden />
            <span className="text-[11px] font-semibold">Ekle</span>
          </button>
        )}
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
            </p>

            <p className="mt-4 text-sm font-medium text-emerald-700">
              Bu oturumda {sessionCaptureCount} fotoğraf eklendi
              {canAddMore
                ? ` · ${remainingCapacity} fotoğraf daha eklenebilir`
                : " · Limit doldu"}
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
