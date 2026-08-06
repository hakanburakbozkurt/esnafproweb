import Link from "next/link";
import { Card } from "@/components/ui/card";

export function AuthRequiredCard({
  title = "Oturum gerekli",
  description = "Bu sayfaya erişmek için EsnafPRO hesabınızla giriş yapmalısınız.",
  loginHref = "/giris",
}: {
  title?: string;
  description?: string;
  loginHref?: string;
}) {
  return (
    <Card className="mx-auto w-full max-w-lg">
      <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
      <p className="mt-2 text-sm leading-relaxed text-slate-500">{description}</p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href={loginHref}
          className="inline-flex rounded-full bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-slate-800"
        >
          Giriş Yap
        </Link>
        <Link
          href="/"
          className="inline-flex rounded-full border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:border-slate-300 hover:text-slate-900"
        >
          Ana sayfa
        </Link>
      </div>
    </Card>
  );
}
