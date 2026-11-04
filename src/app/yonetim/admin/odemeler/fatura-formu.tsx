"use client";

import { useActionState } from "react";
import { adminBtnPrimaryClass, adminBtnSecondaryClass, adminInputClass } from "@/components/yonetim/admin-ui";
import { faturaDurumuGuncelle, type FaturaGuncelleState } from "@/lib/abonelik/admin-odeme-actions";

const initialState: FaturaGuncelleState = {};

export function FaturaFormu({
  odemeId,
  faturaDurumu,
  faturaNo,
}: {
  odemeId: string;
  faturaDurumu: string;
  faturaNo: string | null;
}) {
  const [state, formAction, isPending] = useActionState(faturaDurumuGuncelle, initialState);

  if (faturaDurumu === "kesildi") {
    return (
      <form action={formAction} className="flex flex-wrap items-center gap-2">
        <input type="hidden" name="odeme_id" value={odemeId} />
        <input type="hidden" name="kesildi" value="false" />
        <span className="text-sm text-emerald-400">Kesildi · {faturaNo}</span>
        <button type="submit" disabled={isPending} className={adminBtnSecondaryClass}>
          Geri al
        </button>
        {state.error && <span className="text-xs text-red-400">{state.error}</span>}
      </form>
    );
  }

  return (
    <form action={formAction} className="flex flex-wrap items-center gap-2">
      <input type="hidden" name="odeme_id" value={odemeId} />
      <input type="hidden" name="kesildi" value="true" />
      <input name="fatura_no" placeholder="Fatura no" required className={`${adminInputClass} w-40`} />
      <button type="submit" disabled={isPending} className={adminBtnPrimaryClass}>
        {isPending ? "…" : "Kesildi"}
      </button>
      {state.error && <span className="text-xs text-red-400">{state.error}</span>}
      {state.success && <span className="text-xs text-emerald-400">{state.success}</span>}
    </form>
  );
}
