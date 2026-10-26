"use client";

import { MotionConfig, Reorder, useDragControls } from "framer-motion";
import {
  ArrowDown,
  ArrowUp,
  CircleAlert,
  GripVertical,
  ImagePlus,
  LoaderCircle,
  Star,
  Trash2,
} from "lucide-react";
import { useId, useState, type DragEvent } from "react";
import type { UrunFormItem } from "@/components/dukkan/product-photo-editor";
import { compressUrunImage } from "@/lib/dukkan/compress-urun-image";
import {
  getUrunPhotoList,
  MAX_URUN_PHOTO_SLOTS,
  setUrunPhotoList,
} from "@/lib/dukkan/urun-photo-slots";
import { uploadDukkanImage } from "@/lib/supabase/upload-dukkan-image";
import { cn } from "@/lib/utils/cn";

export type UrunItemUpdater = (prev: UrunFormItem) => UrunFormItem;

type UploadTask = {
  id: string;
  name: string;
  previewUrl: string;
  progress: number;
  stage: "bekliyor" | "sikistiriliyor" | "yukleniyor" | "hata";
  error?: string;
};

type UrunPhotoGridProps = {
  item: UrunFormItem;
  storeSlug: string;
  onChange: (updater: UrunItemUpdater) => void;
  /** Yükleme başlayınca true, bitince false ile çağrılır */
  onBusyChange?: (busy: boolean) => void;
};

const iconButtonClass =
  "inline-flex size-11 shrink-0 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 disabled:pointer-events-none disabled:opacity-30";

function PhotoRow({
  url,
  index,
  total,
  onMove,
  onMakeCover,
  onRemove,
}: {
  url: string;
  index: number;
  total: number;
  onMove: (from: number, to: number) => void;
  onMakeCover: (index: number) => void;
  onRemove: (index: number) => void;
}) {
  const controls = useDragControls();
  const isCover = index === 0;
  const label = isCover ? "Kapak fotoğrafı" : `Fotoğraf ${index + 1}`;

  return (
    <Reorder.Item
      value={url}
      dragListener={false}
      dragControls={controls}
      className="relative flex items-center gap-1.5 rounded-2xl border border-slate-200/80 bg-white p-1.5 pr-1 shadow-sm"
      whileDrag={{ scale: 1.02, boxShadow: "0 12px 30px rgba(15,23,42,0.15)", zIndex: 10 }}
    >
      <button
        type="button"
        aria-label={`${label} — sürükleyerek sırala`}
        onPointerDown={(event) => controls.start(event)}
        className={cn(iconButtonClass, "cursor-grab touch-none active:cursor-grabbing")}
      >
        <GripVertical className="size-5" aria-hidden />
      </button>

      <div className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-slate-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={url} alt={label} className="h-full w-full object-cover" draggable={false} />
      </div>

      <div className="min-w-0 flex-1 px-1">
        <p className="truncate text-sm font-semibold text-slate-800">{label}</p>
        {isCover ? (
          <span className="mt-0.5 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
            <Star className="size-3 fill-current" aria-hidden />
            Vitrinde ilk görünür
          </span>
        ) : (
          <button
            type="button"
            onClick={() => onMakeCover(index)}
            className="-ml-1 inline-flex min-h-8 items-center rounded-full px-1 text-xs font-semibold text-emerald-700 hover:underline"
          >
            Kapak yap
          </button>
        )}
      </div>

      <button
        type="button"
        aria-label={`${label} yukarı taşı`}
        onClick={() => onMove(index, index - 1)}
        disabled={index === 0}
        className={cn(iconButtonClass, "hidden min-[380px]:inline-flex")}
      >
        <ArrowUp className="size-4" aria-hidden />
      </button>
      <button
        type="button"
        aria-label={`${label} aşağı taşı`}
        onClick={() => onMove(index, index + 1)}
        disabled={index === total - 1}
        className={cn(iconButtonClass, "hidden min-[380px]:inline-flex")}
      >
        <ArrowDown className="size-4" aria-hidden />
      </button>
      <button
        type="button"
        aria-label={`${label} sil`}
        onClick={() => onRemove(index)}
        className={cn(iconButtonClass, "hover:bg-red-50 hover:text-red-600")}
      >
        <Trash2 className="size-4" aria-hidden />
      </button>
    </Reorder.Item>
  );
}

