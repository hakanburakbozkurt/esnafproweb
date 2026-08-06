import type { DukkanUrunu } from "@/types/database.types";

export function ProductCard({ urun }: { urun: DukkanUrunu }) {
  return (
    <article className="h-full overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-none transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_20px_50px_rgb(0,0,0,0.08)]">
      <div className="relative aspect-square overflow-hidden rounded-t-xl bg-slate-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={urun.fotograf_url ?? ""}
          alt={urun.urun_adi}
          className="h-full w-full object-cover object-center transition duration-500 hover:scale-[1.02]"
        />
      </div>
      <div className="border-t border-slate-100 px-4 py-4">
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-slate-900 sm:text-base">
          {urun.urun_adi}
        </h3>
      </div>
    </article>
  );
}
