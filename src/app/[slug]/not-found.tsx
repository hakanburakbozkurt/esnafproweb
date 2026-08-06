import { SubPageShell } from "@/components/layout/sub-page-shell";

export default function StoreNotFound() {
  return (
    <SubPageShell
      title="Mağaza bulunamadı"
      description="Aradığınız vitrin adresi mevcut değil veya yayından kaldırılmış olabilir."
    >
      <a
        href="/"
        className="inline-flex rounded-full bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-slate-800"
      >
        Ana sayfaya dön
      </a>
    </SubPageShell>
  );
}
