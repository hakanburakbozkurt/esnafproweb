import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils/cn";

type ServiceTrackingLinkProps = {
  trackingCode: string;
  className?: string;
};

export function ServiceTrackingLink({
  trackingCode,
  className,
}: ServiceTrackingLinkProps) {
  return (
    <Link
      href={`/servis-takip/${encodeURIComponent(trackingCode)}`}
      className={cn(
        "mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3.5 text-sm font-bold text-white shadow-md shadow-emerald-600/25 transition hover:bg-emerald-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 sm:w-auto",
        className
      )}
    >
      Cihaz durumunu takip et
      <ArrowRight className="size-4 shrink-0" aria-hidden />
    </Link>
  );
}
