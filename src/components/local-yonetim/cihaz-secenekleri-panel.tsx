"use client";

import { Trash2 } from "lucide-react";
import { useActionState, useState, useTransition } from "react";
import {
  localAlertErrorClass,
  localBtnPrimaryClass,
  localBtnSmallDangerClass,
  localCardClass,
  localHintClass,
  localInputClass,
  localLabelClass,
  localSelectClass,
} from "@/components/local-yonetim/local-admin-ui";
import {
  addCihazSecenek,
  deleteCihazSecenek,
  type CihazSecenekState,
} from "@/lib/cihaz/cihaz-secenek-actions";
import {
  SECENEK_KATEGORILERI,
  SECENEK_KATEGORI_ETIKETLERI,
  SECENEK_TURLERI,
  SECENEK_TUR_ETIKETLERI,
  type CihazSecenekRow,
  type SecenekKategori,
  type SecenekTuru,
} from "@/lib/cihaz/secenekler";

const initialState: CihazSecenekState = {};

export function CihazSecenekleriPanel({
  rows,
  canEdit,
}: {
  rows: CihazSecenekRow[];
  canEdit: boolean;
}) {
  const [kategori, setKategori] = useState<SecenekKategori>("telefon");
  const [tur, setTur] = useState<SecenekTuru>("renk");
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleting, startDelete] = useTransition();
  const [addState, addAction, isAdding] = useActionState(addCihazSecenek, initialState);

  const liste = rows.filter((row) => row.kategori === kategori && row.tur === tur);

  function handleDelete(id: string) {
    setDeleteError(null);
    startDelete(async () => {
      const result = await deleteCihazSecenek(id);
      if (result.error) setDeleteError(result.error);
    });
  }

  return (
    <div className="space-y-5">
      <div className={`${localCardClass} space-y-4`}>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="space-y-1.5">
            <span className={localLabelClass}>Kategori</span>
            <select
              className={localSelectClass}
              value={kategori}
              onChange={(e) => setKategori(e.target.value as SecenekKategori)}
            >
              {SECENEK_KATEGORILERI.map((item) => (
                <option key={item} value={item}>
                  {SECENEK_KATEGORI_ETIKETLERI[item]}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1.5">
            <span className={localLabelClass}>Tür</span>
            <select
              className={localSelectClass}
              value={tur}
              onChange={(e) => setTur(e.target.value as SecenekTuru)}
            >
              {SECENEK_TURLERI.map((item) => (
                <option key={item} value={item}>
                  {SECENEK_TUR_ETIKETLERI[item]}
                </option>
              ))}
            </select>
          </label>
        </div>

        {liste.length === 0 ? (
          <p className={localHintClass}>
            Bu alan için kayıt yok. Formda sabit liste kullanılıyor.
          </p>
        ) : (
          <ul className="flex flex-wrap gap-2">
            {liste.map((row) => (
              <li
                key={row.id}
                className="inline-flex items-center gap-2 rounded-full border border-neutral-700 px-3 py-1.5 text-sm"
              >
                <span>{row.deger}</span>
                {canEdit && (
                  <button
                    type="button"
                    onClick={() => handleDelete(row.id)}
                    disabled={isDeleting}
                    aria-label={`${row.deger} değerini sil`}
                    className={localBtnSmallDangerClass}
                  >
                    <Trash2 className="size-3.5" aria-hidden />
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}

        {deleteError && <p className={localAlertErrorClass}>{deleteError}</p>}
      </div>

      {canEdit ? (
        <form action={addAction} className={`${localCardClass} space-y-3`}>
          <input type="hidden" name="kategori" value={kategori} />
          <input type="hidden" name="tur" value={tur} />
          <label className="block space-y-1.5">
            <span className={localLabelClass}>Yeni değer</span>
            <input
              name="deger"
              required
              maxLength={80}
              placeholder="Örn. Lacivert"
              className={localInputClass}
            />
          </label>
          {addState.error && <p className={localAlertErrorClass}>{addState.error}</p>}
          <button type="submit" disabled={isAdding} className={localBtnPrimaryClass}>
            {isAdding ? "Ekleniyor…" : "Ekle"}
          </button>
        </form>
      ) : (
        <p className={localHintClass}>Seçenekleri yalnızca süper admin düzenleyebilir.</p>
      )}
    </div>
  );
}
