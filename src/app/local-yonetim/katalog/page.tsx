import { LocalDeviceCatalogClient } from "@/components/local-yonetim/local-device-catalog-client";
import { isSuperAdminUser } from "@/lib/auth/super-admin";
import { getAdminCihazKataloguList } from "@/lib/katalog/get-cihaz-katalogu-admin";
import { createClient } from "@/lib/supabase/server";

export default async function LocalYonetimKatalogPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { rows, error: loadError } = await getAdminCihazKataloguList();
  const canEdit = isSuperAdminUser(user);

  return (
    <LocalDeviceCatalogClient
      rows={rows}
      canEdit={canEdit}
      loadError={loadError}
    />
  );
}
