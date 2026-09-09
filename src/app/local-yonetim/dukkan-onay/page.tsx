import { LocalDukkanOnayClient } from "@/components/local-yonetim/local-dukkan-onay-client";
import { isSuperAdminUser } from "@/lib/auth/super-admin";
import { getAdminDukkanlar } from "@/lib/dukkan/get-admin-dukkanlar";
import { createClient } from "@/lib/supabase/server";

export default async function LocalYonetimDukkanOnayPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const dukkanlar = await getAdminDukkanlar();
  const canEdit = isSuperAdminUser(user);

  return <LocalDukkanOnayClient dukkanlar={dukkanlar} canEdit={canEdit} />;
}
