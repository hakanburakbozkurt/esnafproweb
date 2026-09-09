"use client";

import Link from "next/link";
import { CalendarCheck, MessageCircleMore, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils/cn";

type DeviceDetailActionBarProps = {
  shopSlug: string;
  reservationHref: string | null;
  whatsappHref: string | null;
  tradeWhatsAppHref: string | null;
  className?: string;
};

export function DeviceDetailActionBar({
  shopSlug,
  reservationHref,
  whatsappHref,
  tradeWhatsAppHref,
  className,
}: DeviceDetailActionBarProps) {
  const contactFallbackHref = `/${shopSlug}/iletisim`;

  return (
    <div
      className={cn(
        "mt-6 space-y-3 rounded-3xl border border-neutral-100 bg-white p-4 shadow-sm sm:p-5 lg:mt-auto lg:pt-6",
        className
      )}
    >
      {reservationHref ? (
        <a
          href={reservationHref}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
        >
          <ShoppingBag className="size-4 shrink-0" aria-hidden />
          Rezervasyon / Satın Alma Talebi
        </a>
      ) : (
        <Link
          href={contactFallbackHref}
          className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
        >
          <CalendarCheck className="size-4 shrink-0" aria-hidden />
          Mağazadan Rezervasyon Talep Et
        </Link>
      )}

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {whatsappHref ? (
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#25D366] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#20bd5a]"
          >
            <WhatsAppIcon />
            WhatsApp ile Bilgi Al
          </a>
        ) : (
          <Link
            href={contactFallbackHref}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-neutral-200 bg-white px-4 py-2.5 text-sm font-semibold text-neutral-700 shadow-sm transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
          >
            Mağaza ile İletişim
          </Link>
        )}

        {tradeWhatsAppHref ? (
          <a
            href={tradeWhatsAppHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-700 shadow-sm transition hover:border-emerald-300 hover:bg-emerald-100"
          >
            <MessageCircleMore className="size-4 shrink-0" aria-hidden />
            Fiyat Teklif Et / Takas Sor
          </a>
        ) : (
          <button
            type="button"
            disabled
            className="inline-flex min-h-11 cursor-not-allowed items-center justify-center gap-2 rounded-full border border-neutral-200 bg-neutral-50 px-4 py-2.5 text-sm font-semibold text-neutral-400"
            title="Bu mağaza için WhatsApp bilgisi girilmemiş"
          >
            <MessageCircleMore className="size-4 shrink-0" aria-hidden />
            Fiyat Teklif Et / Takas Sor
          </button>
        )}
      </div>
    </div>
  );
}

function WhatsAppIcon() {
  return (
    <svg className="size-4 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.815 0 0 0-3.48-8.413z" />
    </svg>
  );
}
