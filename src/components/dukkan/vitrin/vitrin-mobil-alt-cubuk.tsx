"use client";

import { Navigation, Phone } from "lucide-react";
import { WhatsAppIcon } from "@/components/icons/whatsapp-icon";
import { buildWhatsAppUrl } from "@/lib/dukkan/contact";
import { hasMapLocation, openMapNavigation } from "@/lib/dukkan/map-navigation";
import { cn } from "@/lib/utils/cn";
import type { Dukkan } from "@/types/database.types";

type VitrinMobilAltCubukDukkan = Pick<
  Dukkan,
  "dukkan_adi" | "whatsapp" | "telefon" | "enlem" | "boylam" | "adres"
>;

const actionClass =
  "inline-flex min-h-12 flex-1 flex-col items-center justify-center gap-0.5 rounded-2xl px-2 text-[11px] font-semibold transition active:scale-[0.97] motion-reduce:active:scale-100";

/** Yalnızca mobilde görünen sabit iletişim çubuğu */
export function VitrinMobilAltCubuk({ dukkan }: { dukkan: VitrinMobilAltCubukDukkan }) {
  const whatsapp = dukkan.whatsapp?.trim();
  const telefon = dukkan.telefon?.trim();
  const location = {
    enlem: dukkan.enlem,
    boylam: dukkan.boylam,
    adres: dukkan.adres,
    label: dukkan.dukkan_adi,
  };
  const showDirections = hasMapLocation(location);

  if (!whatsapp && !telefon && !showDirections) return null;

  return (
    <>
    <style>{`@media (max-width: 767px) { body { padding-bottom: calc(4.75rem + env(safe-area-inset-bottom)); } }`}</style>
    <nav
      aria-label="Hızlı iletişim"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200/80 bg-white/95 px-3 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] shadow-[0_-8px_24px_rgb(15_23_42/0.06)] backdrop-blur-md md:hidden"
    >
      <div className="mx-auto flex max-w-md gap-2">
        {whatsapp && (
          <a
            href={buildWhatsAppUrl(whatsapp, `Merhaba ${dukkan.dukkan_adi}, bilgi almak istiyorum.`)}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(actionClass, "bg-[#25D366] text-white shadow-sm shadow-[#25D366]/30")}
          >
            <WhatsAppIcon className="size-5" />
            WhatsApp
          </a>
        )}
        {telefon && (
          <a
            href={`tel:${telefon.replace(/\s/g, "")}`}
            className={cn(actionClass, "bg-emerald-600 text-white shadow-sm shadow-emerald-600/25")}
          >
            <Phone className="size-5" aria-hidden />
            Ara
          </a>
        )}
        {showDirections && (
          <button
            type="button"
            onClick={() => openMapNavigation(location)}
            className={cn(actionClass, "border border-slate-200 bg-white text-slate-700")}
          >
            <Navigation className="size-5" aria-hidden />
            Yol tarifi
          </button>
        )}
      </div>
    </nav>
    </>
  );
}
