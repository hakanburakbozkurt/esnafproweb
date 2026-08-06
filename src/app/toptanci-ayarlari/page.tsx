import { redirect } from "next/navigation";
import ToptanciAyarlariPage from "@/app/toptanci-ayarlari/toptanci-ayarlari-client";
import {
  isWholesalerAccount,
  WHOLESALER_ONBOARDING_PATH,
} from "@/lib/auth/wholesaler";
import { getToptanciByUserId } from "@/lib/toptanci/get-toptanci";
import { createClient } from "@/lib/supabase/server";

export default async function Page() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user && !(await isWholesalerAccount(supabase, user))) {
    redirect("/dukkan-ayarlari");
  }

  let toptanci = null;
  if (user) {
    toptanci = await getToptanciByUserId(supabase, user.id);
  }

  if (user && !toptanci) {
    redirect(WHOLESALER_ONBOARDING_PATH);
  }

  return (
    <ToptanciAyarlariPage authenticated={!!user} toptanci={toptanci} />
  );
}
