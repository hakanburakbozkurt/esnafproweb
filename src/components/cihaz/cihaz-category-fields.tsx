"use client";

import {
  resolveConsoleDriveOnModelChange,
  CONSOLE_BRANDS,
  CONSOLE_STORAGE_OPTIONS,
  getCasingOptionsForModel,
  getConsoleModelsForBrand,
  getDriveOptionsForBrand,
  hideDriveTypeField,
  showCasingTypeForModel,
  showDriveTypeForBrand,
} from "@/lib/cihaz/cihaz-console-catalog";
import {
  getWatchModelsForBrand,
  WATCH_BRANDS,
  WATCH_CASE_DIAMETER_OPTIONS,
  WATCH_CASE_MATERIAL_OPTIONS,
  WATCH_COLOR_OPTIONS,
} from "@/lib/cihaz/cihaz-watch-catalog";
import { WARRANTY_TYPE_OPTIONS } from "@/lib/cihaz/cihaz-warranty";
import type {
  ConsoleCategoryForm,
  ComputerCategoryForm,
  PhoneCategoryForm,
  TabletCategoryForm,
  WatchCategoryForm,
} from "@/lib/cihaz/use-cihaz-al-category-forms";
import {
  APPLE_IPAD_MODELS,
  APPLE_IPHONE_MODELS,
  APPLE_MAC_MODELS,
  KONDISYON_OPTIONS,
  PC_BRANDS,
  PC_COLOR_OPTIONS,
  PC_DISK_OPTIONS,
  PC_GPU_OPTIONS,
  PC_RAM_OPTIONS,
  PC_RESOLUTION_OPTIONS,
  PC_SCREEN_OPTIONS,
  PHONE_BRANDS,
  PHONE_COLOR_OPTIONS,
  PHONE_STORAGE_OPTIONS,
  TABLET_BRANDS,
  TABLET_COLOR_OPTIONS,
  TABLET_STORAGE_OPTIONS,
} from "@/lib/cihaz/types";
import {
  CihazField,
  CihazInput,
  CihazSelect,
  CihazTextarea,
  CihazCheckbox,
} from "@/components/cihaz/cihaz-form-ui";

function OptionList({
  options,
  placeholder,
}: {
  options: readonly string[];
  placeholder: string;
}) {
  return (
    <>
      <option value="">{placeholder}</option>
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </>
  );
}

