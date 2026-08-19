"use client";

import { useActionState, type ReactNode } from "react";
import {
  deleteFaqForm,
  moveFaqForm,
  seedDefaultFaqsForm,
  upsertFaq,
  type FaqAdminState,
} from "@/lib/faqs/faq-actions";
import {
  FAQ_CONTEXT_LABELS,
  type FaqContext,
  type PlatformFaq,
} from "@/lib/faqs/types";
import { cn } from "@/lib/utils/cn";

const initialState: FaqAdminState = {};

const adminInputClass =
  "mt-1 w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500";

const adminCheckboxClass =
  "h-4 w-4 rounded border-zinc-600 bg-zinc-800 text-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:ring-offset-0 focus:ring-offset-zinc-900";

const btnPrimaryClass =
  "inline-flex min-h-10 items-center justify-center rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50";

const btnSecondaryClass =
  "inline-flex min-h-9 items-center justify-center rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-xs font-semibold text-zinc-100 transition hover:border-zinc-600 hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-50";

const panelClass = "rounded-2xl border border-zinc-800 bg-zinc-900 p-5 sm:p-6";

function DarkField({
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
      <label className="text-sm font-medium text-zinc-300">{label}</label>
      {children}
      {hint && <p className="mt-1.5 text-xs text-zinc-500">{hint}</p>}
    </div>
  );
}

function FaqEditorForm({ faq, index, total }: { faq: PlatformFaq; index: number; total: number }) {
  const [state, formAction, isPending] = useActionState(upsertFaq, initialState);
  const [deleteState, deleteAction, deletePending] = useActionState(deleteFaqForm, initialState);
  const [moveState, moveAction, movePending] = useActionState(moveFaqForm, initialState);

  const isDefaultId = faq.id.startsWith("default-");

  return (
    <div className="space-y-3">
      <form action={formAction} className={cn(panelClass, "space-y-4")}>
        <input type="hidden" name="id" value={isDefaultId ? "" : faq.id} />
        <input type="hidden" name="sort_order" value={faq.sort_order} />
        <input type="hidden" name="context" value={faq.context} />

        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 pb-4">
          <p className="text-sm font-semibold text-zinc-100">SSS #{index + 1}</p>
          <label className="flex cursor-pointer items-center gap-2 text-xs text-zinc-400">
            <input
              type="checkbox"
              name="is_active"
              value="true"
              defaultChecked={faq.is_active}
              className={adminCheckboxClass}
            />
            Yayında
          </label>
        </div>

        <DarkField label="Soru">
          <input name="soru" defaultValue={faq.soru} required className={adminInputClass} />
        </DarkField>

        <DarkField label="Cevap">
          <textarea
            name="cevap"
            rows={4}
            defaultValue={faq.cevap}
            required
            className={cn(adminInputClass, "min-h-[100px] resize-y")}
          />
        </DarkField>

        {state.error && <p className="text-sm text-red-400">{state.error}</p>}
        {state.success && <p className="text-sm text-emerald-400">{state.success}</p>}

        <button type="submit" disabled={isPending || isDefaultId} className={btnPrimaryClass}>
          {isPending ? "Kaydediliyor…" : "Kaydet"}
        </button>

        {isDefaultId && (
          <p className="text-xs text-amber-400">
            Varsayılan kayıt — düzenlemek için önce ilgili alanın varsayılan SSS aktarımını
            çalıştırın.
          </p>
        )}
      </form>

      <div className="flex flex-wrap items-center gap-2 px-1">
        <form action={moveAction}>
          <input type="hidden" name="faq_id" value={faq.id} />
          <input type="hidden" name="context" value={faq.context} />
          <input type="hidden" name="direction" value="up" />
          <button
            type="submit"
            disabled={movePending || isDefaultId || index === 0}
            className={btnSecondaryClass}
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
            disabled={movePending || isDefaultId || index === total - 1}
            className={btnSecondaryClass}
          >
            ↓ Aşağı
          </button>
        </form>

        {!isDefaultId && (
          <form action={deleteAction}>
            <input type="hidden" name="faq_id" value={faq.id} />
            <button
              type="submit"
              disabled={deletePending}
              className="inline-flex min-h-9 items-center justify-center rounded-lg border border-red-900/50 bg-red-950/30 px-3 py-2 text-xs font-semibold text-red-400 transition hover:bg-red-950/50 disabled:opacity-50"
            >
              {deletePending ? "Siliniyor…" : "Sil"}
            </button>
          </form>
        )}
      </div>

      {moveState.error && <p className="px-1 text-xs text-red-400">{moveState.error}</p>}
      {deleteState.error && <p className="px-1 text-xs text-red-400">{deleteState.error}</p>}
    </div>
  );
}

