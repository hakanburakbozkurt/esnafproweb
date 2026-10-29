"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Trash2, X } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { RatioToggle, type UrunFormItem } from "@/components/dukkan/product-photo-editor";
import {
  UrunPhotoGrid,
  type UrunItemUpdater,
} from "@/components/dukkan/urunler/urun-photo-grid";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import {
  MAX_URUN_BARKOD_LENGTH,
  MAX_URUN_FIYAT_LENGTH,
  MAX_URUN_KATEGORISI_LENGTH,
} from "@/lib/dukkan/form-data";
import { MAX_URUN_PHOTO_SLOTS } from "@/lib/dukkan/urun-photo-slots";

const NEW_CATEGORY_VALUE = "__yeni__";

type UrunEditPanelProps = {
  item: UrunFormItem;
  position: number;
  /** Diğer ürünlerde kullanılan kategoriler */
  categories: string[];
  storeSlug: string;
  onChange: (next: UrunFormItem | UrunItemUpdater) => void;
  onBusyChange: (busy: boolean) => void;
  onRemove: () => void;
  onClose: () => void;
};

export function UrunEditPanel({
  item,
  position,
  categories,
  storeSlug,
  onChange,
  onBusyChange,
  onRemove,
  onClose,
}: UrunEditPanelProps) {
  const reduceMotion = useReducedMotion();
  const baseId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const [creatingCategory, setCreatingCategory] = useState(false);

  const kategori = item.urun_kategorisi;
  const isCustomCategory =
    creatingCategory || (kategori.trim() !== "" && !categories.includes(kategori));

  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const previousFocus = document.activeElement as HTMLElement | null;
    document.body.style.overflow = "hidden";
    dialogRef.current?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onCloseRef.current();
    }
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
      previousFocus?.focus?.();
    };
  }, []);

  const patch = (fields: Partial<UrunFormItem>) =>
    onChange((prev) => ({ ...prev, ...fields }));
  const fieldId = (name: string) => `${baseId}-${name}`;
  const title = item.urun_adi.trim() || `Ürün ${position}`;

  return (
    <div className="fixed inset-0 z-[60]">
      <motion.button
        type="button"
        aria-label="Düzenleme panelini kapat"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, transition: { duration: reduceMotion ? 0 : 0.18 } }}
        transition={{ duration: reduceMotion ? 0 : 0.2 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]"
      />

      <motion.div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={fieldId("title")}
        tabIndex={-1}
        initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 48 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: reduceMotion ? 0 : 48, transition: { duration: reduceMotion ? 0 : 0.18 } }}
        transition={
          reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 380, damping: 36 }
        }
        className="absolute inset-x-0 bottom-0 flex max-h-[92dvh] flex-col rounded-t-3xl bg-white shadow-2xl outline-none sm:inset-y-0 sm:left-auto sm:right-0 sm:max-h-none sm:w-[30rem] sm:rounded-l-3xl sm:rounded-tr-none"
      >
        <div className="mx-auto mt-2.5 h-1.5 w-10 rounded-full bg-slate-200 sm:hidden" aria-hidden />

        <header className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-600">
              Ürün {position}
            </p>
            <h2
              id={fieldId("title")}
              className="truncate text-base font-semibold text-slate-900"
            >
              {title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Kapat"
            className="inline-flex size-11 shrink-0 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
          >
            <X className="size-5" aria-hidden />
          </button>
        </header>

        <div className="flex-1 space-y-6 overflow-y-auto overscroll-contain px-5 py-5">
          <section aria-label="Fotoğraflar" className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-slate-800">
                Fotoğraflar{" "}
                <span className="font-normal text-slate-400">
                  (en fazla {MAX_URUN_PHOTO_SLOTS})
                </span>
              </p>
              <RatioToggle
                value={item.gorsel_orani}
                onChange={(gorsel_orani) => onChange((prev) => ({ ...prev, gorsel_orani }))}
              />
            </div>
            <UrunPhotoGrid
              item={item}
              storeSlug={storeSlug}
              onChange={onChange}
              onBusyChange={onBusyChange}
            />
          </section>

          <div>
            <Label htmlFor={fieldId("adi")}>Ürün / Hizmet adı</Label>
            <Input
              id={fieldId("adi")}
              value={item.urun_adi}
              onChange={(event) => patch({ urun_adi: event.target.value })}
              placeholder="Örn: iPhone 15 Pro Max Kılıf"
              className="w-full"
            />
          </div>

          <div>
            <Label htmlFor={fieldId("kategori")}>Kategori</Label>
            <select
              id={fieldId("kategori")}
              value={isCustomCategory ? NEW_CATEGORY_VALUE : kategori}
              onChange={(event) => {
                const value = event.target.value;
                if (value === NEW_CATEGORY_VALUE) {
                  setCreatingCategory(true);
                  patch({ urun_kategorisi: "" });
                  return;
                }
                setCreatingCategory(false);
                patch({ urun_kategorisi: value });
              }}
              className="min-h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 shadow-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="">Kategorisiz</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
              <option value={NEW_CATEGORY_VALUE}>+ Yeni kategori…</option>
            </select>
            {isCustomCategory && (
              <Input
                aria-label="Yeni kategori adı"
                value={kategori}
                maxLength={MAX_URUN_KATEGORISI_LENGTH}
                onChange={(event) =>
                  patch({ urun_kategorisi: event.target.value })
                }
                placeholder="Örn: Kılıflar"
                className="mt-2 w-full"
              />
            )}
            <p className="mt-1.5 text-xs text-slate-400">
              Vitrinde ürünler bu kategorilere göre gruplanır.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor={fieldId("fiyat")}>Fiyat</Label>
              <Input
                id={fieldId("fiyat")}
                value={item.fiyat}
                maxLength={MAX_URUN_FIYAT_LENGTH}
                onChange={(event) => patch({ fiyat: event.target.value })}
                placeholder="Örn: 1.250 TL"
                className="w-full"
              />
            </div>
            <div>
              <Label htmlFor={fieldId("stok")}>Stok adedi</Label>
              <Input
                id={fieldId("stok")}
                type="number"
                inputMode="numeric"
                min={0}
                step={1}
                value={item.stok_adedi}
                onChange={(event) =>
                  patch({ stok_adedi: event.target.value.replace(/[^\d]/g, "") })
                }
                placeholder="Boş: rozet yok"
                className="w-full"
              />
            </div>
          </div>
          <p className="-mt-3 text-xs text-slate-400">
            Stok 0 ise “Tükendi”, 1 ise “Son 1 adet”, daha fazlaysa “Stokta” rozeti görünür.
          </p>

          <div>
            <Label htmlFor={fieldId("barkod")}>Barkod</Label>
            <Input
              id={fieldId("barkod")}
              value={item.barkod}
              maxLength={MAX_URUN_BARKOD_LENGTH}
              autoComplete="off"
              spellCheck={false}
              onChange={(event) =>
                patch({
                  barkod: event.target.value
                    .replace(/\s+/g, "")
                    .replace(/[^A-Za-z0-9._-]/g, ""),
                })
              }
              placeholder="Örn: 8690000000017"
              className="w-full"
            />
            <p className="mt-1.5 text-xs text-slate-400">
              Trendyol ve Hepsiburada’ya göndermek için gerekli. Kutudaki barkodu yazın; barkod
              yoksa kendi stok kodunuzu kullanabilirsiniz, ama bazı kategoriler gerçek barkod ister.
            </p>
          </div>

          <div>
            <Label htmlFor={fieldId("aciklama")}>Açıklama</Label>
            <Textarea
              id={fieldId("aciklama")}
              value={item.urun_aciklama}
              onChange={(event) =>
                patch({ urun_aciklama: event.target.value })
              }
              placeholder="Ürün veya hizmet hakkında kısa bilgi"
              rows={4}
              className="min-h-[110px] w-full resize-y"
            />
          </div>
        </div>

        <footer className="flex gap-2 border-t border-slate-100 px-5 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <button
            type="button"
            onClick={() => {
              if (window.confirm(`“${title}” listeden kaldırılsın mı?`)) onRemove();
            }}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-4 text-sm font-semibold text-red-600 transition hover:bg-red-50"
          >
            <Trash2 className="size-4" aria-hidden />
            Kaldır
          </button>
          <button
            type="button"
            onClick={onClose}
            className="ml-auto inline-flex min-h-11 items-center justify-center rounded-full bg-slate-900 px-6 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Tamam
          </button>
        </footer>
      </motion.div>
    </div>
  );
}
