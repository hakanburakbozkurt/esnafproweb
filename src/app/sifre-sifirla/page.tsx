import { redirect } from "next/navigation";
import { SifreSifirlaForm } from "@/app/sifre-sifirla/sifre-sifirla-form";
import { getPostLoginPath } from "@/lib/auth/wholesaler";
import { createClient } from "@/lib/supabase/server";

export default async function SifreSifirlaPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect(await getPostLoginPath(supabase, user));
  }

  return <SifreSifirlaForm />;
}
