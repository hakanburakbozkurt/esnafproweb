"use client";

import { Pencil, Search, X } from "lucide-react";
import { useActionState, useEffect, useMemo, useState } from "react";
import {
  localAccentLabelClass,
  localAlertErrorClass,
  localAlertInfoClass,
  localAlertSuccessClass,
  localBtnPrimaryClass,
  localBtnSecondaryClass,
  localCheckboxClass,
  localHintClass,
  localInputClass,
  localLabelClass,
  localTextareaClass,
  localWorkspaceSectionClass,
} from "@/components/local-yonetim/local-admin-ui";
import { LocalAuthNotice } from "@/components/local-yonetim/local-auth-notice";
import {
  seedDefaultPlatformPageSeoForm,
  upsertPlatformPageSeoForm,
} from "@/lib/seo/platform-seo-actions";
import type {
  PlatformPageSeoAdminRow,
  PlatformSeoAdminState,
} from "@/lib/seo/platform-page-seo.types";
import {
  SEO_DESCRIPTION_IDEAL_MAX,
  SEO_DESCRIPTION_IDEAL_MIN,
  SEO_TITLE_IDEAL_MAX,
  SEO_TITLE_IDEAL_MIN,
} from "@/lib/seo/platform-page-seo.types";
import { cn } from "@/lib/utils/cn";

const initialState: PlatformSeoAdminState = {};

type LocalSeoClientProps = {
  rows: PlatformPageSeoAdminRow[];
  canEdit: boolean;
  loadError?: string;
};

function lengthBadge(length: number, idealMin: number, idealMax: number) {
  if (length >= idealMin && length <= idealMax) {
    return "bg-emerald-50 text-emerald-700";
  }
  if (length === 0) {
    return "bg-red-50 text-red-700";
  }
  return "bg-amber-50 text-amber-800";
}

