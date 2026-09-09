import { LocalTamirPriceWizardClient } from "@/components/local-yonetim/local-tamir-price-wizard-client";
import { isSuperAdminUser } from "@/lib/auth/super-admin";
import { getTamirWizardCatalog } from "@/lib/local-yonetim/tamir-wizard/get-tamir-wizard-catalog";
import { createClient } from "@/lib/supabase/server";

export default async function LocalYonetimFiyatSihirbaziPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { markalar, categories, error: loadError } = await getTamirWizardCatalog();
  const canEdit = isSuperAdminUser(user);

  return (
    <LocalTamirPriceWizardClient
      markalar={markalar}
      categories={categories}
      canEdit={canEdit}
      loadError={loadError}
    />
  );
}