export function PhoneCategoryFields({
  form,
  isUsed,
  onChange,
}: {
  form: PhoneCategoryForm;
  isUsed: boolean;
  onChange: (patch: Partial<PhoneCategoryForm>) => void;
}) {
  const isApple = form.brand === "Apple";

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <CihazField label="Marka *">
        <CihazSelect
          value={form.brand}
          onChange={(e) =>
            onChange({ brand: e.target.value, model: "", capacity: "" })
          }
        >
          <OptionList options={PHONE_BRANDS} placeholder="Seçin" />
        </CihazSelect>
      </CihazField>

      <CihazField label="Model *">
        {isApple ? (
          <CihazSelect
            value={form.model}
            onChange={(e) => onChange({ model: e.target.value })}
          >
            <OptionList options={APPLE_IPHONE_MODELS} placeholder="Seçin" />
          </CihazSelect>
        ) : (
          <CihazInput
            value={form.model}
            onChange={(e) => onChange({ model: e.target.value })}
            placeholder="Model adı"
          />
        )}
      </CihazField>

      <CihazField label="Kapasite">
        <CihazSelect
          value={form.capacity}
          onChange={(e) => onChange({ capacity: e.target.value })}
        >
          <OptionList options={PHONE_STORAGE_OPTIONS} placeholder="Seçin" />
        </CihazSelect>
      </CihazField>

      <CihazField label="Renk">
        <CihazSelect
          value={form.color}
          onChange={(e) => onChange({ color: e.target.value })}
        >
          <OptionList options={PHONE_COLOR_OPTIONS} placeholder="Seçin" />
        </CihazSelect>
      </CihazField>

      <CihazField label="IMEI">
        <CihazInput
          value={form.imei}
          onChange={(e) => onChange({ imei: e.target.value })}
          placeholder="15 haneli IMEI"
        />
      </CihazField>

      <CihazField label="Seri No">
        <CihazInput
          value={form.serial_no}
          onChange={(e) => onChange({ serial_no: e.target.value })}
        />
      </CihazField>

      <CihazField label="Garanti">
        <CihazSelect
          value={form.warranty_type}
          onChange={(e) => onChange({ warranty_type: e.target.value })}
        >
          <OptionList options={WARRANTY_TYPE_OPTIONS} placeholder="Seçin" />
        </CihazSelect>
      </CihazField>

      {isUsed && (
        <>
          <CihazField label="Kondisyon">
            <CihazSelect
              value={form.condition}
              onChange={(e) => onChange({ condition: e.target.value })}
            >
              <OptionList options={KONDISYON_OPTIONS} placeholder="Seçin" />
            </CihazSelect>
          </CihazField>

          <CihazField label="Pil Sağlığı (%)">
            <CihazInput
              value={form.battery_health}
              onChange={(e) => onChange({ battery_health: e.target.value })}
              placeholder="Örn. 87"
            />
          </CihazField>

          <CihazField label="Pil Döngüsü">
            <CihazInput
              value={form.battery_cycle_count}
              onChange={(e) =>
                onChange({ battery_cycle_count: e.target.value })
              }
            />
          </CihazField>

          <CihazField label="Değişen Parçalar" className="sm:col-span-2">
            <CihazTextarea
              value={form.changed_parts}
              onChange={(e) => onChange({ changed_parts: e.target.value })}
            />
          </CihazField>

          <CihazField label="Çalışmayan Özellikler" className="sm:col-span-2">
            <CihazTextarea
              value={form.non_working_features}
              onChange={(e) =>
                onChange({ non_working_features: e.target.value })
              }
            />
          </CihazField>
        </>
      )}
    </div>
  );
}

export function TabletCategoryFields({
  form,
  isUsed,
  onChange,
}: {
  form: TabletCategoryForm;
  isUsed: boolean;
  onChange: (patch: Partial<TabletCategoryForm>) => void;
}) {
  const isApple = form.brand === "Apple";

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <CihazField label="Marka *">
        <CihazSelect
          value={form.brand}
          onChange={(e) => onChange({ brand: e.target.value, model: "" })}
        >
          <OptionList options={TABLET_BRANDS} placeholder="Seçin" />
        </CihazSelect>
      </CihazField>

      <CihazField label="Model *">
        {isApple ? (
          <CihazSelect
            value={form.model}
            onChange={(e) => onChange({ model: e.target.value })}
          >
            <OptionList options={APPLE_IPAD_MODELS} placeholder="Seçin" />
          </CihazSelect>
        ) : (
          <CihazInput
            value={form.model}
            onChange={(e) => onChange({ model: e.target.value })}
          />
        )}
      </CihazField>

      <CihazField label="Kapasite">
        <CihazSelect
          value={form.capacity}
          onChange={(e) => onChange({ capacity: e.target.value })}
        >
          <OptionList options={TABLET_STORAGE_OPTIONS} placeholder="Seçin" />
        </CihazSelect>
      </CihazField>

      <CihazField label="Renk">
        <CihazSelect
          value={form.color}
          onChange={(e) => onChange({ color: e.target.value })}
        >
          <OptionList options={TABLET_COLOR_OPTIONS} placeholder="Seçin" />
        </CihazSelect>
      </CihazField>

      <CihazField label="Seri No">
        <CihazInput
          value={form.serial_no}
          onChange={(e) => onChange({ serial_no: e.target.value })}
        />
      </CihazField>

      <CihazField label="İşletim Sistemi">
        <CihazInput
          value={form.operating_system}
          onChange={(e) => onChange({ operating_system: e.target.value })}
        />
      </CihazField>

      <CihazField label="Garanti">
        <CihazSelect
          value={form.warranty_type}
          onChange={(e) => onChange({ warranty_type: e.target.value })}
        >
          <OptionList options={WARRANTY_TYPE_OPTIONS} placeholder="Seçin" />
        </CihazSelect>
      </CihazField>

      <div className="flex items-end">
        <CihazCheckbox
          label="SIM desteği"
          checked={form.sim_support}
          onChange={(checked) => onChange({ sim_support: checked })}
        />
      </div>

      {isUsed && (
        <>
          <CihazField label="Kondisyon">
            <CihazSelect
              value={form.condition}
              onChange={(e) => onChange({ condition: e.target.value })}
            >
              <OptionList options={KONDISYON_OPTIONS} placeholder="Seçin" />
            </CihazSelect>
          </CihazField>

          <CihazField label="Değişen Parçalar" className="sm:col-span-2">
            <CihazTextarea
              value={form.changed_parts}
              onChange={(e) => onChange({ changed_parts: e.target.value })}
            />
          </CihazField>
        </>
      )}
    </div>
  );
}

