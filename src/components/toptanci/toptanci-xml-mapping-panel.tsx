"use client";

import { useActionState } from "react";
import {
  saveFeedMappingAndImportAction,
  saveFeedMappingAction,
  type FeedMappingActionState,
} from "@/app/yonetim/toptanci/xml/actions";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { VITRIN_XML_PANEL_FIELDS } from "@/lib/toptanci/vitrin-import/vitrinXmlMappingFields";

const initialState: FeedMappingActionState = {};

type Props = {
  mappingDefaults: Record<string, string>;
  savedFeedUrl?: string | null;
};

export function ToptanciXmlMappingPanel({ mappingDefaults, savedFeedUrl }: Props) {
  const [saveState, saveAction, savePending] = useActionState(
    saveFeedMappingAction,
    initialState
  );
  const [importState, importAction, importPending] = useActionState(
    saveFeedMappingAndImportAction,
    initialState
  );

  const isBusy = savePending || importPending;
  const lastState = importPending || importState.success || importState.error ? importState : saveState;

  return (
    <form action={saveAction} className="space-y-4">
      <p className="text-sm text-slate-500">
        XML dosyanızdaki etiket yolunu (tag) sistem alanlarıyla eşleştirin. JSON feed
        (Azunlar vb.) otomatik sağlayıcı şeması kullanır; bu panel XML import için geçerlidir.
      </p>

      {VITRIN_XML_PANEL_FIELDS.map((field) => (
        <div
          key={field.key}
          className="grid grid-cols-1 items-start gap-2 sm:grid-cols-2 sm:gap-4"
        >
          <div>
            <span className="text-sm font-medium text-slate-700">
              {field.label}
              {field.required ? " *" : ""}
            </span>
            {field.hint && (
              <p className="mt-0.5 text-xs text-slate-400">→ {field.hint}</p>
            )}
          </div>
          <Input
            name={`mapping_${field.key}`}
            defaultValue={mappingDefaults[field.key] ?? field.placeholder ?? ""}
            placeholder={field.placeholder}
          />
        </div>
      ))}

      <Field
        label="Feed URL"
        hint="Kayıtlı feed adresinden eşleme ile yeniden içe aktarır"
      >
        <Input
          name="feed_url"
          type="url"
          defaultValue={savedFeedUrl ?? ""}
          placeholder="https://ornek-toptanci.com/export/feed.xml"
        />
      </Field>

      {lastState.error && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{lastState.error}</p>
      )}

      {lastState.success && lastState.message && (
        <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {lastState.message}
        </p>
      )}

      <div className="flex flex-col gap-3 border-t border-slate-200 pt-4 sm:flex-row">
        <Button type="submit" disabled={isBusy} className="min-h-11 flex-1">
          {savePending ? "Kaydediliyor…" : "Eşleme Ayarlarını Kaydet"}
        </Button>
        <Button
          type="submit"
          formAction={importAction}
          disabled={isBusy}
          className="min-h-11 flex-1"
        >
          {importPending ? "İçe aktarılıyor…" : "Kaydet ve Feed'den Verileri Çek"}
        </Button>
      </div>
    </form>
  );
}
