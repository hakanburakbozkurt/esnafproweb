"use client";

import { useRef, useState } from "react";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  getUrunGorselOraniLabel,
  normalizeUrunGorselOrani,
  toggleUrunGorselOrani,
  type UrunGorselOrani,
} from "@/lib/dukkan/urun-gorsel-orani";
import { uploadDukkanImage } from "@/lib/supabase/upload-dukkan-image";
import {
  MAX_PRODUCT_PHOTOS,
  MAX_PRODUCT_PHOTO_SLOTS,
} from "@/lib/supabase/storage.constants";
import type { DukkanUrunu } from "@/types/database.types";

export type UrunFormItem = {
  id?: string;
  urun_adi: string;
  urun_aciklama: string;
  fotograf_url: string;
  fotograf_url_2: string;
  fotograf_url_3: string;
  gorsel_orani: UrunGorselOrani;
};

const PHOTO_SLOT_KEYS = [
  "fotograf_url",
  "fotograf_url_2",
  "fotograf_url_3",
] as const;

type PhotoSlotKey = (typeof PHOTO_SLOT_KEYS)[number];

export function emptyUrunItem(): UrunFormItem {
  return {
    urun_adi: "",
    urun_aciklama: "",
    fotograf_url: "",
    fotograf_url_2: "",
    fotograf_url_3: "",
    gorsel_orani: "yatay",
  };
}

export function normalizeUrunItems(
  items: DukkanUrunu[] | UrunFormItem[] | null | undefined
): UrunFormItem[] {
  if (!items?.length) return [];
  return items.slice(0, MAX_PRODUCT_PHOTOS).map((item) => ({
    id: "id" in item ? item.id : undefined,
    urun_adi: item.urun_adi,
    urun_aciklama:
      "urun_aciklama" in item ? (item.urun_aciklama ?? "") : "",
    fotograf_url: item.fotograf_url ?? "",
    fotograf_url_2:
      "fotograf_url_2" in item ? (item.fotograf_url_2 ?? "") : "",
    fotograf_url_3:
      "fotograf_url_3" in item ? (item.fotograf_url_3 ?? "") : "",
    gorsel_orani: normalizeUrunGorselOrani(
      "gorsel_orani" in item ? item.gorsel_orani : "yatay"
    ),
  }));
}

function photoFieldName(index: number, slot: number): string {
  if (slot === 1) return `fotograf_url_${index}`;
  return `fotograf_url_${index}_${slot}`;
}

function RatioToggle({
  value,
  onChange,
}: {
  value: UrunGorselOrani;
  onChange: (next: UrunGorselOrani) => void;
}) {
  const next = toggleUrunGorselOrani(value);

  return (
    <button
      type="button"
      onClick={() => onChange(next)}
      title={`${getUrunGorselOraniLabel(value)} — ${getUrunGorselOraniLabel(next)} formatına geç`}
      aria-label={`Görsel formatı: ${getUrunGorselOraniLabel(value)}. ${getUrunGorselOraniLabel(next)} formata geç.`}
      className="inline-flex shrink-0 items-center gap-1 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-600 transition hover:border-emerald-300 hover:text-emerald-600"
    >
      <span>{getUrunGorselOraniLabel(value)}</span>
      <span aria-hidden className="text-slate-400">
        ⇄
      </span>
    </button>
  );
}

function PhotoSlot({
  slot,
  productIndex,
  url,
  label,
  loading,
  onUpload,
  onClear,
}: {
  slot: number;
  productIndex: number;
  url: string;
  label: string;
  loading: boolean;
  onUpload: (file: File) => void;
  onClear: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex min-w-0 flex-col rounded-xl border border-slate-200/80 bg-white p-2 shadow-sm">
      <input
        type="hidden"
        name={photoFieldName(productIndex, slot)}
        value={url}
      />
      <p className="mb-1.5 truncate text-[10px] font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <button
        type="button"
        onClick={() => !loading && inputRef.current?.click()}
        disabled={loading}
        className="group relative aspect-square w-full overflow-hidden rounded-lg border border-dashed border-slate-200 bg-slate-50 transition hover:border-emerald-300 disabled:cursor-not-allowed"
        aria-label={url ? `${label} değiştir` : `${label} yükle`}
      >
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={url}
            alt={label}
            className="h-full w-full object-cover object-center"
          />
        ) : (
          <span className="flex h-full items-center justify-center px-2 text-center text-[11px] leading-snug text-slate-400 group-hover:text-emerald-600">
            + Yükle
          </span>
        )}
        {loading && (
          <span className="absolute inset-0 flex items-center justify-center bg-white/90 text-[10px] font-medium text-slate-700">
            …
          </span>
        )}
      </button>
      <div className="mt-2 flex flex-col gap-1">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={loading}
          className="inline-flex min-h-8 w-full items-center justify-center rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-[11px] font-semibold text-slate-700 transition hover:border-emerald-300 hover:text-emerald-600 disabled:opacity-50"
        >
          {url ? "Değiştir" : "Seç"}
        </button>
        {url && (
          <button
            type="button"
            onClick={onClear}
            disabled={loading}
            className="inline-flex min-h-8 w-full items-center justify-center rounded-lg px-2 py-1.5 text-[11px] font-semibold text-slate-400 transition hover:bg-red-50 hover:text-red-600"
          >
            Sil
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onUpload(file);
          e.target.value = "";
        }}
      />
    </div>
  );
}

