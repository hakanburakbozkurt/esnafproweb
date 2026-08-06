import Link from "next/link";
import {
  formatSecondHandCondition,
  formatSecondHandPrice,
  getSecondHandDeviceHref,
  getSecondHandDeviceImage,
  getSecondHandDeviceTitle,
  type PublicSecondHandDevice,
} from "@/lib/dukkan/second-hand-devices";
import { buildWhatsAppUrl, normalizeWhatsAppNumber } from "@/lib/dukkan/contact";
import { cn } from "@/lib/utils/cn";

type SecondHandDeviceCardProps = {
  device: PublicSecondHandDevice;
  shopSlug: string;
  shopName: string;
  whatsapp: string | null;
  className?: string;
};

export function SecondHandDeviceCard({
  device,
  shopSlug,
  shopName,
  whatsapp,
  className,
}: SecondHandDeviceCardProps) {
  const title = getSecondHandDeviceTitle(device);
  const imageUrl = getSecondHandDeviceImage(device);
  const condition = formatSecondHandCondition(device.condition);
  const price = formatSecondHandPrice(device.sale_price);
  const detailHref = getSecondHandDeviceHref(shopSlug, device);
  const normalizedWhatsApp = whatsapp ? normalizeWhatsAppNumber(whatsapp) : null;
  const whatsappHref = normalizedWhatsApp
    ? buildWhatsAppUrl(
        normalizedWhatsApp,
        `Merhaba ${shopName}, "${title}" ilanı hakkında bilgi almak istiyorum.`
      )
    : null;

  return (
    <article
      className={cn(
        "flex h-full min-w-0 w-full flex-col overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-none transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_20px_50px_rgb(0,0,0,0.08)] sm:rounded-2xl",
        className
      )}
    >
      <Link href={detailHref} className="group block min-w-0">
        <div className="relative aspect-square overflow-hidden rounded-t-xl bg-slate-100">
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageUrl}
              alt={title}
              className="h-full w-full object-cover object-center transition duration-500 group-hover:scale-[1.02]"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs text-slate-400 sm:text-sm">
              Görsel yok
            </div>
          )}
          <span className="absolute left-2 top-2 max-w-[calc(100%-1rem)] truncate rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 shadow-sm backdrop-blur-sm sm:left-3 sm:top-3 sm:px-3 sm:py-1 sm:text-xs">
            {condition}
          </span>
        </div>
      </Link>

      <div className="flex min-w-0 flex-1 flex-col border-t border-slate-100 px-2.5 py-2.5 sm:px-4 sm:py-4">
        <div className="min-h-0 min-w-0 flex-1">
          {(device.brand || device.model) && (
            <p className="truncate text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400 sm:text-[11px] sm:tracking-[0.16em]">
              {[device.brand, device.model].filter(Boolean).join(" · ")}
            </p>
          )}
          <Link href={detailHref} className="block min-w-0">
            <h3 className="mt-1 line-clamp-2 text-sm font-semibold leading-snug text-slate-900 transition hover:text-emerald-700 sm:text-base">
              {title}
            </h3>
          </Link>
          {device.web_description?.trim() && (
            <p className="mt-1.5 line-clamp-1 text-xs leading-relaxed text-slate-500 sm:mt-2 sm:line-clamp-2 sm:text-sm">
              {device.web_description.trim()}
            </p>
          )}
        </div>

        <div className="mt-2.5 space-y-2 sm:mt-4 sm:space-y-3">
          <p className="text-base font-bold tracking-tight text-emerald-700 sm:text-xl">
            {price}
          </p>

          <div className="flex flex-col gap-1.5 sm:gap-2">
            <Link
              href={detailHref}
              className="inline-flex min-h-9 w-full items-center justify-center rounded-full border border-slate-200 bg-white px-2.5 py-2 text-xs font-semibold text-slate-700 transition hover:border-emerald-300 hover:text-emerald-600 sm:min-h-11 sm:px-4 sm:py-2.5 sm:text-sm"
            >
              Detayları Gör
            </Link>

            {whatsappHref ? (
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-9 w-full items-center justify-center gap-1.5 rounded-full bg-[#25D366] px-2.5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-[#20bd5a] sm:min-h-11 sm:gap-2 sm:px-4 sm:py-2.5 sm:text-sm"
              >
                <WhatsAppIcon />
                <span className="truncate">WhatsApp ile Sor</span>
              </a>
            ) : (
              <p className="text-center text-[10px] text-slate-400 sm:text-xs">
                İletişim için mağaza sayfasını ziyaret edin.
              </p>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

function WhatsAppIcon() {
  return (
    <svg className="size-4 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
    </svg>
  );
}
