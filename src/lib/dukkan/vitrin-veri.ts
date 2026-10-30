import "server-only";

import { cache } from "react";
import { fetchPublishedSecondHandDevices, type PublicSecondHandDevice } from "@/lib/dukkan/second-hand-devices";
import { logDukkanAction } from "@/lib/dukkan/logger";
import { buildUrunSluglari, buildVitrinKlasorleri, type VitrinKlasoru } from "@/lib/dukkan/vitrin-klasorleri";
import { createClient } from "@/lib/supabase/server";
import type { Dukkan, DukkanUrunu } from "@/types/database.types";

export type VitrinVerisi = {
  dukkan: Dukkan;
  urunler: DukkanUrunu[];
  cihazlar: PublicSecondHandDevice[];
  klasorler: VitrinKlasoru<DukkanUrunu, PublicSecondHandDevice>[];
  /** urun.id → ürün sayfası adresi parçası */
  urunSluglari: Map<string, string>;
};

/**
 * Mağazanın vitrin verisini tek seferde yükler. Aynı istekte generateMetadata
 * ve sayfa tarafından çağrılırsa React cache sayesinde sorgular tekrarlanmaz.
 * Mağaza yoksa null döner.
 */
export const getVitrinVerisi = cache(async (slug: string): Promise<VitrinVerisi | null> => {
  const supabase = await createClient();

  const { data: dukkan, error: dukkanError } = await supabase
    .from("dukkanlar")
    .select("*")
    .eq("slug", slug)
    .eq("aktif", true)
    .maybeSingle();

  if (dukkanError) {
    logDukkanAction("vitrinVerisi", "dukkan fetch failed", { slug, err: dukkanError.message });
    return null;
  }
  if (!dukkan) return null;

  const [urunSonucu, cihazlar] = await Promise.all([
    supabase
      .from("dukkan_urunleri")
      .select("*")
      .eq("dukkan_id", dukkan.id)
      .eq("aktif", true)
      .order("sira", { ascending: true }),
    fetchPublishedSecondHandDevices(supabase, dukkan.user_id),
  ]);

  if (urunSonucu.error) {
    logDukkanAction("vitrinVerisi", "urun fetch failed", { slug, err: urunSonucu.error.message });
  }

  const urunler = urunSonucu.data ?? [];

  return {
    dukkan,
    urunler,
    cihazlar,
    klasorler: buildVitrinKlasorleri(urunler, cihazlar),
    urunSluglari: buildUrunSluglari(urunler),
  };
});

export type VitrinChromeDurumu = {
  isOwner: boolean;
  showContactNav: boolean;
  showTeknikServisNav: boolean;
  showPazaryeriNav: boolean;
  showKatalogNav: boolean;
};

/** Vitrin üst çubuğunun hangi menüleri göstereceği ve ziyaretçinin mağaza sahibi olup olmadığı. */
export async function getVitrinChromeDurumu(veri: VitrinVerisi): Promise<VitrinChromeDurumu> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return {
    isOwner: user?.id === veri.dukkan.user_id,
    showContactNav: veri.dukkan.iletisim_sss_goster ?? true,
    showTeknikServisNav: veri.dukkan.teknik_servis_aktif ?? false,
    showPazaryeriNav: veri.cihazlar.length > 0,
    showKatalogNav: veri.dukkan.katalog_modu_aktif ?? false,
  };
}
