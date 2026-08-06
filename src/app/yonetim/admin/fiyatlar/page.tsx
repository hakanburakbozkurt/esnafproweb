import { notFound } from "next/navigation";
import { PricingAdminClient } from "@/app/yonetim/admin/fiyatlar/pricing-admin-client";
import { PricingAdminShell } from "@/app/yonetim/admin/fiyatlar/pricing-admin-shell";
import { isSuperAdminUser } from "@/lib/auth/super-admin";
import { getAllPricingPlansAdmin } from "@/lib/pricing/get-pricing-plans";
import { createClient } from "@/lib/supabase/server";

export default async function PricingAdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !isSuperAdminUser(user)) {
    notFound();
  }

  const plans = await getAllPricingPlansAdmin();

  return (
    <PricingAdminShell
      title={
        <>
          Admin · <span className="text-indigo-400">Fiyatlar</span>
        </>
      }
      description="Landing fiyatlandırma paketlerini dinamik olarak yönetin."
    >
      <PricingAdminClient plans={plans} />
    </PricingAdminShell>
  );
}
