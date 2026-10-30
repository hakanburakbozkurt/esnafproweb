import type { DukkanUrunu } from "@/types/database.types";

let sequence = 0;

/** Testler için eksiksiz bir dukkan_urunleri satırı üretir. */
export function makeUrun(overrides: Partial<DukkanUrunu> = {}): DukkanUrunu {
  sequence += 1;
  return {
    id: `urun-${sequence}`,
    dukkan_id: "dukkan-1",
    urun_adi: `Ürün ${sequence}`,
    urun_aciklama: null,
    fotograf_url: `https://cdn.test/urun-${sequence}.webp`,
    fotograf_url_2: null,
    fotograf_url_3: null,
    fotograf_url_4: null,
    fotograf_url_5: null,
    fotograf_url_6: null,
    fotograf_url_7: null,
    fotograf_url_8: null,
    urun_kategorisi: null,
    fiyat: null,
    stok_adedi: null,
    barkod: null,
    gorsel_orani: "yatay",
    sira: sequence,
    created_at: "2026-10-26T00:00:00.000Z",
    ...overrides,
  } as DukkanUrunu;
}
