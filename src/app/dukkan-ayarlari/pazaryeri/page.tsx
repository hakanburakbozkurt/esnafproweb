import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PazaryeriClient } from "@/app/dukkan-ayarlari/pazaryeri/pazaryeri-client";
import { isWholesalerAccount, WHOLESALER_ONBOARDING_PATH } from "@/lib/auth/wholesaler";
import { logDukkanAction } from "@/lib/dukkan/logger";
import type {
  PazaryeriBaglantiOzeti,
  PazaryeriSayfaUrunu,
} from "@/components/dukkan/pazaryeri/types";
import { createClient } from "@/lib/supabase/server";
import type { PazaryeriUrunu } from "@/types/database.types";

export const metadata: Metadata = {
  title: "Pazaryeri Bağlantıları",
  robots: { index: false, follow: false },
};

export default async function Page() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user && (await isWholesalerAccount(supabase, user))) {
    redirect(WHOLESALER_ONBOARDING_PATH);
  }

  let dukkan: { id: string; slug: string } | null = null;
  let baglanti: PazaryeriBaglantiOzeti | null = null;
  let urunler: PazaryeriSayfaUrunu[] = [];
  let loadError: string | null = null;

  if (user) {
    const { data, error } = await supabase
      .from("dukkanlar")
      .select("id, slug")
      .eq("user_id", user.id)
      .maybeSingle();
    if (error) {
      logDukkanAction("pazaryeriPage", "shop lookup failed", { error: error.message });
      loadError = "Mağaza bilgileri yüklenemedi. Lütfen sayfayı yenileyin.";
    }
    dukkan = data;
  }

  if (dukkan) {
    const [baglantiRes, urunRes, kayitRes] = await Promise.all([
      supabase
        .from("pazaryeri_baglantilari")
        .select("satici_id, son_test_basarili, son_test_at")
        .eq("dukkan_id", dukkan.id)
        .eq("platform", "trendyol")
        .maybeSingle(),
      supabase
        .from("dukkan_urunleri")
        .select("id, urun_adi, barkod, fiyat, stok_adedi, fotograf_url")
        .eq("dukkan_id", dukkan.id)
        .eq("aktif", true)
        .order("sira", { ascending: true }),
      supabase
        .from("pazaryeri_urunleri")
        .select("*")
        .eq("dukkan_id", dukkan.id)
        .eq("platform", "trendyol"),
    ]);

    for (const [name, res] of [
      ["connection", baglantiRes],
      ["products", urunRes],
      ["listings", kayitRes],
    ] as const) {
      if (res.error) {
        logDukkanAction("pazaryeriPage", `${name} lookup failed`, {
          dukkanId: dukkan.id,
          error: res.error.message,
        });
        loadError = "Bazı bilgiler yüklenemedi. Lütfen sayfayı yenileyin.";
      }
    }

    baglanti = baglantiRes.data
      ? {
          saticiId: baglantiRes.data.satici_id,
          sonTestBasarili: baglantiRes.data.son_test_basarili,
          sonTestAt: baglantiRes.data.son_test_at,
        }
      : null;

    const kayitByBarkod = new Map<string, PazaryeriUrunu>(
      (kayitRes.data ?? []).map((k) => [k.barkod, k])
    );
    urunler = (urunRes.data ?? []).map((u) => ({
      id: u.id,
      urunAdi: u.urun_adi,
      barkod: u.barkod,
      fiyat: u.fiyat,
      stokAdedi: u.stok_adedi,
      fotografUrl: u.fotograf_url,
      trendyol: u.barkod ? (kayitByBarkod.get(u.barkod) ?? null) : null,
    }));
  }

  return (
    <PazaryeriClient
      authenticated={!!user}
      dukkan={dukkan}
      baglanti={baglanti}
      urunler={urunler}
      loadError={loadError}
    />
  );
}
