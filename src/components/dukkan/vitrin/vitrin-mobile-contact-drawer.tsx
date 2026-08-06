"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { buildWhatsAppUrl } from "@/lib/dukkan/contact";
import { cn } from "@/lib/utils/cn";
import type { Dukkan } from "@/types/database.types";

export function VitrinMobileContactDrawer({ dukkan }: { dukkan: Dukkan }) {
  const [open, setOpen] = useState(false);
  const phone = dukkan.telefon?.trim();
  const whatsapp = dukkan.whatsapp?.trim();
  const phoneHref = phone ? `tel:${phone.replace(/\s/g, "")}` : null;
  const whatsappHref = whatsapp
    ? buildWhatsAppUrl(
        whatsapp,
        `Merhaba ${dukkan.dukkan_adi}, bilgi almak istiyorum.`
      )
    : null;
  const iletisimHref = `/${dukkan.slug}/iletisim`;

  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  if (!phoneHref && !whatsappHref) return null;

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-label="İletişim menüsünü aç"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className={cn(
          "fixed right-0 top-1/2 z-40 flex -translate-y-1/2 flex-col items-center gap-1 rounded-l-2xl border border-r-0 border-emerald-200/80 bg-emerald-600 px-2 py-3 text-white shadow-lg shadow-emerald-600/25 transition hover:bg-emerald-700",
          open && "pointer-events-none opacity-0"
        )}
      >
        <PhoneIcon className="size-4" />
        <span
          className="text-[10px] font-semibold uppercase tracking-wide [writing-mode:vertical-rl]"
          style={{ textOrientation: "mixed" }}
        >
          İletişim
        </span>
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.button
              type="button"
              aria-label="Menüyü kapat"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-[2px]"
              onClick={() => setOpen(false)}
            />

            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
              className="fixed inset-y-0 right-0 z-50 flex w-[min(88vw,20rem)] flex-col bg-white shadow-2xl"
              role="dialog"
              aria-modal="true"
              aria-label="Hızlı iletişim"
            >
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-600">
                    Hızlı İletişim
                  </p>
                  <p className="mt-0.5 text-sm font-semibold text-slate-900">
                    {dukkan.dukkan_adi}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="inline-flex size-9 items-center justify-center rounded-full border border-slate-200 text-slate-500"
                  aria-label="Kapat"
                >
                  ✕
                </button>
              </div>

              <div className="flex flex-1 flex-col gap-3 p-5">
                {phoneHref && (
                  <a
                    href={phoneHref}
                    onClick={() => setOpen(false)}
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
                  >
                    <PhoneIcon className="size-4" />
                    Hemen Ara
                  </a>
                )}

                {whatsappHref && (
                  <a
                    href={whatsappHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setOpen(false)}
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-[#128C7E] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0f7a6e]"
                  >
                    <WhatsAppIcon className="size-4" />
                    WhatsApp
                  </a>
                )}

                <Link
                  href={iletisimHref}
                  onClick={() => setOpen(false)}
                  className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-emerald-200 hover:text-emerald-700"
                >
                  Tüm İletişim Bilgileri
                </Link>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function PhoneIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("size-5", className)}
      aria-hidden
    >
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={cn("size-5", className)}
      aria-hidden
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}
