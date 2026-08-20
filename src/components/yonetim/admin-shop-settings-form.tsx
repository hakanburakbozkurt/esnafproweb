"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useActionState, useState } from "react";
import {
  adminBtnPrimaryClass,
  adminPanelClass,
} from "@/components/yonetim/admin-ui";
import {
  updateAdminShopLocation,
  type AdminShopSettingsState,
} from "@/lib/dukkan/admin-shop-settings-actions";
import { formatCoordinate, readCompleteCoordinates } from "@/lib/dukkan/location";

const LocationMapPicker = dynamic(
  () =>
    import("@/components/dukkan/location-map-picker").then(
      (module) => module.LocationMapPicker
    ),
  {
    ssr: false,
    loading: () => (
      <div className="h-72 animate-pulse rounded-2xl border border-zinc-700 bg-zinc-800/60 sm:h-80" />
    ),
  }
);

type AdminShopLocationFormProps = {
  dukkan: {
    dukkan_adi: string;
    slug: string;
    enlem: number | null;
    boylam: number | null;
  } | null;
};

const initialState: AdminShopSettingsState = {};

export function AdminShopLocationForm({ dukkan }: AdminShopLocationFormProps) {
  const [state, formAction, isPending] = useActionState(
    updateAdminShopLocation,
    initialState
  );

  const [enlem, setEnlem] = useState<number | null>(dukkan?.enlem ?? null);
  const [boylam, setBoylam] = useState<number | null>(dukkan?.boylam ?? null);

  if (!dukkan) {
    return (
      <section className={adminPanelClass}>
        <h2 className="text-xl font-bold text-zinc-100">Dükkan Konumu</h2>
        <p className="mt-2 text-sm leading-relaxed text-zinc-400">
          Konum ayarlarını buradan yönetmek için önce bir dükkan oluşturmalısınız.
        </p>
        <Link href="/dukkan-ac" className={`${adminBtnPrimaryClass} mt-5`}>
          Dükkan Aç
        </Link>
      </section>
    );
  }

  return (
    <section className={adminPanelClass}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-400">
        Dükkan Ayarları
      </p>
      <h2 className="mt-2 text-xl font-bold text-zinc-100">Harita Konumu</h2>
      <p className="mt-2 text-sm leading-relaxed text-zinc-400">
        <span className="font-medium text-zinc-300">{dukkan.dukkan_adi}</span> vitrininde
        yol tarifi ve harita görünümü bu koordinatlara göre oluşturulur.
      </p>
      <p className="mt-1 text-xs text-zinc-500">
        Vitrin:{" "}
        <Link href={`/${dukkan.slug}`} className="text-indigo-400 hover:text-indigo-300">
          /{dukkan.slug}
        </Link>
        {" · "}
        <Link href="/dukkan-ayarlari" className="text-indigo-400 hover:text-indigo-300">
          Tüm dükkan ayarları
        </Link>
      </p>

      <form action={formAction} className="mt-6 space-y-5">
        <input type="hidden" name="enlem" value={enlem ?? ""} />
        <input type="hidden" name="boylam" value={boylam ?? ""} />

        <div>
          <p className="text-sm font-medium text-zinc-300">Dükkan Konumu</p>
          <p className="mt-1.5 text-xs text-zinc-500">
            Haritaya tıklayarak veya pini sürükleyerek işletmenizin tam konumunu işaretleyin.
          </p>
          <div className="mt-3">
            <LocationMapPicker
              enlem={enlem}
              boylam={boylam}
              onChange={(coords) => {
                setEnlem(coords?.enlem ?? null);
                setBoylam(coords?.boylam ?? null);
              }}
            />
          </div>
          {readCompleteCoordinates(enlem, boylam) && (
            <p className="mt-2 text-xs text-emerald-300">
              Konum: {formatCoordinate(enlem!)}, {formatCoordinate(boylam!)}
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <button type="submit" disabled={isPending} className={adminBtnPrimaryClass}>
            {isPending ? "Kaydediliyor…" : "Konumu Kaydet"}
          </button>
        </div>

        {state.error && (
          <p className="text-sm text-red-400" role="alert">
            {state.error}
          </p>
        )}
        {state.success && (
          <p className="text-sm text-emerald-400" role="status">
            {state.success}
          </p>
        )}
      </form>
    </section>
  );
}
