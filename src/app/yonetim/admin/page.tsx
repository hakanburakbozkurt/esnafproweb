import { notFound } from "next/navigation";
import { AdminDashboardClient } from "@/app/yonetim/admin/admin-dashboard-client";
import { isSuperAdminUser } from "@/lib/auth/super-admin";
import {
  countDukkanlarByApprovalStatus,
  getAdminDukkanlar,
} from "@/lib/dukkan/get-admin-dukkanlar";
import { YonetimDarkShell } from "@/components/yonetim/yonetim-dark-shell";
import { createClient } from "@/lib/supabase/server";

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !isSuperAdminUser(user)) {
    notFound();
  }

  const [dukkanlar, dukkanResult] = await Promise.all([
    getAdminDukkanlar(),
    supabase
      .from("dukkanlar")
      .select("dukkan_adi, slug, enlem, boylam")
      .eq("user_id", user.id)
      .maybeSingle(),
  ]);

  const approvalCounts = countDukkanlarByApprovalStatus(dukkanlar);

  return (
    <YonetimDarkShell backHref="/yonetim" backLabel="Yönetim">
      <AdminDashboardClient
        approvalCounts={approvalCounts}
        dukkan={dukkanResult.data}
      />
    </YonetimDarkShell>
  );
}
