"use client";

import { ChevronDown, HelpCircle, Plus } from "lucide-react";
import { useActionState, useState, type ReactNode } from "react";
import {
  localAccentLabelClass,
  localAlertErrorClass,
  localAlertInfoClass,
  localAlertSuccessClass,
  localBtnPrimaryClass,
  localBtnSecondaryClass,
  localBtnSmallDangerClass,
  localBtnSmallSecondaryClass,
  localCheckboxClass,
  localHintClass,
  localInputClass,
  localLabelClass,
  localSectionTitleClass,
  localTextareaClass,
  localWorkspaceSectionClass,
} from "@/components/local-yonetim/local-admin-ui";
import { LocalAuthNotice } from "@/components/local-yonetim/local-auth-notice";
import {
  deleteFaqForm,
  moveFaqForm,
  seedAllDefaultFaqsForm,
  seedDefaultFaqsForm,
  upsertFaq,
  type FaqAdminState,
} from "@/lib/faqs/faq-actions";
import { DEFAULT_FAQ_SEED_COUNT } from "@/lib/faqs/defaults";
import {
  FAQ_CONTEXT_LABELS,
  type FaqContext,
  type PlatformFaq,
} from "@/lib/faqs/types";
import { cn } from "@/lib/utils/cn";

const initialState: FaqAdminState = {};

type LocalFaqClientProps = {
  faqs: PlatformFaq[];
  canEdit: boolean;
  loadError?: string;
  counts: { anasayfa: number; fiyatlandirma: number };
};

function LocalField({
  label,
  children,
  hint,
}: {
  label: string;
  children: ReactNode;
  hint?: string;
}) {
  return (
    <div>
      <label className={localLabelClass}>{label}</label>
      {children}
      {hint && <p className={localHintClass}>{hint}</p>}
    </div>
  );
}

function SeedAllButton({ canEdit }: { canEdit: boolean }) {
  const [state, formAction, isPending] = useActionState(
    seedAllDefaultFaqsForm,
    initialState
  );

  if (!canEdit) return null;

  return (
    <form action={formAction} className="space-y-2">
      <button type="submit" disabled={isPending} className={localBtnPrimaryClass}>
        {isPending ? "Yükleniyor…" : "Varsayılan SSS'leri Yükle"}
      </button>
      {state.error && <p className={localAlertErrorClass}>{state.error}</p>}
      {state.success && <p className={localAlertSuccessClass}>{state.success}</p>}
    </form>
  );
}

