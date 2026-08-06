import { redirect } from "next/navigation";
import { isWholesalerAccount, WHOLESALER_ONBOARDING_PATH } from "@/lib/auth/wholesaler";
import { createClient } from "@/lib/supabase/server";
import DukkanAyarlariPage from "@/app/dukkan-ayarlari/dukkan-ayarlari-client";
import type { DukkanUrunu } from "@/types/database.types";

export default async function Page() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user && (await isWholesalerAccount(supabase, user))) {
    redirect(WHOLESALER_ONBOARDING_PATH);
  }

  let dukkan = null;
  let urunler: DukkanUrunu[] = [];

  if (user) {
    const { data } = await supabase
      .from("dukkanlar")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    dukkan = data;

    if (dukkan) {
      const { data: urunData } = await supabase
        .from("dukkan_urunleri")
        .select("*")
        .eq("dukkan_id", dukkan.id)
        .eq("aktif", true)
        .order("sira", { ascending: true });

      urunler = urunData ?? [];
    }
  }

  return (
    <DukkanAyarlariPage
      authenticated={!!user}
      dukkan={dukkan}
      urunler={urunler}
    />
  );
}
