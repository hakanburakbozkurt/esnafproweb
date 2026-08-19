import Link from "next/link";
import { AdminNav } from "@/components/yonetim/admin-nav";
import { AdminShopSettingsForm } from "@/components/yonetim/admin-shop-settings-form";
import { adminNavCardClass, adminPanelClass } from "@/components/yonetim/admin-ui";
import type { ShopApprovalStatus } from "@/lib/dukkan/approval-status";

type AdminDashboardClientProps = {
  approvalCounts: Record<ShopApprovalStatus, number>;
  dukkan: {
    dukkan_adi: string;
    slug: string;
    google_place_id: string | null;
    google_reviews_enabled: boolean;
  } | null;
};

const adminModules = [
  {
    href: "/yonetim/admin/fiyatlar",
    title: "Fiyatlandırma",
    description: "Landing sayfası paketlerini yönetin.",
    badge: null as string | null,
  },
  {
    href: "/yonetim/admin/sss",
    title: "SSS Yönetimi",
    description: "Kurumsal SSS içeriklerini düzenleyin.",
    badge: null,
  },
  {
    href: "/yonetim/admin/dukkan-onay",
    title: "Dükkan Onay",
    description: "Bekleyen vitrin başvurularını onaylayın veya reddedin.",
    badge: "pending" as const,
  },
];

export function AdminDashboardClient({
  approvalCounts,
  dukkan,
}: AdminDashboardClientProps) {
  return (
    <div className="space-y-8">
      <section className={adminPanelClass}>
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-indigo-400">
          Super Admin
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-zinc-100 lg:text-4xl">
          Admin Paneli
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-zinc-400">
          Platform yönetimi, dükkan onayları ve kendi vitrininizin Google yorum ayarları
          buradan erişilebilir.
        </p>
        <div className="mt-6">
          <AdminNav current="home" />
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {adminModules.map((module) => {
          const pendingBadge =
            module.badge === "pending" && approvalCounts.pending > 0
              ? `${approvalCounts.pending} bekleyen`
              : null;

          return (
            <Link key={module.href} href={module.href} className={adminNavCardClass}>
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-lg font-bold text-zinc-100 group-hover:text-indigo-200">
                  {module.title}
                </h2>
                {pendingBadge && (
                  <span className="shrink-0 rounded-full border border-amber-500/40 bg-amber-950/50 px-2.5 py-0.5 text-xs font-semibold text-amber-300">
                    {pendingBadge}
                  </span>
                )}
              </div>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-zinc-400">
                {module.description}
              </p>
              <span className="mt-4 text-sm font-medium text-indigo-400 group-hover:text-indigo-300">
                Panele git →
              </span>
            </Link>
          );
        })}
      </section>

      <section className={`${adminPanelClass} grid gap-4 sm:grid-cols-3`}>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Bekleyen</p>
          <p className="mt-1 text-2xl font-bold text-amber-300">{approvalCounts.pending}</p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Aktif</p>
          <p className="mt-1 text-2xl font-bold text-emerald-300">{approvalCounts.active}</p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Reddedilen</p>
          <p className="mt-1 text-2xl font-bold text-red-300">{approvalCounts.rejected}</p>
        </div>
      </section>

      <AdminShopSettingsForm dukkan={dukkan} />
    </div>
  );
}
