"use client";

import {
  Gamepad2,
  Laptop,
  Loader2,
  Phone,
  Save,
  Tablet,
  Watch,
  X,
} from "lucide-react";
import { useState } from "react";
import {
  ComputerCategoryFields,
  ConsoleCategoryFields,
  PhoneCategoryFields,
  TabletCategoryFields,
  WatchCategoryFields,
} from "@/components/cihaz/cihaz-category-fields";
import {
  CihazCheckbox,
  CihazField,
  CihazInput,
  CihazSectionTitle,
  CihazSelect,
  CihazTextarea,
} from "@/components/cihaz/cihaz-form-ui";
import { CihazPhotoUploader } from "@/components/cihaz/cihaz-photo-uploader";
import type { useCihazVitrini } from "@/lib/cihaz/use-cihaz-vitrini";
import {
  DEVICE_CATEGORY_META,
  LISTING_TYPE_LABEL,
  PAYMENT_METHOD_OPTIONS,
  type DeviceCategory,
} from "@/lib/cihaz/types";
import { cn } from "@/lib/utils/cn";

type VitriniHook = ReturnType<typeof useCihazVitrini>;

const CATEGORY_ICONS: Record<DeviceCategory, typeof Phone> = {
  phone: Phone,
  tablet: Tablet,
  computer: Laptop,
  watch: Watch,
  console: Gamepad2,
};

type CihazDeviceFormProps = {
  vitrini: VitriniHook;
  onSaved?: () => void;
};

