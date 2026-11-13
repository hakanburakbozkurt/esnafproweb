import { notFound } from "next/navigation";
import { EsnafKurulumClient } from "@/app/yonetim/admin/esnaf-kurulum/esnaf-kurulum-client";
import { AdminNav } from "@/components/yonetim/admin-nav";
import { adminPanelClass } from "@/components/yonetim/admin-ui";
import { YonetimDarkShell } from "@/components/yonetim/yonetim-dark-shell";
import { isSuperAdminUser } from "@/lib/auth/super-admin";
import { getPublicSiteUrl } from "@/lib/auth/site-url";
import { logDukkanAction } from "@/lib/dukkan/logger";
import { createAdminClient, isAdminClientConfigured } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export type BekleyenKurulum = {
  id: string;
  dukkan_adi: string;
  slug: string;
  created_at: string;
};

async function bekleyenKurulumlariGetir(): Promise<BekleyenKurulum[]> {
  if (!isAdminClientConfigured()) return [];
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("dukkanlar")
    .select("id, dukkan_adi, slug, created_at")
    .is("terms_accepted_at", null)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    logDukkanAction("esnafKurulumPage", "list failed", { err: error.message });
    return [];
  }
  return data ?? [];
}

export default async function EsnafKurulumPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !isSuperAdminUser(user)) {
    notFound();
  }

  const bekleyenler = await bekleyenKurulumlariGetir();

  return (
    <YonetimDarkShell backHref="/yonetim/admin" backLabel="Admin">
      <div className="space-y-8">
        <section className={adminPanelClass}>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-indigo-400">
            Super Admin
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-zinc-100">
            Esnaf adına dükkan kur
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-zinc-400">
            Telefoncunun WhatsApp&apos;tan gönderdiği bilgileri girin. Sayfa hemen oluşur;
            esnaf davet bağlantısıyla kendi şifresini belirleyip koşulları onaylayınca
            sayfa Google&apos;a açılır. Onaya kadar sayfa görünür ama Google&apos;da
            listelenmez.
          </p>
          {!isAdminClientConfigured() && (
            <p className="mt-4 rounded-xl border border-red-500/40 bg-red-950/40 px-4 py-3 text-sm text-red-200">
              SUPABASE_SERVICE_ROLE_KEY tanımlı değil; bu sayfa çalışmaz.
            </p>
          )}
          <div className="mt-6">
            <AdminNav current="esnaf-kurulum" />
          </div>
        </section>

        <EsnafKurulumClient bekleyenler={bekleyenler} siteUrl={getPublicSiteUrl()} />
      </div>
    </YonetimDarkShell>
  );
}
