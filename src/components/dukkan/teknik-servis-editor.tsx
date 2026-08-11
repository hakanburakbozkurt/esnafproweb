"use client";

import { useRef, useState } from "react";
import { FaqEditor } from "@/components/dukkan/faq-editor";
import { Field } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { uploadDukkanImage } from "@/lib/supabase/upload-dukkan-image";
import { MAX_PRODUCT_PHOTO_SLOTS } from "@/lib/supabase/storage.constants";
import type { FaqPlaceholderSource } from "@/lib/dukkan/faq-placeholders";
import type { FaqItem } from "@/types/database.types";

const PHOTO_FIELDS = [
  { key: "teknik_servis_fotograf_1", label: "Fotoğraf 1", slot: 1 },
  { key: "teknik_servis_fotograf_2", label: "Fotoğraf 2", slot: 2 },
  { key: "teknik_servis_fotograf_3", label: "Fotoğraf 3", slot: 3 },
] as const;

type PhotoKey = (typeof PHOTO_FIELDS)[number]["key"];

type TeknikServisEditorProps = {
  storeSlug: string;
  aktif: boolean;
  onAktifChange: (value: boolean) => void;
  photos: Record<PhotoKey, string>;
  onPhotoChange: (key: PhotoKey, url: string) => void;
  aciklama: string;
  onAciklamaChange: (value: string) => void;
  faqItems: FaqItem[];
  onFaqChange: (items: FaqItem[]) => void;
  placeholderSource?: FaqPlaceholderSource;
};

function PhotoSlot({
  name,
  label,
  url,
  loading,
  onUpload,
  onClear,
}: {
  name: string;
  label: string;
  url: string;
  loading: boolean;
  onUpload: (file: File) => void;
  onClear: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="min-w-0">
      <input type="hidden" name={name} value={url} />
      <p className="mb-2 text-xs font-medium text-slate-500">{label}</p>
      <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-slate-100">
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt={label} className="h-full w-full object-cover object-center" />
        ) : (
          <div className="flex h-full min-h-[100px] items-center justify-center px-3 text-center text-xs text-slate-400">
            Kare fotoğraf
          </div>
        )}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/90 backdrop-blur-sm">
            <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-medium text-white">
              Yükleniyor…
            </span>
          </div>
        )}
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={loading}
          className="inline-flex min-h-9 items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition hover:border-emerald-300 hover:text-emerald-600 disabled:opacity-50"
        >
          {url ? "Değiştir" : "Yükle"}
        </button>
        {url && (
          <button
            type="button"
            onClick={onClear}
            disabled={loading}
            className="inline-flex min-h-9 items-center justify-center rounded-full px-4 py-2 text-xs font-semibold text-slate-400 transition hover:bg-red-50 hover:text-red-600"
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

export function TeknikServisEditor({
  storeSlug,
  aktif,
  onAktifChange,
  photos,
  onPhotoChange,
  aciklama,
  onAciklamaChange,
  faqItems,
  onFaqChange,
  placeholderSource,
}: TeknikServisEditorProps) {
  const [loadingSlot, setLoadingSlot] = useState<PhotoKey | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleUpload(key: PhotoKey, file: File) {
    setLoadingSlot(key);
    setError(null);

    const result = await uploadDukkanImage(file, storeSlug, "servis");

    setLoadingSlot(null);

    if ("error" in result) {
      setError(result.error);
      return;
    }

    onPhotoChange(key, result.url);
  }

  return (
    <div className="space-y-8">
      <div>
        <input
          type="hidden"
          name="teknik_servis_aktif"
          value={aktif ? "true" : "false"}
        />
        <button
          type="button"
          role="switch"
          aria-checked={aktif}
          onClick={() => onAktifChange(!aktif)}
          className="flex w-full items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-4 text-left transition hover:border-emerald-200 lg:px-6 lg:py-5"
        >
          <span>
            <span className="block text-sm font-semibold text-slate-900 lg:text-base">
              Teknik Servis Hizmeti Veriyor musunuz?
            </span>
            <span className="mt-1 block text-xs text-slate-500 lg:text-sm">
              Kapalıyken Teknik Servis sekmesi vitrinde gizlenir.
            </span>
          </span>
          <span
            className={`relative inline-flex h-7 w-12 shrink-0 rounded-full transition ${
              aktif ? "bg-emerald-600" : "bg-slate-300"
            }`}
            aria-hidden
          >
            <span
              className={`absolute top-0.5 size-6 rounded-full bg-white shadow transition ${
                aktif ? "left-[22px]" : "left-0.5"
              }`}
            />
          </span>
        </button>
      </div>

      {aktif && (
        <>
          <div>
            <p className="mb-4 text-sm font-medium text-slate-700 lg:text-base">
              Teknik servis galerisi ({MAX_PRODUCT_PHOTO_SLOTS} kare fotoğraf)
            </p>
            <div className="grid grid-cols-1 gap-5">
              {PHOTO_FIELDS.map(({ key, label }) => (
                <PhotoSlot
                  key={key}
                  name={key}
                  label={label}
                  url={photos[key]}
                  loading={loadingSlot === key}
                  onUpload={(file) => void handleUpload(key, file)}
                  onClear={() => onPhotoChange(key, "")}
                />
              ))}
            </div>
            {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
          </div>

          <Field
            label="Teknik Servis Anlatımı"
            hint="Vitrinde hizmet detayları bölümünde görünür"
          >
            <Textarea
              name="teknik_servis_aciklama"
              value={aciklama}
              onChange={(e) => onAciklamaChange(e.target.value)}
              placeholder="Verdiğiniz teknik servis hizmetlerini, süreçlerinizi ve garanti koşullarınızı anlatın"
              rows={8}
              className="min-h-[180px] w-full resize-y"
            />
          </Field>

          <FaqEditor
            items={faqItems}
            onChange={onFaqChange}
            fieldPrefix="servis_faq"
            pageContext="teknik_servis"
            placeholderSource={placeholderSource}
            title="Teknik Servis SSS"
            description="Yalnızca teknik servis sayfasında görünen bağımsız sorular."
          />
        </>
      )}
    </div>
  );
}
