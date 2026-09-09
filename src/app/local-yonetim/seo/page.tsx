import { LocalSeoClient } from "@/components/local-yonetim/local-seo-client";
import { isSuperAdminUser } from "@/lib/auth/super-admin";
import { getAdminPlatformPageSeoList } from "@/lib/seo/get-platform-page-seo";
import { createClient } from "@/lib/supabase/server";

export default async function LocalYonetimSeoPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { rows, error: loadError } = await getAdminPlatformPageSeoList();
  const canEdit = isSuperAdminUser(user);

  return <LocalSeoClient rows={rows} canEdit={canEdit} loadError={loadError} />;
}
