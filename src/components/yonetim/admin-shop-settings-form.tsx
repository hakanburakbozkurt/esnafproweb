"use client";

import Link from "next/link";
import { useActionState, useMemo, useState } from "react";
import { GoogleMapsManualInputHint } from "@/components/dukkan/google-place-id-info-hint";
import {
  adminBtnPrimaryClass,
  adminInputClass,
  adminPanelClass,
} from "@/components/yonetim/admin-ui";
import {
  updateAdminShopGoogleReviews,
  type AdminShopSettingsState,
} from "@/lib/dukkan/admin-shop-settings-actions";
import { GOOGLE_BUSINESS_PROFILE_LABEL } from "@/lib/google-reviews/constants";
import {
  buildGoogleMapsPlaceUrl,
  parseGoogleMapsInput,
} from "@/lib/google-reviews/place-id";
import { cn } from "@/lib/utils/cn";

type AdminShopSettingsFormProps = {
  dukkan: {
    dukkan_adi: string;
    slug: string;
    google_place_id: string | null;
    google_reviews_enabled: boolean;
  } | null;
};

const initialState: AdminShopSettingsState = {};

export function AdminShopSettingsForm({ dukkan }: AdminShopSettingsFormProps) {
  const [state, formAction, isPending] = useActionState(
    updateAdminShopGoogleReviews,
    initialState
  );

  const [googleReviewsEnabled, setGoogleReviewsEnabled] = useState(
    dukkan?.google_reviews_enabled ?? false
  );
  const [googleMapsReference, setGoogleMapsReference] = useState(() => {
    if (dukkan?.google_place_id) {
      return buildGoogleMapsPlaceUrl(dukkan.google_place_id);
    }
    return "";
  });

  const parsedGooglePlaceId = useMemo(
    () => parseGoogleMapsInput(googleMapsReference),
    [googleMapsReference]
  );

  const googleMapsReferenceValidationError =
    googleReviewsEnabled && googleMapsReference.trim() && !parsedGooglePlaceId
      ? "Geçerli bir Google Maps linki veya Place ID (ChIJ...) girin."
      : null;

  if (!dukkan) {
    return (
      <section className={adminPanelClass}>
        <h2 className="text-xl font-bold text-zinc-100">Dükkan Ayarları</h2>
        <p className="mt-2 text-sm leading-relaxed text-zinc-400">
          Google yorum ayarlarını buradan yönetmek için önce bir dükkan oluşturmalısınız.
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
      <h2 className="mt-2 text-xl font-bold text-zinc-100">Google Yorumları</h2>
      <p className="mt-2 text-sm leading-relaxed text-zinc-400">
        <span className="font-medium text-zinc-300">{dukkan.dukkan_adi}</span> vitrininde{" "}
        {GOOGLE_BUSINESS_PROFILE_LABEL} puanı ve yorumlarını gösterin.
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
        <input type="hidden" name="google_reviews_enabled" value={googleReviewsEnabled ? "true" : "false"} />

        <button
          type="button"
          role="switch"
          aria-checked={googleReviewsEnabled}
          onClick={() => setGoogleReviewsEnabled((prev) => !prev)}
          disabled={isPending}
          className="flex w-full items-center justify-between gap-4 rounded-xl border border-zinc-700 bg-zinc-800/60 px-4 py-4 text-left transition hover:border-zinc-600 disabled:opacity-60"
        >
          <span>
            <span className="block text-sm font-semibold text-zinc-100">
              Google yorum widget&apos;ını vitrinde göster
            </span>
            <span className="mt-1 block text-xs text-zinc-500">
              Aktifken vitrinde Google kaynaklı yorumlar ve atıf metni görünür.
            </span>
          </span>
          <span
            className={`relative inline-flex h-7 w-12 shrink-0 rounded-full transition ${
              googleReviewsEnabled ? "bg-indigo-600" : "bg-zinc-600"
            }`}
            aria-hidden
          >
            <span
              className={`absolute top-0.5 size-6 rounded-full bg-white shadow transition ${
                googleReviewsEnabled ? "left-[22px]" : "left-0.5"
              }`}
            />
          </span>
        </button>

        <GoogleMapsManualInputHint
          visible={googleReviewsEnabled && !parsedGooglePlaceId}
        />

        {parsedGooglePlaceId && googleReviewsEnabled && (
          <div className="flex flex-wrap items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-950/30 px-4 py-3">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-950/50 px-3 py-1 text-xs font-semibold text-emerald-300">
              Bağlandı
            </span>
            <span className="font-mono text-xs text-emerald-200">{parsedGooglePlaceId}</span>
          </div>
        )}

        <div>
          <label htmlFor="google_maps_reference" className="text-sm font-medium text-zinc-300">
            Google Maps linki veya Place ID
          </label>
          <textarea
            id="google_maps_reference"
            name="google_maps_reference"
            rows={3}
            placeholder="https://maps.google.com/... veya ChIJ..."
            value={googleMapsReference}
            onChange={(event) => setGoogleMapsReference(event.target.value)}
            disabled={!googleReviewsEnabled || isPending}
            aria-invalid={googleMapsReferenceValidationError ? true : undefined}
            className={cn(adminInputClass, "resize-y font-mono")}
          />
          <p className="mt-1.5 text-xs text-zinc-500">
            İşletme sayfanızın paylaşım linkini veya ChIJ... Place ID değerini yapıştırın.
          </p>
          {googleMapsReferenceValidationError && (
            <p className="mt-2 text-sm text-red-400" role="alert">
              {googleMapsReferenceValidationError}
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <button
            type="submit"
            disabled={
              isPending ||
              Boolean(googleMapsReferenceValidationError) ||
              (googleReviewsEnabled && !parsedGooglePlaceId)
            }
            className={adminBtnPrimaryClass}
          >
            {isPending ? "Kaydediliyor…" : "Google Ayarlarını Kaydet"}
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
