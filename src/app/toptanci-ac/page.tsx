import { redirect } from "next/navigation";
import ToptanciAcPage from "@/app/toptanci-ac/toptanci-ac-form";
import {
  isWholesalerAccount,
  WHOLESALER_XML_PATH,
} from "@/lib/auth/wholesaler";
import { hasToptanciProfile } from "@/lib/toptanci/get-toptanci";
import { createClient } from "@/lib/supabase/server";

export default async function Page() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user && !(await isWholesalerAccount(supabase, user))) {
    redirect("/dukkan-ac");
  }

  if (user && (await hasToptanciProfile(supabase, user.id))) {
    redirect(WHOLESALER_XML_PATH);
  }

  return <ToptanciAcPage authenticated={!!user} />;
}
