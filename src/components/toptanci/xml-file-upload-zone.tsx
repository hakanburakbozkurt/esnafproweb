"use client";

import { useActionState, useCallback, useRef, useState } from "react";
import {
  uploadWholesalerFeedAction,
  type UploadFeedState,
} from "@/app/yonetim/toptanci/xml/actions";
import { Button } from "@/components/ui/button";
import { validateWholesalerFeedFile } from "@/lib/toptanci/validate-feed-file";
import { ALLOWED_FEED_EXTENSIONS } from "@/lib/supabase/storage.constants";
import { cardClassName, cn } from "@/lib/utils/cn";

const initialState: UploadFeedState = {};

const acceptAttribute = [
  ...ALLOWED_FEED_EXTENSIONS,
  "text/xml",
  "application/xml",
  "application/json",
  "text/json",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/csv",
].join(",");

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function XmlFileUploadZone() {
  const inputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [state, formAction, isPending] = useActionState(
    uploadWholesalerFeedAction,
    initialState
  );

  const applyFile = useCallback((file: File | undefined) => {
    if (!file) return;

    const validationError = validateWholesalerFeedFile(file);
    if (validationError) {
      setLocalError(validationError);
      setSelectedFile(null);
      return;
    }

    setLocalError(null);
    setSelectedFile(file);

    if (inputRef.current) {
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      inputRef.current.files = dataTransfer.files;
    }
  }, []);

  function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    applyFile(event.target.files?.[0]);
  }

  function handleDragOver(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(true);
  }

  function handleDragLeave(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
  }

  function handleDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
    applyFile(event.dataTransfer.files?.[0]);
  }

  function openFilePicker() {
    inputRef.current?.click();
  }

  function clearSelection() {
    setSelectedFile(null);
    setLocalError(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  const errorMessage =
    localError || ("error" in state ? state.error : undefined);

  const successMessage =
    "success" in state && state.success
      ? "importStats" in state && state.importStats
        ? `"${state.name}" yüklendi — ${state.importStats.added} yeni, ${state.importStats.updated} güncellendi. Mobil vitrinde görünecek.`
        : "importWarning" in state && state.importWarning
          ? `"${state.name}" kaydedildi. ${state.importWarning}`
          : `"${state.name}" yüklendi ve feed listesine eklendi.`
      : undefined;

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      <input
        ref={inputRef}
        type="file"
        name="file"
        accept={acceptAttribute}
        className="sr-only"
        onChange={handleInputChange}
      />

      <div
        role="button"
        tabIndex={0}
        onClick={openFilePicker}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            openFilePicker();
          }
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          cardClassName,
          "cursor-pointer border-2 border-dashed bg-slate-50/80 p-8 text-center shadow-none transition-colors",
          isDragging
            ? "border-emerald-400 bg-emerald-50/60"
            : "border-slate-200 hover:border-emerald-200 hover:bg-emerald-50/40"
        )}
      >
        <div className="mx-auto flex max-w-sm flex-col items-center gap-2">
          <svg
            className="size-10 text-slate-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
            aria-hidden
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5"
            />
          </svg>
          <p className="text-sm font-medium text-slate-700">
            Dosyayı sürükleyip bırakın veya tıklayarak seçin
          </p>
          <p className="text-xs text-slate-400">
            XML, JSON, Excel (.xlsx, .xls) veya CSV · Maks. 50MB
          </p>
        </div>
      </div>

      {selectedFile && (
        <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-slate-900">
              {selectedFile.name}
            </p>
            <p className="text-xs text-slate-500">
              {formatFileSize(selectedFile.size)}
            </p>
          </div>
          <button
            type="button"
            onClick={clearSelection}
            className="text-sm font-medium text-slate-500 transition hover:text-slate-800"
          >
            Kaldır
          </button>
        </div>
      )}

      {errorMessage && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
          {errorMessage}
        </p>
      )}

      {successMessage && (
        <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {successMessage}
        </p>
      )}

      <Button
        type="submit"
        disabled={!selectedFile || isPending}
        className="w-full min-h-11"
      >
        {isPending ? "Yükleniyor ve vitrine aktarılıyor…" : "Dosyayı Yükle ve Vitrine Aktar"}
      </Button>
    </form>
  );
}