function NewFaqForm({
  context,
  nextSortOrder,
}: {
  context: FaqContext;
  nextSortOrder: number;
}) {
  const [state, formAction, isPending] = useActionState(upsertFaq, initialState);

  return (
    <form action={formAction} className={cn(panelClass, "space-y-4")}>
      <h3 className="border-b border-zinc-800 pb-4 text-base font-bold text-zinc-100">
        Yeni SSS Ekle
      </h3>
      <input type="hidden" name="context" value={context} />
      <input type="hidden" name="sort_order" value={nextSortOrder} />
      <input type="hidden" name="is_active" value="true" />

      <DarkField label="Soru">
        <input name="soru" required className={adminInputClass} placeholder="Soru metni" />
      </DarkField>

      <DarkField label="Cevap">
        <textarea
          name="cevap"
          rows={4}
          required
          className={cn(adminInputClass, "min-h-[100px] resize-y")}
          placeholder="Kısa ve net bir yanıt yazın…"
        />
      </DarkField>

      {state.error && <p className="text-sm text-red-400">{state.error}</p>}
      {state.success && <p className="text-sm text-emerald-400">{state.success}</p>}

      <button type="submit" disabled={isPending} className={btnPrimaryClass}>
        {isPending ? "Ekleniyor…" : "SSS Ekle"}
      </button>
    </form>
  );
}

function SeedButton({ context }: { context: FaqContext }) {
  const [state, formAction, isPending] = useActionState(seedDefaultFaqsForm, initialState);

  return (
    <form action={formAction}>
      <input type="hidden" name="context" value={context} />
      <button type="submit" disabled={isPending} className={btnSecondaryClass}>
        {isPending ? "Aktarılıyor…" : "Varsayılanları Aktar"}
      </button>
      {state.error && <p className="mt-2 text-sm text-red-400">{state.error}</p>}
      {state.success && <p className="mt-2 text-sm text-emerald-400">{state.success}</p>}
    </form>
  );
}

function FaqContextSection({
  context,
  faqs,
}: {
  context: FaqContext;
  faqs: PlatformFaq[];
}) {
  const contextFaqs = faqs.filter((faq) => faq.context === context);
  const nextSortOrder =
    contextFaqs.length > 0
      ? Math.max(...contextFaqs.map((faq) => faq.sort_order)) + 1
      : 0;
  const hasDbRecords = contextFaqs.some((faq) => !faq.id.startsWith("default-"));

  return (
    <section className={panelClass}>
      <div className="mb-5 flex flex-wrap items-start justify-between gap-4 border-b border-zinc-800 pb-4">
        <div>
          <h3 className="text-lg font-bold text-zinc-100">{FAQ_CONTEXT_LABELS[context]}</h3>
          <p className="mt-1 text-sm text-zinc-400">
            {context === "anasayfa"
              ? "Ana sayfanın en altındaki SSS bölümü."
              : "/fiyatlandirma sayfasının altındaki SSS bölümü."}
          </p>
        </div>
        <SeedButton context={context} />
      </div>

      {!hasDbRecords && (
        <p className="mb-4 text-sm text-amber-400">
          Bu alan için henüz veritabanı kaydı yok — varsayılanları aktarın veya yeni SSS ekleyin.
        </p>
      )}

      <div className="grid min-w-0 gap-4 xl:grid-cols-2">
        <NewFaqForm context={context} nextSortOrder={nextSortOrder} />
        <div className="space-y-4">
          {contextFaqs.map((faq, index) => (
            <FaqEditorForm
              key={faq.id}
              faq={faq}
              index={index}
              total={contextFaqs.length}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export function FaqAdminClient({ faqs }: { faqs: PlatformFaq[] }) {
  return (
    <div className="space-y-8">
      <section className={panelClass}>
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-indigo-400">
          Super Admin
        </p>
        <h2 className="mt-2 text-xl font-bold text-zinc-100">SSS Yönetimi</h2>
        <p className="mt-2 text-sm leading-relaxed text-zinc-400">
          Ana sayfa ve fiyatlandırma sayfası için SSS içeriklerini ayrı ayrı yönetin. Tablo
          boşsa her alan kendi varsayılan listesiyle çalışmaya devam eder.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <a href="/yonetim/admin/dukkan-onay" className={btnSecondaryClass}>
            Dükkan Onay
          </a>
          <a href="/yonetim/admin/fiyatlar" className={btnSecondaryClass}>
            Fiyat Yönetimi
          </a>
        </div>
      </section>

      <FaqContextSection context="anasayfa" faqs={faqs} />
      <FaqContextSection context="fiyatlandirma" faqs={faqs} />
    </div>
  );
}
