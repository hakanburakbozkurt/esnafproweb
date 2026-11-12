import { CihazSecenekleriPanel } from "@/components/local-yonetim/cihaz-secenekleri-panel";
import { LocalCihazKatalogTabs } from "@/components/local-yonetim/local-cihaz-katalog-tabs";
import { LocalDeviceCatalogClient } from "@/components/local-yonetim/local-device-catalog-client";
import { getCihazSecenekRows } from "@/lib/cihaz/get-cihaz-secenekleri";
import { isSuperAdminUser } from "@/lib/auth/super-admin";
import { getAdminCihazKataloguList } from "@/lib/katalog/get-cihaz-katalogu-admin";
import { createClient } from "@/lib/supabase/server";

export default async function LocalYonetimKatalogPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ rows, error: loadError }, secenekRows] = await Promise.all([
    getAdminCihazKataloguList(),
    getCihazSecenekRows(),
  ]);
  const canEdit = isSuperAdminUser(user);

  return (
    <LocalCihazKatalogTabs
      modeller={
        <LocalDeviceCatalogClient rows={rows} canEdit={canEdit} loadError={loadError} />
      }
      secenekler={<CihazSecenekleriPanel rows={secenekRows} canEdit={canEdit} />}
    />
  );
}
