import { SubPageShell } from "@/components/layout/sub-page-shell";

export default function ServisTakipNotFound() {
  return (
    <SubPageShell
      title="Kayıt bulunamadı"
      description="Girdiğiniz takip koduna ait bir cihaz kaydı bulunamadı. Kodu kontrol edip tekrar deneyin."
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
