import { redirect } from "next/navigation";
import { isWholesalerAccount, WHOLESALER_ONBOARDING_PATH } from "@/lib/auth/wholesaler";
import { createClient } from "@/lib/supabase/server";
import DukkanAcPage from "@/app/dukkan-ac/dukkan-ac-form";

export default async function Page() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user && (await isWholesalerAccount(supabase, user))) {
    redirect(WHOLESALER_ONBOARDING_PATH);
  }

  if (user) {
    const { data } = await supabase
      .from("dukkanlar")
      .select("slug")
      .eq("user_id", user.id)
      .maybeSingle();

    if (data?.slug) {
      redirect(`/${data.slug}`);
    }
  }

  return <DukkanAcPage authenticated={!!user} />;
}
