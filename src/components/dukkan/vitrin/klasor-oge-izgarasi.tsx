import { SecondHandDeviceCard } from "@/components/dukkan/vitrin/second-hand-device-card";
import { UrunVitrinKarti } from "@/components/dukkan/vitrin/urun-vitrin-karti";
import type { PublicSecondHandDevice } from "@/lib/dukkan/second-hand-devices";
import { vitrinUrunPath, type KlasorOgesi } from "@/lib/dukkan/vitrin-klasorleri";
import type { DukkanUrunu } from "@/types/database.types";

/** Kategori klasöründeki ürün ve cihazları aynı ızgarada gösterir. */
export function KlasorOgeIzgarasi({
  ogeler,
  shopSlug,
  shopName,
  whatsapp,
  urunSluglari,
  altEtiketiGoster = true,
}: {
  ogeler: KlasorOgesi<DukkanUrunu, PublicSecondHandDevice>[];
  shopSlug: string;
  shopName: string;
  whatsapp: string | null;
  urunSluglari: Map<string, string>;
  altEtiketiGoster?: boolean;
}) {
  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
      {ogeler.map((oge) => {
        if (oge.tur === "urun") {
          const urunSlug = urunSluglari.get(oge.urun.id);
          if (!urunSlug) return null;
          return (
            <li key={`urun-${oge.urun.id}`}>
              <UrunVitrinKarti
                urun={oge.urun}
                href={vitrinUrunPath(shopSlug, urunSlug)}
                altEtiket={altEtiketiGoster ? oge.alt : null}
              />
            </li>
          );
        }
        if (!oge.cihaz.id) return null;
        return (
          // Cihaz kartı mobilde yatay düzen kullanır; iki sütuna sığmadığı için tam satır kaplar.
          <li key={`cihaz-${oge.cihaz.id}`} className="col-span-2 sm:col-span-1">
            <SecondHandDeviceCard
              device={oge.cihaz}
              shopSlug={shopSlug}
              shopName={shopName}
              whatsapp={whatsapp}
              className="h-full"
            />
          </li>
        );
      })}
    </ul>
  );
}