export function CihazDeviceForm({ vitrini, onSaved }: CihazDeviceFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const {
    shared,
    phone,
    tablet,
    computer,
    watch,
    console: consoleForm,
    updateShared,
    updatePhone,
    updateTablet,
    updateComputer,
    updateWatch,
    updateConsole,
    setDeviceCategory,
    setListingType,
    saveDevice,
    saving,
    editingDeviceId,
    cancelEditDevice,
  } = vitrini;

  const isUsed = shared.listing_type === "used";
  const category = shared.device_category;

  const activePhotos =
    category === "tablet"
      ? tablet.photo_uris
      : category === "computer"
        ? computer.photo_uris
        : category === "watch"
          ? watch.photo_uris
          : category === "console"
            ? consoleForm.photo_uris
            : phone.photo_uris;

  function setActivePhotos(uris: string[]) {
    if (category === "tablet") updateTablet({ photo_uris: uris });
    else if (category === "computer") updateComputer({ photo_uris: uris });
    else if (category === "watch") updateWatch({ photo_uris: uris });
    else if (category === "console") updateConsole({ photo_uris: uris });
    else updatePhone({ photo_uris: uris });
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    const result = await saveDevice();
    if (!result.success) {
      setError(result.error ?? "Kayıt başarısız.");
      return;
    }

    setSuccess(
      editingDeviceId ? "Cihaz güncellendi." : "Cihaz envantere eklendi."
    );
    onSaved?.();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-3xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-6"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <CihazSectionTitle>
            {editingDeviceId ? "Cihaz Düzenle" : "Yeni Cihaz Ekle"}
          </CihazSectionTitle>
          <p className="mt-1 text-sm text-slate-500">
            Telefon, tablet, bilgisayar, saat veya konsol kaydı oluşturun.
          </p>
        </div>
        {editingDeviceId && (
          <button
            type="button"
            onClick={cancelEditDevice}
            className="inline-flex min-h-10 items-center gap-1.5 rounded-full border border-slate-200 px-4 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
          >
            <X className="size-4" />
            İptal
          </button>
        )}
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {(Object.keys(DEVICE_CATEGORY_META) as DeviceCategory[]).map((cat) => {
          const Icon = CATEGORY_ICONS[cat];
          const active = category === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setDeviceCategory(cat)}
              className={cn(
                "inline-flex min-h-10 items-center gap-2 rounded-full border px-4 text-sm font-medium transition",
                active
                  ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
              )}
            >
              <Icon className="size-4" aria-hidden />
              {DEVICE_CATEGORY_META[cat].label}
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {(["used", "new"] as const).map((lt) => (
          <button
            key={lt}
            type="button"
            onClick={() => setListingType(lt)}
            className={cn(
              "inline-flex min-h-9 items-center rounded-full px-4 text-sm font-semibold transition",
              shared.listing_type === lt
                ? "bg-slate-900 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            )}
          >
            {LISTING_TYPE_LABEL[lt]}
          </button>
        ))}
      </div>

      <div className="mt-6 space-y-6">
        {category === "phone" && (
          <PhoneCategoryFields
            form={phone}
            isUsed={isUsed}
            onChange={updatePhone}
          />
        )}
        {category === "tablet" && (
          <TabletCategoryFields
            form={tablet}
            isUsed={isUsed}
            onChange={updateTablet}
          />
        )}
        {category === "computer" && (
          <ComputerCategoryFields
            form={computer}
            isUsed={isUsed}
            onChange={updateComputer}
          />
        )}
        {category === "watch" && (
          <WatchCategoryFields
            form={watch}
            isUsed={isUsed}
            onChange={updateWatch}
          />
        )}
        {category === "console" && (
          <ConsoleCategoryFields
            form={consoleForm}
            isUsed={isUsed}
            onChange={updateConsole}
          />
        )}

        <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
          <CihazSectionTitle>Fiyat & Ödeme</CihazSectionTitle>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <CihazField label="Alış Fiyatı (₺)">
              <CihazInput
                type="text"
                inputMode="decimal"
                value={shared.purchase_price}
                onChange={(e) =>
                  updateShared({ purchase_price: e.target.value })
                }
              />
            </CihazField>
            <CihazField label="Satış Fiyatı (₺) *">
              <CihazInput
                type="text"
                inputMode="decimal"
                value={shared.sale_price}
                onChange={(e) => updateShared({ sale_price: e.target.value })}
              />
            </CihazField>
            <CihazField label="Ödeme Yöntemi">
              <CihazSelect
                value={shared.payment_method}
                onChange={(e) =>
                  updateShared({
                    payment_method: e.target.value as typeof shared.payment_method,
                  })
                }
              >
                {PAYMENT_METHOD_OPTIONS.map((pm) => (
                  <option key={pm} value={pm}>
                    {pm}
                  </option>
                ))}
              </CihazSelect>
            </CihazField>
            {shared.payment_method === "Takas" && (
              <CihazField label="Takas Cihazı" className="sm:col-span-2">
                <CihazInput
                  value={shared.swap_device_name}
                  onChange={(e) =>
                    updateShared({ swap_device_name: e.target.value })
                  }
                />
              </CihazField>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
          <CihazSectionTitle>Ek Bilgiler</CihazSectionTitle>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <CihazField label="Notlar" className="sm:col-span-2">
              <CihazTextarea
                value={shared.notes}
                onChange={(e) => updateShared({ notes: e.target.value })}
              />
            </CihazField>
            <CihazCheckbox
              label="Kutu var"
              checked={shared.has_box}
              onChange={(checked) => updateShared({ has_box: checked })}
            />
            <CihazCheckbox
              label="Fatura var"
              checked={shared.has_invoice}
              onChange={(checked) => updateShared({ has_invoice: checked })}
            />
            {isUsed && category === "phone" && (
              <CihazCheckbox
                label="iCloud'dan çıkış yapıldı"
                checked={shared.icloud_signed_out}
                onChange={(checked) =>
                  updateShared({ icloud_signed_out: checked })
                }
              />
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
          <CihazSectionTitle>Fotoğraflar</CihazSectionTitle>
          <div className="mt-4">
            <CihazPhotoUploader
              photoUris={activePhotos}
              onChange={setActivePhotos}
              disabled={saving}
            />
          </div>
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </div>
      )}
      {success && (
        <div
          role="status"
          className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
        >
          {success}
        </div>
      )}

      <div className="mt-6 flex flex-wrap gap-2">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex min-h-11 items-center gap-2 rounded-full bg-emerald-600 px-6 text-sm font-bold text-white shadow-md shadow-emerald-600/20 transition hover:bg-emerald-700 disabled:opacity-60"
        >
          {saving ? (
            <Loader2 className="size-4 animate-spin" aria-hidden />
          ) : (
            <Save className="size-4" aria-hidden />
          )}
          {saving ? "Kaydediliyor…" : editingDeviceId ? "Güncelle" : "Kaydet"}
        </button>
      </div>
    </form>
  );
}