export function UrunPhotoGrid({ item, storeSlug, onChange, onBusyChange }: UrunPhotoGridProps) {
  const inputId = useId();
  const [tasks, setTasks] = useState<UploadTask[]>([]);
  const [notice, setNotice] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const photos = [...new Set(getUrunPhotoList(item))];
  const pendingCount = tasks.filter((task) => task.stage !== "hata").length;
  const remaining = MAX_URUN_PHOTO_SLOTS - photos.length - pendingCount;

  function writePhotos(next: string[]) {
    onChange((prev) => setUrunPhotoList(prev, next));
  }

  function move(from: number, to: number) {
    if (to < 0 || to >= photos.length) return;
    const next = [...photos];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    writePhotos(next);
  }

  function updateTask(id: string, patch: Partial<UploadTask>) {
    setTasks((prev) => prev.map((task) => (task.id === id ? { ...task, ...patch } : task)));
  }

  function dropTask(id: string) {
    setTasks((prev) => {
      const task = prev.find((entry) => entry.id === id);
      if (task) URL.revokeObjectURL(task.previewUrl);
      return prev.filter((entry) => entry.id !== id);
    });
  }

  async function handleFiles(fileList: FileList | File[]) {
    const images = Array.from(fileList).filter((file) => file.type.startsWith("image/"));
    const skippedNonImage = Array.from(fileList).length - images.length;
    if (!images.length) {
      setNotice(skippedNonImage ? "Yalnızca görsel dosyaları ekleyebilirsiniz." : null);
      return;
    }

    const accepted = images.slice(0, Math.max(remaining, 0));
    const overflow = images.length - accepted.length;
    const messages: string[] = [];
    if (overflow > 0) {
      messages.push(
        `En fazla ${MAX_URUN_PHOTO_SLOTS} fotoğraf eklenebilir; ${overflow} fotoğraf eklenmedi.`
      );
    }
    if (skippedNonImage > 0) messages.push(`${skippedNonImage} dosya görsel olmadığı için atlandı.`);
    setNotice(messages.length ? messages.join(" ") : null);
    if (!accepted.length) return;

    const batch: UploadTask[] = accepted.map((file) => ({
      id: crypto.randomUUID(),
      name: file.name,
      previewUrl: URL.createObjectURL(file),
      progress: 0,
      stage: "bekliyor",
    }));
    setTasks((prev) => [...prev, ...batch]);
    onBusyChange?.(true);

    try {
      for (const [index, file] of accepted.entries()) {
        const task = batch[index];
        updateTask(task.id, { stage: "sikistiriliyor" });

        const compressed = await compressUrunImage(file, (percent) =>
          updateTask(task.id, { progress: Math.round(percent * 0.7) })
        );

        updateTask(task.id, { stage: "yukleniyor", progress: 75 });
        const result = await uploadDukkanImage(compressed, storeSlug, "urun");

        if ("error" in result) {
          updateTask(task.id, { stage: "hata", error: result.error, progress: 100 });
          continue;
        }

        onChange((prev) => {
          const current = getUrunPhotoList(prev);
          if (current.length >= MAX_URUN_PHOTO_SLOTS) return prev;
          return setUrunPhotoList(prev, [...current, result.url]);
        });
        dropTask(task.id);
      }
    } finally {
      onBusyChange?.(false);
    }
  }

  function handleDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setDragOver(false);
    if (event.dataTransfer.files.length) void handleFiles(event.dataTransfer.files);
  }

  const failedTasks = tasks.filter((task) => task.stage === "hata");
  const activeTasks = tasks.filter((task) => task.stage !== "hata");

  return (
    <MotionConfig reducedMotion="user">
      <div className="space-y-3">
        {photos.length > 0 && (
          <Reorder.Group
            axis="y"
            values={photos}
            onReorder={writePhotos}
            className="space-y-2"
          >
            {photos.map((url, index) => (
              <PhotoRow
                key={url}
                url={url}
                index={index}
                total={photos.length}
                onMove={move}
                onMakeCover={(from) => move(from, 0)}
                onRemove={(at) => writePhotos(photos.filter((_, i) => i !== at))}
              />
            ))}
          </Reorder.Group>
        )}

        {activeTasks.length > 0 && (
          <ul className="space-y-2" aria-live="polite">
            {activeTasks.map((task) => (
              <li
                key={task.id}
                className="flex items-center gap-3 rounded-2xl border border-dashed border-emerald-200 bg-emerald-50/40 p-1.5 pr-3"
              >
                <div className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={task.previewUrl} alt="" className="h-full w-full object-cover opacity-60" />
                  <LoaderCircle
                    className="absolute inset-0 m-auto size-5 animate-spin text-emerald-700"
                    aria-hidden
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium text-slate-700">{task.name}</p>
                  <p className="text-[11px] text-slate-500">
                    {task.stage === "bekliyor"
                      ? "Sırada"
                      : task.stage === "sikistiriliyor"
                        ? "Küçültülüyor…"
                        : "Yükleniyor…"}
                  </p>
                  <div
                    role="progressbar"
                    aria-label={`${task.name} yükleme durumu`}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={task.progress}
                    className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-emerald-100"
                  >
                    <div
                      className="h-full rounded-full bg-emerald-500 transition-[width] duration-300 motion-reduce:transition-none"
                      style={{ width: `${task.progress}%` }}
                    />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}

        {failedTasks.map((task) => (
          <div
            key={task.id}
            role="alert"
            className="flex items-start gap-2 rounded-2xl border border-red-100 bg-red-50 px-3 py-2.5 text-sm text-red-700"
          >
            <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
            <p className="min-w-0 flex-1">
              <span className="font-medium">{task.name}</span> yüklenemedi: {task.error}
            </p>
            <button
              type="button"
              onClick={() => dropTask(task.id)}
              className="-my-1 inline-flex min-h-9 shrink-0 items-center rounded-full px-3 text-xs font-semibold hover:bg-red-100"
            >
              Kapat
            </button>
          </div>
        ))}

        {remaining > 0 ? (
          <label
            htmlFor={inputId}
            onDragOver={(event) => {
              event.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={cn(
              "flex min-h-24 cursor-pointer flex-col items-center justify-center gap-1.5 rounded-2xl border-2 border-dashed px-4 py-5 text-center transition",
              dragOver
                ? "border-emerald-400 bg-emerald-50 text-emerald-700"
                : "border-slate-200 bg-slate-50/60 text-slate-500 hover:border-emerald-300 hover:text-emerald-700"
            )}
          >
            <ImagePlus className="size-6" aria-hidden />
            <span className="text-sm font-semibold">
              {photos.length ? "Fotoğraf ekle" : "Fotoğraf seç veya buraya sürükle"}
            </span>
            <span className="text-xs text-slate-400">
              Birden çok seçebilirsiniz · {remaining} yer kaldı · otomatik küçültülür
            </span>
          </label>
        ) : (
          <p className="rounded-2xl bg-slate-50 px-4 py-3 text-center text-xs font-medium text-slate-500">
            {MAX_URUN_PHOTO_SLOTS} fotoğraf sınırına ulaştınız. Yeni eklemek için birini silin.
          </p>
        )}

        <input
          id={inputId}
          type="file"
          accept="image/*"
          multiple
          className="sr-only"
          onChange={(event) => {
            const files = event.target.files;
            if (files?.length) void handleFiles(Array.from(files));
            event.target.value = "";
          }}
        />

        {notice && <p className="text-xs font-medium text-amber-700">{notice}</p>}

        <p className="text-xs text-slate-400">
          Sıralamak için tutamaçtan sürükleyin veya okları kullanın. İlk fotoğraf vitrinde kapak
          olur.
        </p>
      </div>
    </MotionConfig>
  );
}
