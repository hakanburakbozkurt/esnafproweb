import { LocalPricingClient } from "@/components/local-yonetim/local-pricing-client";
import { isSuperAdminUser } from "@/lib/auth/super-admin";
import { getAllPricingPlansAdmin } from "@/lib/pricing/get-pricing-plans";
import { createClient } from "@/lib/supabase/server";

export default async function LocalYonetimFiyatlarPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [plans] = await Promise.all([getAllPricingPlansAdmin()]);
  const canEdit = isSuperAdminUser(user);

  return <LocalPricingClient plans={plans} canEdit={canEdit} />;
}