function FaqAccordionItem({
  faq,
  index,
  total,
  canEdit,
}: {
  faq: PlatformFaq;
  index: number;
  total: number;
  canEdit: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(upsertFaq, initialState);
  const [deleteState, deleteAction, deletePending] = useActionState(
    deleteFaqForm,
    initialState
  );
  const [moveState, moveAction, movePending] = useActionState(moveFaqForm, initialState);

  return (
    <div className="overflow-hidden rounded-2xl border border-neutral-100 bg-neutral-50/40">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-start justify-between gap-3 px-4 py-4 text-left transition hover:bg-emerald-50/60 sm:px-5"
        aria-expanded={open}
      >
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-emerald-600">
              SSS {index + 1}
            </span>
            {!faq.is_active && (
              <span className="rounded-full bg-neutral-200 px-2 py-0.5 text-[10px] font-semibold text-neutral-600">
                Taslak
              </span>
            )}
          </div>
          <p className="mt-1 line-clamp-2 text-sm font-medium text-neutral-900">{faq.soru}</p>
        </div>
        <ChevronDown
          className={cn(
            "mt-0.5 size-5 shrink-0 text-neutral-400 transition-transform",
            open && "rotate-180 text-emerald-600"
          )}
          aria-hidden
        />
      </button>

      {open && (
        <div className="border-t border-neutral-100 bg-white px-4 py-4 sm:px-5">
          <form action={formAction} className="space-y-4">
            <input type="hidden" name="id" value={faq.id} />
            <input type="hidden" name="sort_order" value={faq.sort_order} />
            <input type="hidden" name="context" value={faq.context} />

            <label className="flex cursor-pointer items-center gap-2 text-xs text-neutral-600">
              <input
                type="checkbox"
                name="is_active"
                value="true"
                defaultChecked={faq.is_active}
                disabled={!canEdit}
                className={localCheckboxClass}
              />
              Yayında
            </label>

            <LocalField label="Soru">
              <input
                name="soru"
                defaultValue={faq.soru}
                required
                disabled={!canEdit}
                className={localInputClass}
              />
            </LocalField>

            <LocalField label="Cevap">
              <textarea
                name="cevap"
                rows={5}
                defaultValue={faq.cevap}
                required
                disabled={!canEdit}
                className={cn(localTextareaClass, "min-h-[120px]")}
              />
            </LocalField>

            {state.error && <p className={localAlertErrorClass}>{state.error}</p>}
            {state.success && <p className={localAlertSuccessClass}>{state.success}</p>}

            {canEdit && (
              <button type="submit" disabled={isPending} className={localBtnPrimaryClass}>
                {isPending ? "Kaydediliyor…" : "Kaydet"}
              </button>
            )}
          </form>

          {canEdit && (
            <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-neutral-100 pt-3">
              <form action={moveAction}>
                <input type="hidden" name="faq_id" value={faq.id} />
                <input type="hidden" name="context" value={faq.context} />
                <input type="hidden" name="direction" value="up" />
                <button
                  type="submit"
                  disabled={movePending || index === 0}
                  className={localBtnSmallSecondaryClass}
                >
                  ↑ Yukarı
                </button>
              </form>

              <form action={moveAction}>
                <input type="hidden" name="faq_id" value={faq.id} />
                <input type="hidden" name="context" value={faq.context} />
                <input type="hidden" name="direction" value="down" />
                <button
                  type="submit"
                  disabled={movePending || index === total - 1}
                  className={localBtnSmallSecondaryClass}
                >
                  ↓ Aşağı
                </button>
              </form>

              <form action={deleteAction}>
                <input type="hidden" name="faq_id" value={faq.id} />
                <button type="submit" disabled={deletePending} className={localBtnSmallDangerClass}>
                  {deletePending ? "Siliniyor…" : "Sil"}
                </button>
              </form>
            </div>
          )}

          {moveState.error && <p className="mt-2 text-xs text-red-600">{moveState.error}</p>}
          {deleteState.error && <p className="mt-2 text-xs text-red-600">{deleteState.error}</p>}
        </div>
      )}
    </div>
  );
}

function NewFaqPanel({
  context,
  nextSortOrder,
  canEdit,
}: {
  context: FaqContext;
  nextSortOrder: number;
  canEdit: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(upsertFaq, initialState);

  if (!canEdit) return null;

  return (
    <div className="overflow-hidden rounded-2xl border border-dashed border-emerald-200 bg-emerald-50/30">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left sm:px-5"
        aria-expanded={open}
      >
        <span className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-800">
          <Plus className="size-4" aria-hidden />
          Yeni SSS ekle
        </span>
        <ChevronDown
          className={cn("size-5 text-emerald-600 transition-transform", open && "rotate-180")}
          aria-hidden
        />
      </button>

      {open && (
        <form action={formAction} className="space-y-4 border-t border-emerald-100 bg-white px-4 py-4 sm:px-5">
          <input type="hidden" name="context" value={context} />
          <input type="hidden" name="sort_order" value={nextSortOrder} />
          <input type="hidden" name="is_active" value="true" />

          <LocalField label="Soru">
            <input name="soru" required className={localInputClass} placeholder="Soru metni" />
          </LocalField>

          <LocalField label="Cevap">
            <textarea
              name="cevap"
              rows={4}
              required
              className={cn(localTextareaClass, "min-h-[100px]")}
              placeholder="Kısa ve net bir yanıt yazın…"
            />
          </LocalField>

          {state.error && <p className={localAlertErrorClass}>{state.error}</p>}
          {state.success && <p className={localAlertSuccessClass}>{state.success}</p>}

          <button type="submit" disabled={isPending} className={localBtnPrimaryClass}>
            {isPending ? "Ekleniyor…" : "SSS Ekle"}
          </button>
        </form>
      )}
    </div>
  );
}

function ContextSeedButton({
  context,
  canEdit,
}: {
  context: FaqContext;
  canEdit: boolean;
}) {
  const [state, formAction, isPending] = useActionState(seedDefaultFaqsForm, initialState);

  if (!canEdit) return null;

  return (
    <form action={formAction}>
      <input type="hidden" name="context" value={context} />
      <button type="submit" disabled={isPending} className={localBtnSecondaryClass}>
        {isPending ? "Aktarılıyor…" : "Bu alanı doldur"}
      </button>
      {state.error && <p className="mt-2 text-xs text-red-600">{state.error}</p>}
      {state.success && <p className="mt-2 text-xs text-emerald-700">{state.success}</p>}
    </form>
  );
}

function FaqContextSection({
  context,
  faqs,
  canEdit,
}: {
  context: FaqContext;
  faqs: PlatformFaq[];
  canEdit: boolean;
}) {
  const contextFaqs = faqs.filter((faq) => faq.context === context);
  const nextSortOrder =
    contextFaqs.length > 0
      ? Math.max(...contextFaqs.map((faq) => faq.sort_order)) + 1
      : 0;

  return (
    <section className={localWorkspaceSectionClass}>
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-neutral-100 pb-5">
        <div>
          <h2 className={localSectionTitleClass}>{FAQ_CONTEXT_LABELS[context]}</h2>
          <p className="mt-1 text-sm text-neutral-600">
            {context === "anasayfa"
              ? "Ana sayfanın altındaki SSS akordeonu."
              : "/fiyatlandirma sayfasının altındaki SSS bölümü."}
          </p>
          <p className="mt-2 text-xs font-medium text-neutral-400">
            {contextFaqs.length} kayıt
          </p>
        </div>
        {contextFaqs.length === 0 && (
          <ContextSeedButton context={context} canEdit={canEdit} />
        )}
      </div>

      {contextFaqs.length === 0 ? (
        <div className="mt-5 rounded-2xl border border-dashed border-neutral-200 bg-neutral-50 px-6 py-10 text-center">
          <HelpCircle className="mx-auto size-8 text-neutral-300" aria-hidden />
          <p className="mt-3 text-sm font-medium text-neutral-700">
            Bu alanda henüz Supabase kaydı yok
          </p>
          <p className="mt-1 text-xs text-neutral-500">
            Üstteki &quot;Varsayılan SSS&apos;leri Yükle&quot; ile tüm boş alanları doldurabilir
            veya bu alan için ayrı seed çalıştırabilirsiniz.
          </p>
        </div>
      ) : (
        <div className="mt-5 space-y-3">
          {contextFaqs.map((faq, index) => (
            <FaqAccordionItem
              key={faq.id}
              faq={faq}
              index={index}
              total={contextFaqs.length}
              canEdit={canEdit}
            />
          ))}
        </div>
      )}

      <div className="mt-5">
        <NewFaqPanel context={context} nextSortOrder={nextSortOrder} canEdit={canEdit} />
      </div>
    </section>
  );
}

export function LocalFaqClient({
  faqs,
  canEdit,
  loadError,
  counts,
}: LocalFaqClientProps) {
  return (
    <div className="space-y-8">
      <header className="space-y-4 border-b border-neutral-100 pb-6">
        <p className={localAccentLabelClass}>İçerik</p>
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
          SSS yönetimi
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-neutral-600">
          Landing sayfası SSS içerikleri doğrudan Supabase <code className="text-xs">faqs</code>{" "}
          tablosundan okunur. Burada yaptığınız değişiklikler anında vitrine yansır.
        </p>

        <LocalAuthNotice canEdit={canEdit} nextPath="/local-yonetim/sss" />

        {loadError && (
          <p className={localAlertErrorClass}>
            Veritabanı hatası: {loadError}. Süper admin oturumu ve RLS izinlerini kontrol edin.
          </p>
        )}

        <div className={cn(localWorkspaceSectionClass, "bg-emerald-50/40 border-emerald-100")}>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-emerald-900">Hızlı başlangıç</p>
              <p className="mt-1 text-sm text-emerald-800/80">
                Esnaf vitrini, toptancı, servis takibi ve yerel SEO odaklı{" "}
                {DEFAULT_FAQ_SEED_COUNT} soruluk hazır SSS setini tek tıkla yükleyin.
              </p>
              <p className="mt-2 text-xs text-emerald-700/70">
                Ana Sayfa: {counts.anasayfa} · Fiyatlandırma: {counts.fiyatlandirma}
              </p>
            </div>
            <SeedAllButton canEdit={canEdit} />
          </div>
        </div>
      </header>

      <FaqContextSection context="anasayfa" faqs={faqs} canEdit={canEdit} />
      <FaqContextSection context="fiyatlandirma" faqs={faqs} canEdit={canEdit} />
    </div>
  );
}
