import { notFound } from "next/navigation";
import { FaqAdminClient } from "@/app/yonetim/admin/sss/faq-admin-client";
import { FaqAdminShell } from "@/app/yonetim/admin/sss/faq-admin-shell";
import { getAllFaqsAdmin } from "@/lib/faqs/get-faqs";
import { isSuperAdminUser } from "@/lib/auth/super-admin";
import { createClient } from "@/lib/supabase/server";

export default async function FaqAdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !isSuperAdminUser(user)) {
    notFound();
  }

  const faqs = await getAllFaqsAdmin();

  return (
    <FaqAdminShell
      title={
        <>
          Admin · <span className="text-indigo-400">SSS</span>
        </>
      }
      description="Ana sayfa ve fiyatlandırma SSS bölümlerini ayrı ayrı yönetin."
    >
      <FaqAdminClient faqs={faqs} />
    </FaqAdminShell>
  );
}
