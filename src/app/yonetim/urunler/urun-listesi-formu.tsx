"use client";

import { useActionState, useMemo, useState } from "react";
import { UrunListManager } from "@/components/dukkan/urunler/urun-list-manager";
import {
  updateDukkanUrunleri,
  type DukkanUrunleriFormState,
} from "@/lib/dukkan/urun-actions";
import type { DukkanUrunu } from "@/types/database.types";

const initialState: DukkanUrunleriFormState = {};

function hashString(value: string): string {
  let hash = 5381;
  for (let i = 0; i < value.length; i += 1) {
    hash = ((hash << 5) + hash + value.charCodeAt(i)) | 0;
  }
  return (hash >>> 0).toString(36);
}

/** Vitrin ürünleri sekmesi — kaydetme akışı ve liste yöneticisi. */
export function UrunListesiFormu({
  dukkanId,
  shopSlug,
  urunler,
  loadError,
}: {
  dukkanId: string;
  shopSlug: string;
  urunler: DukkanUrunu[];
  loadError: string | null;
}) {
  const [state, formAction, isPending] = useActionState(updateDukkanUrunleri, initialState);
  const [resetCount, setResetCount] = useState(0);
  /** Kayıt sonrası sunucudan gelen ürünler değişince liste yeni verilerle kurulur. */
  const dataKey = useMemo(() => hashString(JSON.stringify(urunler)), [urunler]);

  return (
    <div className="space-y-5">
      {loadError && (
        <p
          role="alert"
          className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600"
        >
          {loadError}
        </p>
      )}

      {state.success && (
        <p className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          Ürünler kaydedildi ({state.savedCount ?? 0} ürün vitrinde).
        </p>
      )}

      {state.warning && (
        <p className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {state.warning}
        </p>
      )}

      <UrunListManager
        key={`${dataKey}-${resetCount}`}
        dukkanId={dukkanId}
        storeSlug={shopSlug}
        defaultUrunler={urunler}
        action={formAction}
        isPending={isPending}
        error={state.error}
        saved={Boolean(state.success)}
        onCancel={() => setResetCount((count) => count + 1)}
      />
    </div>
  );
}
