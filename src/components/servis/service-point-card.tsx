import Image from "next/image";
import Link from "next/link";
import { Phone, Store } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { PublicServiceStoreInfo } from "@/lib/dukkan/service-device-public";
import { cn } from "@/lib/utils/cn";

function toTelHref(phone: string): string {
  const digits = phone.replace(/\D/g, "");

  if (digits.startsWith("90") && digits.length >= 12) {
    return `tel:+${digits}`;
  }
  if (digits.startsWith("0") && digits.length === 11) {
    return `tel:+90${digits.slice(1)}`;
  }
  if (digits.length === 10 && digits.startsWith("5")) {
    return `tel:+90${digits}`;
  }

  return `tel:${digits}`;
}

function StoreAvatar({
  name,
  logoUrl,
}: {
  name: string;
  logoUrl: string | null;
}) {
  const initial = name.trim().charAt(0).toUpperCase() || "S";
  const hasLogo = Boolean(logoUrl?.trim());

  return (
    <div
      className={cn(
        "relative flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl ring-1 ring-inset sm:size-16",
        hasLogo ? "bg-white ring-slate-200" : "bg-emerald-50 ring-emerald-200"
      )}
    >
      {hasLogo ? (
        <Image
          src={logoUrl!}
          alt=""
          width={64}
          height={64}
          className="size-full object-cover"
        />
      ) : (
        <span className="flex size-full items-center justify-center">
          <Store className="size-7 text-emerald-600" aria-hidden />
          <span className="sr-only">{initial}</span>
        </span>
      )}
    </div>
  );
}

export function ServicePointCard({ store }: { store: PublicServiceStoreInfo }) {
  const phone = store.telefon?.trim() ?? "";

  return (
    <Card>
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
        Servis Noktası
      </p>

      <div className="mt-4 flex items-start gap-4">
        <StoreAvatar name={store.dukkan_adi} logoUrl={store.logo_url} />

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="text-lg font-bold leading-tight text-gray-900 sm:text-xl">
                {store.dukkan_adi}
              </h2>
              {phone ? (
                <a
                  href={toTelHref(phone)}
                  className="mt-1.5 inline-flex items-center text-sm font-medium text-slate-600 transition hover:text-emerald-700"
                >
                  {phone}
                </a>
              ) : (
                <p className="mt-1.5 text-sm text-slate-400">Telefon kayıtlı değil</p>
              )}
            </div>

            {phone && (
              <a
                href={toTelHref(phone)}
                aria-label={`${store.dukkan_adi} numarasını ara`}
                className="inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white shadow-sm shadow-emerald-600/25 transition hover:bg-emerald-700"
              >
                <Phone className="size-5" aria-hidden />
              </a>
            )}
          </div>

          <Link
            href={`/${store.slug}`}
            className="mt-4 inline-flex text-sm font-semibold text-emerald-600 underline-offset-2 hover:text-emerald-700 hover:underline"
          >
            Mağaza vitrini →
          </Link>
        </div>
      </div>
    </Card>
  );
}