export function ComputerCategoryFields({
  form,
  isUsed,
  onChange,
}: {
  form: ComputerCategoryForm;
  isUsed: boolean;
  onChange: (patch: Partial<ComputerCategoryForm>) => void;
}) {
  const isApple = form.brand === "Apple Macbook";

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <CihazField label="Marka *">
        <CihazSelect
          value={form.brand}
          onChange={(e) => onChange({ brand: e.target.value, model: "" })}
        >
          <OptionList options={PC_BRANDS} placeholder="Seçin" />
        </CihazSelect>
      </CihazField>

      <CihazField label="Model *">
        {isApple ? (
          <CihazSelect
            value={form.model}
            onChange={(e) => onChange({ model: e.target.value })}
          >
            <OptionList options={APPLE_MAC_MODELS} placeholder="Seçin" />
          </CihazSelect>
        ) : (
          <CihazInput
            value={form.model}
            onChange={(e) => onChange({ model: e.target.value })}
          />
        )}
      </CihazField>

      <CihazField label="İşlemci">
        <CihazInput
          value={form.processor}
          onChange={(e) => onChange({ processor: e.target.value })}
        />
      </CihazField>

      <CihazField label="RAM">
        <CihazSelect
          value={form.ram}
          onChange={(e) => onChange({ ram: e.target.value })}
        >
          <OptionList options={PC_RAM_OPTIONS} placeholder="Seçin" />
        </CihazSelect>
      </CihazField>

      <CihazField label="HDD">
        <CihazSelect
          value={form.hdd}
          onChange={(e) => onChange({ hdd: e.target.value })}
        >
          <OptionList options={PC_DISK_OPTIONS} placeholder="Seçin" />
        </CihazSelect>
      </CihazField>

      <CihazField label="SSD">
        <CihazSelect
          value={form.ssd}
          onChange={(e) => onChange({ ssd: e.target.value })}
        >
          <OptionList options={PC_DISK_OPTIONS} placeholder="Seçin" />
        </CihazSelect>
      </CihazField>

      <CihazField label="Ekran Kartı">
        <CihazSelect
          value={form.gpu}
          onChange={(e) => onChange({ gpu: e.target.value })}
        >
          <OptionList options={PC_GPU_OPTIONS} placeholder="Seçin" />
        </CihazSelect>
      </CihazField>

      <CihazField label="Ekran Boyutu">
        <CihazSelect
          value={form.screen_size}
          onChange={(e) => onChange({ screen_size: e.target.value })}
        >
          <OptionList options={PC_SCREEN_OPTIONS} placeholder="Seçin" />
        </CihazSelect>
      </CihazField>

      <CihazField label="Çözünürlük">
        <CihazSelect
          value={form.resolution}
          onChange={(e) => onChange({ resolution: e.target.value })}
        >
          <OptionList options={PC_RESOLUTION_OPTIONS} placeholder="Seçin" />
        </CihazSelect>
      </CihazField>

      <CihazField label="Renk">
        <CihazSelect
          value={form.color}
          onChange={(e) => onChange({ color: e.target.value })}
        >
          <OptionList options={PC_COLOR_OPTIONS} placeholder="Seçin" />
        </CihazSelect>
      </CihazField>

      <CihazField label="Seri No">
        <CihazInput
          value={form.serial_no}
          onChange={(e) => onChange({ serial_no: e.target.value })}
        />
      </CihazField>

      <CihazField label="Garanti">
        <CihazSelect
          value={form.warranty_type}
          onChange={(e) => onChange({ warranty_type: e.target.value })}
        >
          <OptionList options={WARRANTY_TYPE_OPTIONS} placeholder="Seçin" />
        </CihazSelect>
      </CihazField>

      {isUsed && isApple && (
        <CihazField label="Pil Döngüsü">
          <CihazInput
            value={form.battery_cycle_count}
            onChange={(e) =>
              onChange({ battery_cycle_count: e.target.value })
            }
          />
        </CihazField>
      )}

      {isUsed && (
        <CihazField label="Kondisyon">
          <CihazSelect
            value={form.condition}
            onChange={(e) => onChange({ condition: e.target.value })}
          >
            <OptionList options={KONDISYON_OPTIONS} placeholder="Seçin" />
          </CihazSelect>
        </CihazField>
      )}
    </div>
  );
}

