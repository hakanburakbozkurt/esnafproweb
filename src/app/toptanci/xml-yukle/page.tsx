import { redirect } from "next/navigation";
import { isWholesalerAccount, resolveWholesalerPath } from "@/lib/auth/wholesaler";
import { createClient } from "@/lib/supabase/server";

export default async function LegacyToptanciXmlPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user && (await isWholesalerAccount(supabase, user))) {
    redirect(await resolveWholesalerPath(supabase, user.id, "/yonetim/toptanci/xml"));
  }

  redirect("/giris?next=/yonetim/toptanci/xml");
}
