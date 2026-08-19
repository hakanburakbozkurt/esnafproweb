import { notFound } from "next/navigation";
import { DukkanOnayAdminClient } from "@/app/yonetim/admin/dukkan-onay/dukkan-onay-client";
import { DukkanOnayAdminShell } from "@/app/yonetim/admin/dukkan-onay/dukkan-onay-shell";
import { isSuperAdminUser } from "@/lib/auth/super-admin";
import { getAdminDukkanlar } from "@/lib/dukkan/get-admin-dukkanlar";
import { createClient } from "@/lib/supabase/server";

export default async function DukkanOnayAdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !isSuperAdminUser(user)) {
    notFound();
  }

  const dukkanlar = await getAdminDukkanlar();

  return (
    <DukkanOnayAdminShell
      title={
        <>
          Admin · <span className="text-indigo-400">Dükkan Onay</span>
        </>
      }
      description="Bekleyen vitrin başvurularını inceleyin; onaylayın veya reddedin."
    >
      <DukkanOnayAdminClient dukkanlar={dukkanlar} />
    </DukkanOnayAdminShell>
  );
}