function UrunRow({
  index,
  item,
  storeSlug,
  onChange,
  onRemove,
}: {
  index: number;
  item: UrunFormItem;
  storeSlug: string;
  onChange: (index: number, next: UrunFormItem) => void;
  onRemove: (index: number) => void;
}) {
  const [loadingSlot, setLoadingSlot] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(slot: number, file: File) {
    setLoadingSlot(slot);
    setError(null);

    const result = await uploadDukkanImage(file, storeSlug, "urun");

    setLoadingSlot(null);

    if ("error" in result) {
      setError(result.error);
      return;
    }

    const key = PHOTO_SLOT_KEYS[slot - 1] as PhotoSlotKey;
    onChange(index, { ...item, [key]: result.url });
  }

  function clearSlot(slot: number) {
    const key = PHOTO_SLOT_KEYS[slot - 1] as PhotoSlotKey;
    onChange(index, { ...item, [key]: "" });
  }

  const slotLabels = ["Fotoğraf 1", "Fotoğraf 2", "Fotoğraf 3"];

  return (
    <article className="border-b border-slate-200/70 py-8 last:border-b-0">
      {item.id && <input type="hidden" name={`urun_id_${index}`} value={item.id} />}
      <input
        type="hidden"
        name={`gorsel_orani_${index}`}
        value={item.gorsel_orani}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
            Ürün / Hizmet {index + 1}
          </p>
          <RatioToggle
            value={item.gorsel_orani}
            onChange={(gorsel_orani) =>
              onChange(index, { ...item, gorsel_orani })
            }
          />
        </div>
        <button
          type="button"
          onClick={() => onRemove(index)}
          className="inline-flex min-h-9 items-center rounded-full px-4 py-2 text-sm font-semibold text-slate-400 transition hover:bg-red-50 hover:text-red-600"
        >
          Ürünü Kaldır
        </button>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-3">
        {slotLabels.map((label, slotIndex) => {
          const slot = slotIndex + 1;
          const key = PHOTO_SLOT_KEYS[slotIndex];
          return (
            <PhotoSlot
              key={key}
              slot={slot}
              productIndex={index}
              url={item[key]}
              label={label}
              loading={loadingSlot === slot}
              onUpload={(file) => void handleFile(slot, file)}
              onClear={() => clearSlot(slot)}
            />
          );
        })}
      </div>

      <div className="mt-6 space-y-5">
        <Field label="Ürün / Hizmet Adı" hint="Vitrinde büyük yeşil başlık olarak görünür">
          <Input
            name={`urun_adi_${index}`}
            value={item.urun_adi}
            onChange={(e) =>
              onChange(index, { ...item, urun_adi: e.target.value })
            }
            placeholder="Örn: iPhone 15 Pro Max"
            className="w-full"
          />
        </Field>

        <Field
          label="Açıklama"
          hint="Vitrinde başlığın altında gri metin olarak görünür"
        >
          <Textarea
            name={`urun_aciklama_${index}`}
            value={item.urun_aciklama}
            onChange={(e) =>
              onChange(index, { ...item, urun_aciklama: e.target.value })
            }
            placeholder="Ürün veya hizmet hakkında kısa bilgi"
            rows={4}
            className="min-h-[120px] w-full resize-y"
          />
        </Field>
      </div>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
    </article>
  );
}

export function ProductPhotoEditor({
  items,
  onChange,
  storeSlug,
}: {
  items: UrunFormItem[];
  onChange: (items: UrunFormItem[]) => void;
  storeSlug: string;
}) {
  function addItem() {
    if (items.length >= MAX_PRODUCT_PHOTOS) return;
    onChange([...items, emptyUrunItem()]);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-500">
          Her ürün için en fazla {MAX_PRODUCT_PHOTO_SLOTS} fotoğraf. Format
          değiştirmek için satır başındaki{" "}
          <span className="font-medium text-slate-600">Yatay ⇄</span> düğmesini
          kullanın. En fazla {MAX_PRODUCT_PHOTOS} ürün ({items.length}/
          {MAX_PRODUCT_PHOTOS})
        </p>
        {items.length < MAX_PRODUCT_PHOTOS && (
          <button
            type="button"
            onClick={addItem}
            className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 px-6 py-2.5 text-sm font-semibold text-emerald-700 transition hover:border-emerald-300 hover:bg-emerald-100"
          >
            + Ürün Ekle
          </button>
        )}
      </div>

      {!items.length ? (
        <button
          type="button"
          onClick={addItem}
          className="flex min-h-[200px] w-full items-center justify-center rounded-2xl border border-dashed border-slate-200 py-12 text-sm font-medium text-slate-500 transition hover:border-emerald-300 hover:text-emerald-600"
        >
          + İlk ürününüzü ekleyin
        </button>
      ) : (
        <div className="flex flex-col">
          {items.map((item, index) => (
            <UrunRow
              key={item.id ?? `new-${index}`}
              index={index}
              item={item}
              storeSlug={storeSlug}
              onChange={(i, next) => {
                const copy = [...items];
                copy[i] = next;
                onChange(copy);
              }}
              onRemove={(i) => onChange(items.filter((_, idx) => idx !== i))}
            />
          ))}
        </div>
      )}
    </div>
  );
}