export function WatchCategoryFields({
  form,
  isUsed,
  onChange,
}: {
  form: WatchCategoryForm;
  isUsed: boolean;
  onChange: (patch: Partial<WatchCategoryForm>) => void;
}) {
  const models = getWatchModelsForBrand(form.brand);

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <CihazField label="Marka *">
        <CihazSelect
          value={form.brand}
          onChange={(e) => onChange({ brand: e.target.value, model: "" })}
        >
          <OptionList options={WATCH_BRANDS} placeholder="Seçin" />
        </CihazSelect>
      </CihazField>

      <CihazField label="Model *">
        <CihazSelect
          value={form.model}
          onChange={(e) => onChange({ model: e.target.value })}
        >
          <OptionList options={models} placeholder="Seçin" />
        </CihazSelect>
      </CihazField>

      <CihazField label="Kasa Çapı *">
        <CihazSelect
          value={form.case_diameter}
          onChange={(e) => onChange({ case_diameter: e.target.value })}
        >
          <OptionList
            options={WATCH_CASE_DIAMETER_OPTIONS}
            placeholder="Seçin"
          />
        </CihazSelect>
      </CihazField>

      <CihazField label="Renk">
        <CihazSelect
          value={form.color}
          onChange={(e) => onChange({ color: e.target.value })}
        >
          <OptionList options={WATCH_COLOR_OPTIONS} placeholder="Seçin" />
        </CihazSelect>
      </CihazField>

      <CihazField label="Kasa Malzemesi">
        <CihazSelect
          value={form.case_material}
          onChange={(e) => onChange({ case_material: e.target.value })}
        >
          <OptionList
            options={WATCH_CASE_MATERIAL_OPTIONS}
            placeholder="Seçin"
          />
        </CihazSelect>
      </CihazField>

      <CihazField label="Seri No">
        <CihazInput
          value={form.serial_no}
          onChange={(e) => onChange({ serial_no: e.target.value })}
        />
      </CihazField>

      <CihazField label="Garanti">
        <CihazSelect
          value={form.warranty_type}
          onChange={(e) => onChange({ warranty_type: e.target.value })}
        >
          <OptionList options={WARRANTY_TYPE_OPTIONS} placeholder="Seçin" />
        </CihazSelect>
      </CihazField>

      <div className="flex flex-col gap-3 sm:col-span-2 sm:flex-row">
        <CihazCheckbox
          label="Safir cam"
          checked={form.has_sapphire_glass}
          onChange={(checked) => onChange({ has_sapphire_glass: checked })}
        />
        <CihazCheckbox
          label="SIM / eSIM"
          checked={form.sim_support}
          onChange={(checked) => onChange({ sim_support: checked })}
        />
      </div>

      {isUsed && (
        <CihazField label="Kondisyon">
          <CihazSelect
            value={form.condition}
            onChange={(e) => onChange({ condition: e.target.value })}
          >
            <OptionList options={KONDISYON_OPTIONS} placeholder="Seçin" />
          </CihazSelect>
        </CihazField>
      )}
    </div>
  );
}

