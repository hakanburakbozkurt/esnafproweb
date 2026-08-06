import { desktopContainerClass } from "@/lib/utils/layout";

export function VitrinCover({
  bannerUrl,
  shopName,
}: {
  bannerUrl: string | null;
  shopName: string;
}) {
  return (
    <section
      aria-label={`${shopName} kapak fotoğrafı`}
      className={`${desktopContainerClass} pt-4 sm:pt-5 lg:pt-6`}
    >
      <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] sm:rounded-3xl">
        <div className="relative aspect-[16/9] w-full sm:aspect-[21/9]">
          {bannerUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={bannerUrl}
              alt={`${shopName} kapak fotoğrafı`}
              className="absolute inset-0 h-full w-full object-cover object-center"
              draggable={false}
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(16,185,129,0.35),transparent_42%)]" />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
