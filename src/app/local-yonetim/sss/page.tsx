import { LocalFaqClient } from "@/components/local-yonetim/local-faq-client";
import { isSuperAdminUser } from "@/lib/auth/super-admin";
import { countFaqsByContext, getAllFaqsAdmin } from "@/lib/faqs/get-faqs";
import { createClient } from "@/lib/supabase/server";

export default async function LocalYonetimSssPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { faqs, error: loadError } = await getAllFaqsAdmin();
  const canEdit = isSuperAdminUser(user);
  const counts = countFaqsByContext(faqs);

  return (
    <LocalFaqClient
      faqs={faqs}
      canEdit={canEdit}
      loadError={loadError}
      counts={counts}
    />
  );
}