export function ConsoleCategoryFields({
  form,
  isUsed,
  onChange,
}: {
  form: ConsoleCategoryForm;
  isUsed: boolean;
  onChange: (patch: Partial<ConsoleCategoryForm>) => void;
}) {
  const models = getConsoleModelsForBrand(form.brand);
  const showCasing = showCasingTypeForModel(form.model);
  const showDrive =
    showDriveTypeForBrand(form.brand) &&
    !hideDriveTypeField(form.brand, form.model);

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <CihazField label="Marka *">
        <CihazSelect
          value={form.brand}
          onChange={(e) =>
            onChange({
              brand: e.target.value,
              model: "",
              casing_type: "",
              drive_type: "",
            })
          }
        >
          <OptionList options={CONSOLE_BRANDS} placeholder="Seçin" />
        </CihazSelect>
      </CihazField>

      <CihazField label="Model *">
        <CihazSelect
          value={form.model}
          onChange={(e) => {
            const model = e.target.value;
            onChange({
              model,
              casing_type: "",
              drive_type: resolveConsoleDriveOnModelChange(
                form.brand,
                model,
                form.drive_type
              ),
            });
          }}
        >
          <OptionList options={models} placeholder="Seçin" />
        </CihazSelect>
      </CihazField>

      {showCasing && (
        <CihazField label="Kasa Tipi">
          <CihazSelect
            value={form.casing_type}
            onChange={(e) => onChange({ casing_type: e.target.value })}
          >
            <OptionList
              options={getCasingOptionsForModel(form.model)}
              placeholder="Seçin"
            />
          </CihazSelect>
        </CihazField>
      )}

      {showDrive && (
        <CihazField label="Sürücü Tipi">
          <CihazSelect
            value={form.drive_type}
            onChange={(e) => onChange({ drive_type: e.target.value })}
          >
            <OptionList
              options={getDriveOptionsForBrand(form.brand)}
              placeholder="Seçin"
            />
          </CihazSelect>
        </CihazField>
      )}

      <CihazField label="Kapasite">
        <CihazSelect
          value={form.capacity}
          onChange={(e) => onChange({ capacity: e.target.value })}
        >
          <OptionList options={CONSOLE_STORAGE_OPTIONS} placeholder="Seçin" />
        </CihazSelect>
      </CihazField>

      <CihazField label="Seri No">
        <CihazInput
          value={form.serial_no}
          onChange={(e) => onChange({ serial_no: e.target.value })}
        />
      </CihazField>

      <CihazField label="Garanti">
        <CihazSelect
          value={form.warranty_type}
          onChange={(e) => onChange({ warranty_type: e.target.value })}
        >
          <OptionList options={WARRANTY_TYPE_OPTIONS} placeholder="Seçin" />
        </CihazSelect>
      </CihazField>

      {isUsed && (
        <CihazField label="Kondisyon">
          <CihazSelect
            value={form.condition}
            onChange={(e) => onChange({ condition: e.target.value })}
          >
            <OptionList options={KONDISYON_OPTIONS} placeholder="Seçin" />
          </CihazSelect>
        </CihazField>
      )}
    </div>
  );
}
