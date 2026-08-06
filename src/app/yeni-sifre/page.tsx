import { YeniSifreForm } from "@/app/yeni-sifre/yeni-sifre-form";
import { createClient } from "@/lib/supabase/server";

export default async function YeniSifrePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return <YeniSifreForm hasSession={!!user} />;
}
