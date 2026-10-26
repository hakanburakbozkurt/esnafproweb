"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Check, CircleAlert, LoaderCircle, RotateCcw, Save } from "lucide-react";
import { useEffect } from "react";
import { desktopContainerClass } from "@/lib/utils/layout";
import { cn } from "@/lib/utils/cn";

type StickySaveBarProps = {
  formId: string;
  isDirty: boolean;
  isPending: boolean;
  saveDisabled: boolean;
  /** Kaydet pasifken kullanıcıya gösterilen neden */
  disabledReason?: string | null;
  error?: string | null;
  saved?: boolean;
  submitLabel: string;
  pendingLabel: string;
  /** Verilmezse İptal düğmesi gösterilmez */
  onCancel?: () => void;
  idleText?: string;
  /**
   * Mobilde yalnızca kaydedilmemiş değişiklik / kayıt / hata varken görünür ve
   * o sırada yönetim alt sekme çubuğunu gizler (body[data-save-bar=active]).
   */
  collapseWhenClean?: boolean;
};

export function StickySaveBar({
  formId,
  isDirty,
  isPending,
  saveDisabled,
  disabledReason,
  error,
  saved = false,
  submitLabel,
  pendingLabel,
  onCancel,
  idleText = "Tüm değişiklikler kayıtlı",
  collapseWhenClean = false,
}: StickySaveBarProps) {
  const reduceMotion = useReducedMotion();
  const mobileActive = isDirty || isPending || Boolean(error);

  useEffect(() => {
    if (!collapseWhenClean) return;
    if (mobileActive) document.body.dataset.saveBar = "active";
    else delete document.body.dataset.saveBar;
    return () => {
      delete document.body.dataset.saveBar;
    };
  }, [collapseWhenClean, mobileActive]);

  const status = isPending
    ? { key: "pending", tone: "text-slate-600", text: pendingLabel }
    : error
      ? { key: "error", tone: "text-red-600", text: error }
      : isDirty
        ? { key: "dirty", tone: "text-slate-700", text: "Kaydedilmemiş değişiklik var" }
        : saved
          ? { key: "saved", tone: "text-emerald-700", text: "Değişiklikler kaydedildi" }
          : { key: "idle", tone: "text-slate-500", text: idleText };

  return (
    <div
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 border-t border-slate-200/80 bg-white/95 shadow-[0_-8px_30px_rgb(0,0,0,0.06)] backdrop-blur-md",
        collapseWhenClean && !mobileActive && "max-md:hidden"
      )}
    >
      <div
        className={cn(
          desktopContainerClass,
          "flex flex-col gap-2 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:flex-row sm:items-center sm:justify-between sm:gap-4"
        )}
      >
        <div className="min-w-0 flex-1" aria-live="polite">
          <AnimatePresence mode="wait" initial={false}>
            <motion.p
              key={status.key}
              role={status.key === "error" ? "alert" : undefined}
              initial={reduceMotion ? false : { opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0, y: -4 }}
              transition={{ duration: 0.18 }}
              className={cn(
                "flex items-center gap-2 text-sm font-medium",
                status.tone
              )}
            >
              {status.key === "dirty" && (
                <span
                  aria-hidden
                  className="size-2.5 shrink-0 rounded-full bg-red-500 ring-4 ring-red-500/15"
                />
              )}
              {status.key === "error" && (
                <CircleAlert className="size-4 shrink-0" aria-hidden />
              )}
              {status.key === "saved" && <Check className="size-4 shrink-0" aria-hidden />}
              {status.key === "pending" && (
                <LoaderCircle className="size-4 shrink-0 animate-spin" aria-hidden />
              )}
              <span className="line-clamp-2">{status.text}</span>
            </motion.p>
          </AnimatePresence>
          {saveDisabled && disabledReason && !isPending && (
            <p className="mt-0.5 text-xs text-amber-700">{disabledReason}</p>
          )}
        </div>

        <div className="flex shrink-0 gap-2">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={!isDirty || isPending}
              className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none"
            >
              <RotateCcw className="size-4" aria-hidden />
              İptal
            </button>
          )}
          <button
            type="submit"
            form={formId}
            disabled={saveDisabled || isPending}
            className={cn(
              "inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full px-6 text-sm font-semibold text-white shadow-sm transition disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none",
              isDirty
                ? "bg-emerald-600 shadow-emerald-600/20 hover:bg-emerald-700"
                : "bg-slate-900 hover:bg-slate-800"
            )}
          >
            {isPending ? (
              <LoaderCircle className="size-4 animate-spin" aria-hidden />
            ) : (
              <Save className="size-4" aria-hidden />
            )}
            {isPending ? pendingLabel : submitLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