function SeoEditModal({
  row,
  canEdit,
  onClose,
}: {
  row: PlatformPageSeoAdminRow;
  canEdit: boolean;
  onClose: () => void;
}) {
  const [state, formAction, isPending] = useActionState(
    upsertPlatformPageSeoForm,
    initialState
  );

  useEffect(() => {
    if (state.success) {
      onClose();
    }
  }, [state.success, onClose]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="seo-edit-title"
    >
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-neutral-100 bg-white p-6 shadow-xl sm:p-8">
        <div className="flex items-start justify-between gap-4 border-b border-neutral-100 pb-4">
          <div>
            <p className={localAccentLabelClass}>SEO Düzenle</p>
            <h2 id="seo-edit-title" className="mt-1 text-xl font-bold text-neutral-900">
              {row.label}
            </h2>
            <p className="mt-1 font-mono text-xs text-neutral-500">{row.page_path}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex size-9 items-center justify-center rounded-full border border-neutral-200 text-neutral-500 transition hover:bg-neutral-50"
            aria-label="Kapat"
          >
            <X className="size-4" />
          </button>
        </div>

        <form action={formAction} className="mt-5 space-y-4">
          <input type="hidden" name="page_path" value={row.page_path} />
          <input type="hidden" name="label" value={row.label} />
          <input type="hidden" name="sort_order" value={row.sort_order} />

          <div>
            <label className={localLabelClass} htmlFor="meta_title">
              Meta title
            </label>
            <input
              id="meta_title"
              name="meta_title"
              defaultValue={row.meta_title}
              required
              disabled={!canEdit}
              maxLength={120}
              className={localInputClass}
            />
            <p className={localHintClass}>
              Önerilen: {SEO_TITLE_IDEAL_MIN}–{SEO_TITLE_IDEAL_MAX} karakter
            </p>
          </div>

          <div>
            <label className={localLabelClass} htmlFor="meta_description">
              Meta description
            </label>
            <textarea
              id="meta_description"
              name="meta_description"
              rows={4}
              defaultValue={row.meta_description}
              required
              disabled={!canEdit}
              maxLength={320}
              className={cn(localTextareaClass, "min-h-[110px]")}
            />
            <p className={localHintClass}>
              Önerilen: {SEO_DESCRIPTION_IDEAL_MIN}–{SEO_DESCRIPTION_IDEAL_MAX} karakter
            </p>
          </div>

          <div>
            <label className={localLabelClass} htmlFor="meta_keywords">
              Anahtar kelimeler
            </label>
            <input
              id="meta_keywords"
              name="meta_keywords"
              defaultValue={row.meta_keywords ?? ""}
              disabled={!canEdit}
              maxLength={500}
              placeholder="virgülle ayırın: esnafpro, dijital vitrin, yerel seo"
              className={localInputClass}
            />
          </div>

          <div className="flex flex-wrap gap-5 rounded-2xl border border-neutral-100 bg-neutral-50/70 px-4 py-3">
            <label className="flex cursor-pointer items-center gap-2 text-sm text-neutral-700">
              <input
                type="checkbox"
                name="robots_index"
                value="true"
                defaultChecked={row.robots_index}
                disabled={!canEdit}
                className={localCheckboxClass}
              />
              index
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-sm text-neutral-700">
              <input
                type="checkbox"
                name="robots_follow"
                value="true"
                defaultChecked={row.robots_follow}
                disabled={!canEdit}
                className={localCheckboxClass}
              />
              follow
            </label>
          </div>

          {state.error && <p className={localAlertErrorClass}>{state.error}</p>}
          {state.success && <p className={localAlertSuccessClass}>{state.success}</p>}

          {canEdit && (
            <div className="flex flex-wrap gap-2 pt-2">
              <button type="submit" disabled={isPending} className={localBtnPrimaryClass}>
                {isPending ? "Kaydediliyor…" : "Kaydet"}
              </button>
              <button type="button" onClick={onClose} className={localBtnSecondaryClass}>
                Vazgeç
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

function SeedDefaultsButton({ canEdit }: { canEdit: boolean }) {
  const [state, formAction, isPending] = useActionState(
    seedDefaultPlatformPageSeoForm,
    initialState
  );

  if (!canEdit) return null;

  return (
    <form action={formAction}>
      <button type="submit" disabled={isPending} className={localBtnSecondaryClass}>
        {isPending ? "Yükleniyor…" : "Varsayılan SEO'yu Yükle"}
      </button>
      {state.error && <p className="mt-2 text-sm text-red-600">{state.error}</p>}
      {state.success && <p className="mt-2 text-sm text-emerald-700">{state.success}</p>}
    </form>
  );
}

export function LocalSeoClient({ rows, canEdit, loadError }: LocalSeoClientProps) {
  const [editing, setEditing] = useState<PlatformPageSeoAdminRow | null>(null);

  const persistedCount = useMemo(
    () => rows.filter((row) => row.isPersisted).length,
    [rows]
  );

  return (
    <div className="space-y-8">
      <header className="space-y-4 border-b border-neutral-100 pb-6">
        <p className={localAccentLabelClass}>Arama & Meta</p>
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
          SEO yönetimi
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-neutral-600">
          EsnafPRO çekirdek sayfalarının title, description, keywords ve robots
          yönergelerini Supabase üzerinden yönetin.
        </p>

        <LocalAuthNotice canEdit={canEdit} nextPath="/local-yonetim/seo" />

        {loadError && (
          <p className={localAlertErrorClass}>
            Veritabanı hatası: {loadError}. Migration uygulandığından ve süper admin
            oturumunuzun açık olduğundan emin olun.
          </p>
        )}

        <div
          className={cn(
            localWorkspaceSectionClass,
            "flex flex-col gap-4 border-emerald-100 bg-emerald-50/40 sm:flex-row sm:items-center sm:justify-between"
          )}
        >
          <div>
            <p className="text-sm font-semibold text-emerald-900">Katalog durumu</p>
            <p className="mt-1 text-sm text-emerald-800/80">
              {persistedCount}/{rows.length} sayfa Supabase&apos;te kayıtlı
            </p>
          </div>
          <SeedDefaultsButton canEdit={canEdit} />
        </div>
      </header>

      <section className={localWorkspaceSectionClass}>
        <div className="overflow-x-auto rounded-2xl border border-neutral-100">
          <table className="min-w-full divide-y divide-neutral-100 text-sm">
            <thead className="bg-neutral-50/80">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-neutral-700">Sayfa</th>
                <th className="px-4 py-3 text-left font-semibold text-neutral-700">Title</th>
                <th className="hidden px-4 py-3 text-left font-semibold text-neutral-700 md:table-cell">
                  Description
                </th>
                <th className="px-4 py-3 text-left font-semibold text-neutral-700">Robots</th>
                <th className="px-4 py-3 text-right font-semibold text-neutral-700">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 bg-white">
              {rows.map((row) => {
                const titleLen = row.meta_title.length;
                const descLen = row.meta_description.length;

                return (
                  <tr key={row.page_path} className="hover:bg-emerald-50/30">
                    <td className="px-4 py-4 align-top">
                      <p className="font-medium text-neutral-900">{row.label}</p>
                      <p className="mt-0.5 font-mono text-xs text-neutral-500">{row.page_path}</p>
                      {!row.isPersisted && (
                        <span className="mt-2 inline-flex rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-800">
                          Fallback
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4 align-top">
                      <p className="line-clamp-2 text-neutral-800">{row.meta_title}</p>
                      <span
                        className={cn(
                          "mt-2 inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold tabular-nums",
                          lengthBadge(titleLen, SEO_TITLE_IDEAL_MIN, SEO_TITLE_IDEAL_MAX)
                        )}
                      >
                        {titleLen} karakter
                      </span>
                    </td>
                    <td className="hidden px-4 py-4 align-top md:table-cell">
                      <p className="line-clamp-2 text-neutral-600">{row.meta_description}</p>
                      <span
                        className={cn(
                          "mt-2 inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold tabular-nums",
                          lengthBadge(
                            descLen,
                            SEO_DESCRIPTION_IDEAL_MIN,
                            SEO_DESCRIPTION_IDEAL_MAX
                          )
                        )}
                      >
                        {descLen} karakter
                      </span>
                    </td>
                    <td className="px-4 py-4 align-top">
                      <p className="text-xs text-neutral-600">
                        index: {row.robots_index ? "evet" : "hayır"}
                      </p>
                      <p className="text-xs text-neutral-600">
                        follow: {row.robots_follow ? "evet" : "hayır"}
                      </p>
                    </td>
                    <td className="px-4 py-4 align-top text-right">
                      <button
                        type="button"
                        onClick={() => setEditing(row)}
                        className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-700 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
                      >
                        <Pencil className="size-3.5" aria-hidden />
                        Düzenle
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {rows.length === 0 && (
          <p className={cn("mt-4", localAlertInfoClass)}>
            Katalog boş. Varsayılan SEO&apos;yu yükleyerek başlayın.
          </p>
        )}
      </section>

      {editing && (
        <SeoEditModal
          row={editing}
          canEdit={canEdit}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}
