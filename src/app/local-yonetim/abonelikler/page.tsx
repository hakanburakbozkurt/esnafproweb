import { LocalSubscriptionsClient } from "@/components/local-yonetim/local-subscriptions-client";
import { isSuperAdminUser } from "@/lib/auth/super-admin";
import { getSubscriptionAdminList } from "@/lib/local-yonetim/subscriptions/get-subscription-admin-list";
import { createClient } from "@/lib/supabase/server";

export default async function LocalYonetimAboneliklerPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { rows, error: loadError } = await getSubscriptionAdminList();
  const canEdit = isSuperAdminUser(user);

  return (
    <LocalSubscriptionsClient rows={rows} canEdit={canEdit} loadError={loadError} />
  );
}
