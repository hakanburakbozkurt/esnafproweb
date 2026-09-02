import { ServiceApprovalClient } from "@/components/servis/service-approval-client";
import { SubPageShell } from "@/components/layout/sub-page-shell";
import { Card } from "@/components/ui/card";
import { extractApprovalTokenFromSearchParams } from "@/lib/servis/approval-token";
import { lookupServiceApprovalByToken } from "@/lib/servis/service-approval";
import type { Metadata } from "next";
import Link from "next/link";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Servis Onayı | EsnafPRO",
  description:
    "Teknik servise bıraktığınız cihaz için dijital servis şartları onayı.",
  robots: { index: false, follow: false },
};

type PageProps = {
  searchParams: Promise<{
    token?: string | string[];
    approval_token?: string | string[];
    approvalToken?: string | string[];
    service_id?: string | string[];
  }>;
};

function InvalidTokenMessage({
  detail,
}: {
  detail?: string;
}) {
  return (
    <Card className="mx-auto max-w-xl text-center">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-red-600">
        Geçersiz Bağlantı
      </p>
      <h2 className="mt-3 text-xl font-bold text-slate-900">
        Onay kaydı bulunamadı
      </h2>
      <p className="mt-3 text-sm leading-relaxed text-slate-600">
        Bu onay linki geçersiz, eksik veya süresi dolmuş olabilir. Size
        gönderilen orijinal bağlantıyı kullanın veya servis noktanızla
        iletişime geçin.
      </p>
      {process.env.NODE_ENV === "development" && detail && (
        <p className="mt-4 rounded-xl bg-slate-100 px-3 py-2 text-left font-mono text-xs text-slate-600">
          {detail}
        </p>
      )}
      <Link
        href="/"
        className="mt-6 inline-flex text-sm font-semibold text-emerald-700 hover:text-emerald-800"
      >
        Ana sayfaya dön →
      </Link>
    </Card>
  );
}

export default async function ServisOnayPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const trimmedToken = extractApprovalTokenFromSearchParams(params);

  if (!trimmedToken) {
    return (
      <SubPageShell
        title={
          <>
            Servis <span className="text-emerald-600">Onayı</span>
          </>
        }
        description="Teknik servise bıraktığınız cihaz için dijital onay sayfası."
        contentWidth="2xl"
        centerHeader
      >
        <InvalidTokenMessage detail="URL'de token parametresi yok (?token=... veya ?approval_token=...)." />
      </SubPageShell>
    );
  }

  const lookup = await lookupServiceApprovalByToken(trimmedToken);

  if (!lookup.ok) {
    return (
      <SubPageShell
        title={
          <>
            Servis <span className="text-emerald-600">Onayı</span>
          </>
        }
        description="Teknik servise bıraktığınız cihaz için dijital onay sayfası."
        contentWidth="2xl"
        centerHeader
      >
        <InvalidTokenMessage
          detail={`${lookup.reason}: ${lookup.message}`}
        />
      </SubPageShell>
    );
  }

  const record = lookup.record;

  return (
    <SubPageShell
      title={
        <>
          Servis <span className="text-emerald-600">Onayı</span>
        </>
      }
      description="Cihaz bilgilerinizi kontrol edin ve servis şartlarını dijital ortamda onaylayın."
      contentWidth="2xl"
      centerHeader
    >
      <ServiceApprovalClient token={trimmedToken} record={record} />
    </SubPageShell>
  );
}
