import type { Metadata } from "next";
import { redirect } from "next/navigation";
import DukkanUrunleriPage from "@/app/dukkan-ayarlari/urunler/urunler-client";
import { isWholesalerAccount, WHOLESALER_ONBOARDING_PATH } from "@/lib/auth/wholesaler";
import { logDukkanAction } from "@/lib/dukkan/logger";
import { createClient } from "@/lib/supabase/server";
import type { DukkanUrunu } from "@/types/database.types";

export const metadata: Metadata = {
  title: "Ürün Yönetimi",
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

  let dukkan: { id: string; slug: string; dukkan_adi: string } | null = null;
  let urunler: DukkanUrunu[] = [];
  let loadError: string | null = null;

  if (user) {
    const { data, error } = await supabase
      .from("dukkanlar")
      .select("id, slug, dukkan_adi")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      logDukkanAction("urunlerPage", "shop lookup failed", { error: error.message });
      loadError = "Mağaza bilgileri yüklenemedi. Lütfen sayfayı yenileyin.";
    }
    dukkan = data;

    if (dukkan) {
      const { data: urunData, error: urunError } = await supabase
        .from("dukkan_urunleri")
        .select("*")
        .eq("dukkan_id", dukkan.id)
        .eq("aktif", true)
        .order("sira", { ascending: true });

      if (urunError) {
        logDukkanAction("urunlerPage", "products lookup failed", {
          dukkanId: dukkan.id,
          error: urunError.message,
        });
        loadError = "Ürünler yüklenemedi. Kaydetmeden önce sayfayı yenileyin.";
      }
      urunler = urunData ?? [];
    }
  }

  return (
    <DukkanUrunleriPage
      authenticated={!!user}
      dukkan={dukkan}
      urunler={urunler}
      loadError={loadError}
    />
  );
}
