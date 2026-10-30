import Link from "next/link";
import { ImageOff } from "lucide-react";
import { getSecondHandDeviceImage, type PublicSecondHandDevice } from "@/lib/dukkan/second-hand-devices";
import { getUrunPhotoUrls } from "@/lib/dukkan/urun-photos";
import { vitrinKlasorPath, type VitrinKlasoru } from "@/lib/dukkan/vitrin-klasorleri";
import type { DukkanUrunu } from "@/types/database.types";

export type VitrinKlasor = VitrinKlasoru<DukkanUrunu, PublicSecondHandDevice>;

/** Klasörün kapak görselleri: fotoğrafı olan ilk üç öğe (ürün ya da cihaz). */
export function klasorKapaklari(klasor: VitrinKlasor, adet = 3): string[] {
  const sonuc: string[] = [];
  for (const oge of klasor.ogeler) {
    const foto = oge.tur === "urun" ? getUrunPhotoUrls(oge.urun)[0] : getSecondHandDeviceImage(oge.cihaz);
    if (foto && !sonuc.includes(foto)) sonuc.push(foto);
    if (sonuc.length >= adet) break;
  }
  return sonuc;
}

export function klasorOzeti(klasor: Pick<VitrinKlasor, "urunSayisi" | "cihazSayisi">): string {
  return [
    klasor.urunSayisi ? `${klasor.urunSayisi} ürün` : null,
    klasor.cihazSayisi ? `${klasor.cihazSayisi} cihaz` : null,
  ]
    .filter(Boolean)
    .join(" · ");
}

export function VitrinKlasorKartlari({
  shopSlug,
  klasorler,
}: {
  shopSlug: string;
  klasorler: VitrinKlasor[];
}) {
  if (!klasorler.length) return null;

  return (
    <section id="urunler" aria-labelledby="urunler-baslik" className="relative">
      <div className="mb-5 flex items-end justify-between gap-4 lg:mb-7">
        <h2 id="urunler-baslik" className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
          Ürünler ve cihazlar
        </h2>
        <p className="shrink-0 text-sm text-slate-500">{klasorler.length} kategori</p>
      </div>

      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
        {klasorler.map((klasor, index) => (
          <li key={klasor.slug}>
            <KlasorKarti shopSlug={shopSlug} klasor={klasor} oncelikli={index < 4} />
          </li>
        ))}
      </ul>
    </section>
  );
}

function KlasorKarti({
  shopSlug,
  klasor,
  oncelikli,
}: {
  shopSlug: string;
  klasor: VitrinKlasor;
  oncelikli: boolean;
}) {
  const [kapak, ...kucukler] = klasorKapaklari(klasor);
  const altOnizleme = klasor.altlar.slice(0, 3).map((alt) => alt.ad).join(", ");

  return (
    <Link
      href={vitrinKlasorPath(shopSlug, klasor.slug)}
      className="group flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200/70 bg-white shadow-[0_1px_2px_rgb(15_23_42/0.04)] transition duration-300 hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-[0_18px_40px_-18px_rgb(15_23_42/0.25)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-50">
        {kapak ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={kapak}
            alt={`${klasor.ad} kategorisi`}
            loading={oncelikli ? "eager" : "lazy"}
            className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          />
        ) : (
          <span className="flex h-full items-center justify-center text-slate-300">
            <ImageOff className="size-8" aria-hidden />
          </span>
        )}

        {kucukler.length > 0 && (
          <div aria-hidden className="absolute bottom-2 right-2 flex -space-x-3">
            {kucukler.map((src) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={src}
                src={src}
                alt=""
                loading="lazy"
                className="size-10 rounded-xl border-2 border-white object-cover shadow-sm sm:size-11"
              />
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1 p-3.5 sm:p-4">
        <h3 className="text-base font-semibold leading-snug text-slate-900 group-hover:text-emerald-700">
          {klasor.ad}
        </h3>
        <p className="text-sm font-medium text-emerald-700">{klasorOzeti(klasor)}</p>
        {altOnizleme && <p className="line-clamp-1 text-sm text-slate-500">{altOnizleme}</p>}
      </div>
    </Link>
  );
}
