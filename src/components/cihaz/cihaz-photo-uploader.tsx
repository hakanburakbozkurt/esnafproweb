"use client";

import {
  Camera,
  CheckSquare,
  Images,
  Loader2,
  Square,
  Trash2,
  X,
} from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { compressCihazImage } from "@/lib/cihaz/compress-cihaz-image";
import {
  ACCEPTED_PHOTO_TYPES,
  appendFilesToPhotoQueue,
  clearPhotoQueue,
  getPhotoQueueRemainingCapacity,
  MAX_PHOTO_QUEUE,
  normalizePhotoQueue,
  removePhotoAtIndex,
  removePhotosAtIndices,
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

type ProcessingState = {
  current: number;
  total: number;
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
  const [processing, setProcessing] = useState<ProcessingState | null>(null);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());
  const cameraSessionBootstrappedRef = useRef(false);

  const queue = useMemo(() => normalizePhotoQueue(photoUris), [photoUris]);
  const remainingCapacity = getPhotoQueueRemainingCapacity(queue);
  const canAddMore = remainingCapacity > 0;
  const isBusy = processing !== null;

  const emitQueue = useCallback(
    (next: string[]) => {
      onChange(normalizePhotoQueue(next));
    },
    [onChange]
  );

  const compressAndAppend = useCallback(
    async (files: File[]) => {
      if (!files.length) return { assigned: 0, total: queue.length };

      const capacity = getPhotoQueueRemainingCapacity(queue);
      const batch = files.slice(0, capacity);
      if (!batch.length) return { assigned: 0, total: queue.length };

      setProcessing({ current: 0, total: batch.length });

      const compressed: File[] = [];
      for (let i = 0; i < batch.length; i++) {
        setProcessing({ current: i + 1, total: batch.length });
        compressed.push(await compressCihazImage(batch[i]));
      }

      const result = appendFilesToPhotoQueue(queue, compressed);
      emitQueue(result.next);
      setProcessing(null);

      if (result.skipped > 0 || files.length > batch.length) {
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

      return { assigned: result.assigned, total: result.next.length };
    },
    [emitQueue, queue]
  );

  const assignFiles = useCallback(
    async (files: File[]) => {
      if (!files.length || isBusy) return;

      const { valid, errors } = filterValidImageFiles(files);
      if (errors.length) {
        setValidationError(errors[0]);
      } else {
        setValidationError(null);
      }

      if (!valid.length) return;

      await compressAndAppend(valid);
    },
    [compressAndAppend, isBusy]
  );

  const triggerCameraCapture = useCallback(() => {
    if (disabled || !canAddMore || isBusy) return;
    setPendingCameraOpen(true);
    window.requestAnimationFrame(() => {
      cameraInputRef.current?.click();
      setPendingCameraOpen(false);
    });
  }, [canAddMore, disabled, isBusy]);

  const startCameraSession = useCallback(() => {
    if (disabled || !canAddMore || isBusy) return;
    setValidationError(null);
    setSessionCaptureCount(0);
    setCameraSessionOpen(true);
  }, [canAddMore, disabled, isBusy]);

  useEffect(() => {
    if (!cameraSessionOpen) {
      cameraSessionBootstrappedRef.current = false;
      return;
    }

    if (cameraSessionBootstrappedRef.current || !canAddMore) return;

    cameraSessionBootstrappedRef.current = true;
    triggerCameraCapture();
  }, [cameraSessionOpen, canAddMore, triggerCameraCapture]);

  useEffect(() => {
    if (selectionMode && queue.length === 0) {
      setSelectionMode(false);
      setSelectedIndices(new Set());
    }
  }, [queue.length, selectionMode]);

  function finishCameraSession() {
    setCameraSessionOpen(false);
    setSessionCaptureCount(0);
  }

  async function handleCameraFile(file: File | undefined) {
    if (!file) return;

    const { valid, errors } = filterValidImageFiles([file]);
    if (errors.length) {
      setValidationError(errors[0]);
      return;
    }
    if (!valid.length) return;

    const result = await compressAndAppend(valid);
    if (result.assigned > 0) {
      setSessionCaptureCount((count) => count + result.assigned);
    }

    if (cameraSessionOpen && result.total >= MAX_PHOTO_QUEUE) {
      finishCameraSession();
    }
  }

  function handleRemove(index: number) {
    emitQueue(removePhotoAtIndex(queue, index));
    setSelectedIndices((prev) => {
      const next = new Set<number>();
      for (const i of prev) {
        if (i < index) next.add(i);
        else if (i > index) next.add(i - 1);
      }
      return next;
    });
  }

  function handleSetCover(index: number) {
    if (index === 0) return;
    emitQueue(setCoverPhotoIndex(queue, index));
  }

  function toggleSelection(index: number) {
    setSelectedIndices((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }

  function handleBulkDeleteSelected() {
    if (!selectedIndices.size) return;
    emitQueue(removePhotosAtIndices(queue, [...selectedIndices]));
    setSelectedIndices(new Set());
    setSelectionMode(false);
    setValidationError(null);
  }

  function handleClearAll() {
    if (
      queue.length > 0 &&
      !window.confirm("Tüm fotoğraflar kaldırılacak. Emin misiniz?")
    ) {
      return;
    }
    emitQueue(clearPhotoQueue(queue));
    setSelectedIndices(new Set());
    setSelectionMode(false);
    setValidationError(null);
  }

  function selectAll() {
    setSelectedIndices(new Set(queue.map((_, index) => index)));
  }

  return (
    <div className="space-y-4">
      <p className="text-xs leading-relaxed text-slate-500">
        En az bir fotoğraf yeterlidir. İlk sıradaki görsel{" "}
        <span className="font-medium text-slate-700">kapak fotoğrafı</span>{" "}
        olarak vitrinde gösterilir. Toplu seçimle 20–30 fotoğraf ekleyebilirsiniz
        (en fazla {MAX_PHOTO_QUEUE}). Görseller yüklemeden önce otomatik
        sıkıştırılır.
      </p>

      {!disabled && (
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            disabled={!canAddMore || isBusy}
            onClick={() => bulkInputRef.current?.click()}
            className="inline-flex min-h-10 items-center gap-2 rounded-full border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-emerald-300 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm"
          >
            {isBusy ? (
              <Loader2 className="size-4 shrink-0 animate-spin" aria-hidden />
            ) : (
              <Images className="size-4 shrink-0" aria-hidden />
            )}
            Galeriden toplu seç
          </button>

          <button
            type="button"
            disabled={!canAddMore || isBusy}
            onClick={startCameraSession}
            className="inline-flex min-h-10 items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 text-xs font-semibold text-emerald-800 shadow-sm transition hover:border-emerald-300 hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm"
          >
            <Camera className="size-4 shrink-0" aria-hidden />
            Kamera ile çek
          </button>

          {queue.length > 0 && (
            <>
              <button
                type="button"
                disabled={isBusy}
                onClick={() => {
                  setSelectionMode((open) => !open);
                  setSelectedIndices(new Set());
                }}
                className={cn(
                  "inline-flex min-h-10 items-center gap-2 rounded-full border px-4 text-xs font-semibold shadow-sm transition sm:text-sm",
                  selectionMode
                    ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                    : "border-slate-200 bg-white text-slate-700 hover:border-emerald-300 hover:text-emerald-700"
                )}
              >
                <CheckSquare className="size-4 shrink-0" aria-hidden />
                {selectionMode ? "Seçimi kapat" : "Toplu seç"}
              </button>

              {selectionMode && (
                <>
                  <button
                    type="button"
                    onClick={selectAll}
                    className="inline-flex min-h-10 items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 text-xs font-medium text-slate-600 transition hover:bg-slate-50"
                  >
                    Tümünü seç
                  </button>
                  <button
                    type="button"
                    disabled={selectedIndices.size === 0}
                    onClick={handleBulkDeleteSelected}
                    className="inline-flex min-h-10 items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-3 text-xs font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Trash2 className="size-3.5" aria-hidden />
                    Seçilenleri sil ({selectedIndices.size})
                  </button>
                </>
              )}

              <button
                type="button"
                disabled={isBusy}
                onClick={handleClearAll}
                className="inline-flex min-h-10 items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 text-xs font-medium text-slate-500 transition hover:border-red-200 hover:text-red-600"
              >
                Tümünü sil
              </button>
            </>
          )}

          <span className="text-xs text-slate-400">
            {queue.length}/{MAX_PHOTO_QUEUE} fotoğraf
          </span>
        </div>
      )}

      {processing && (
        <div
          role="status"
          className="flex items-center gap-2 rounded-2xl border border-emerald-100 bg-emerald-50/70 px-4 py-2.5 text-xs text-emerald-800"
        >
          <Loader2 className="size-4 shrink-0 animate-spin" aria-hidden />
          Sıkıştırılıyor… {processing.current}/{processing.total}
        </div>
      )}

      <input
        ref={bulkInputRef}
        type="file"
        accept={ACCEPTED_PHOTO_TYPES}
        multiple
        className="sr-only"
        disabled={disabled || isBusy}
        onChange={(event) => {
          if (event.target.files?.length) {
            void assignFiles(Array.from(event.target.files));
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
        disabled={disabled || pendingCameraOpen || isBusy}
        onChange={(event) => {
          void handleCameraFile(event.target.files?.[0]);
          event.target.value = "";
        }}
      />

      {validationError && (
        <p role="alert" className="text-xs text-amber-700">
          {validationError}
        </p>
      )}

      <div ref={scrollRef}>
        {queue.length === 0 ? (
          <div className="flex min-h-[9rem] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 px-6 py-8 text-center">
            <Images className="size-8 text-slate-300" aria-hidden />
            <p className="mt-2 text-sm font-medium text-slate-500">
              Henüz fotoğraf yok
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Galeriden toplu seçin veya kamera ile çekin
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
            {queue.map((uri, index) => {
              const isSelected = selectedIndices.has(index);

              return (
                <div key={`${uri}-${index}`} className="flex min-w-0 flex-col">
                  <div
                    className={cn(
                      "relative aspect-[4/3] overflow-hidden rounded-2xl border bg-slate-100 shadow-sm transition",
                      isSelected
                        ? "border-emerald-400 ring-2 ring-emerald-200"
                        : "border-slate-200/80"
                    )}
                  >
                    <Image
                      src={uri}
                      alt={
                        index === 0 ? "Kapak fotoğrafı" : `Fotoğraf ${index + 1}`
                      }
                      fill
                      unoptimized
                      className="object-contain p-1.5"
                      sizes="(max-width: 640px) 33vw, 128px"
                    />

                    {index === 0 && (
                      <span className="absolute bottom-1.5 left-1.5 inline-flex items-center rounded-full bg-slate-900/80 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur-sm">
                        Kapak
                      </span>
                    )}

                    {selectionMode && !disabled && (
                      <button
                        type="button"
                        onClick={() => toggleSelection(index)}
                        className="absolute left-1.5 top-1.5 inline-flex size-7 items-center justify-center rounded-full bg-white/90 text-emerald-700 shadow-sm transition hover:bg-white"
                        aria-label={
                          isSelected
                            ? `Fotoğraf ${index + 1} seçimini kaldır`
                            : `Fotoğraf ${index + 1} seç`
                        }
                      >
                        {isSelected ? (
                          <CheckSquare className="size-4" aria-hidden />
                        ) : (
                          <Square className="size-4 text-slate-400" aria-hidden />
                        )}
                      </button>
                    )}

                    {!disabled && !selectionMode && (
                      <button
                        type="button"
                        onClick={() => handleRemove(index)}
                        className="absolute right-1.5 top-1.5 inline-flex size-7 items-center justify-center rounded-full bg-black/55 text-white transition hover:bg-black/75"
                        aria-label={`Fotoğraf ${index + 1} kaldır`}
                      >
                        <X className="size-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="mt-1.5 flex h-7 items-center justify-center">
                    {!disabled && !selectionMode && index !== 0 && (
                      <button
                        type="button"
                        onClick={() => handleSetCover(index)}
                        className="w-full rounded-lg py-1 text-[11px] font-medium text-slate-600 transition hover:bg-slate-100 hover:text-emerald-700"
                      >
                        Kapak yap
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {!disabled && canAddMore && !isBusy && (
              <button
                type="button"
                onClick={() => bulkInputRef.current?.click()}
                className="flex aspect-[4/3] flex-col items-center justify-center gap-1.5 rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 text-slate-500 transition hover:border-emerald-300 hover:bg-emerald-50/50 hover:text-emerald-700"
                aria-label="Daha fazla fotoğraf ekle"
              >
                <Images className="size-5" aria-hidden />
                <span className="text-[11px] font-semibold">Ekle</span>
              </button>
            )}
          </div>
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
                disabled={!canAddMore || pendingCameraOpen || isBusy}
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
