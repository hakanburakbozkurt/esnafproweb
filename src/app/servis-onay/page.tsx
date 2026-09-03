import { ServiceApprovalClient } from "@/components/servis/service-approval-client";
import { ServicePointCard } from "@/components/servis/service-point-card";
import { SubPageShell } from "@/components/layout/sub-page-shell";
import { Card } from "@/components/ui/card";
import { getPublicServiceStoreInfo } from "@/lib/dukkan/service-device-public";
import {
  extractApprovalLookupCandidates,
  extractApprovalTokenFromSearchParams,
} from "@/lib/servis/approval-token";
import {
  lookupServiceApprovalByCandidates,
  type ServiceApprovalLookupFailureReason,
} from "@/lib/servis/service-approval";
import { createClient } from "@/lib/supabase/server";
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
  searchParams: Promise<
    import("@/lib/servis/approval-token").ApprovalSearchParams
  >;
};

function lookupFailureHeading(
  reason: ServiceApprovalLookupFailureReason
): string {
  switch (reason) {
    case "missing_token":
      return "Onay bağlantısı eksik";
    case "orphan_apr_token":
      return "Onay kodu kayıtlı değil";
    case "orphan_service_id":
      return "Servis kaydı bulunamadı";
    default:
      return "Onay kaydı bulunamadı";
  }
}

function InvalidTokenMessage({
  reason,
  userMessage,
  detail,
  trackingFallbackCode,
}: {
  reason: ServiceApprovalLookupFailureReason;
  userMessage: string;
  detail?: string;
  trackingFallbackCode?: string;
}) {
  return (
    <Card className="mx-auto max-w-xl text-center">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-red-600">
        Geçersiz Bağlantı
      </p>
      <h2 className="mt-3 text-xl font-bold text-slate-900">
        {lookupFailureHeading(reason)}
      </h2>
      <p className="mt-3 text-sm leading-relaxed text-slate-600">
        {userMessage}
      </p>

      {trackingFallbackCode && (
        <Link
          href={`/servis-takip/${encodeURIComponent(trackingFallbackCode)}`}
          className="mt-4 inline-flex text-sm font-semibold text-emerald-700 hover:text-emerald-800"
        >
          Servis takip sayfasına git →
        </Link>
      )}

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
  const candidates = extractApprovalLookupCandidates(params);
  const primaryToken = extractApprovalTokenFromSearchParams(params);

  if (candidates.length === 0) {
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
          reason="missing_token"
          userMessage="Onay bağlantısında geçerli bir kod bulunamadı. Size gönderilen orijinal linki kullanın."
          detail="URL'de onay parametresi yok (?token=..., ?approval_token=... veya ?id=...)."
        />
      </SubPageShell>
    );
  }

  const lookup = await lookupServiceApprovalByCandidates(candidates);

  if (!lookup.ok) {
    const trackingFallbackCode =
      primaryToken && /^\d{8}$/.test(primaryToken) ? primaryToken : undefined;

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
          reason={lookup.reason}
          userMessage={lookup.userMessage}
          detail={`${lookup.reason}: ${lookup.message}`}
          trackingFallbackCode={trackingFallbackCode}
        />
      </SubPageShell>
    );
  }

  const record = lookup.record;
  const supabase = await createClient();
  const store = record.store_id
    ? await getPublicServiceStoreInfo(supabase, record.store_id)
    : null;

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
      <div className="mx-auto max-w-2xl space-y-6">
        <ServiceApprovalClient
          token={lookup.matchedToken}
          record={record}
        />
        {store && <ServicePointCard store={store} />}
      </div>
    </SubPageShell>
  );
}
