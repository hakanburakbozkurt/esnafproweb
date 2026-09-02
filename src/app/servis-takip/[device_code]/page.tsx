import { notFound } from "next/navigation";
import { SubPageShell } from "@/components/layout/sub-page-shell";
import { Card } from "@/components/ui/card";
import { ServiceTrackingTimeline } from "@/components/servis/service-tracking-timeline";
import { ServicePointCard } from "@/components/servis/service-point-card";
import {
  getServiceStatusLabel,
  getServiceStatusStyle,
} from "@/lib/constants/service-status";
import {
  getPublicServiceDevice,
  getPublicServiceStoreInfo,
} from "@/lib/dukkan/service-device-public";
import { createClient } from "@/lib/supabase/server";
import type { Metadata } from "next";

type PageProps = {
  params: Promise<{ device_code: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { device_code } = await params;
  return {
    title: `Servis Takip ${device_code} | EsnafPRO`,
    description: "Cihazınızın teknik servis durumunu anlık takip edin.",
  };
}

export default async function ServisTakipPage({ params }: PageProps) {
  const { device_code } = await params;
  const supabase = await createClient();

  const device = await getPublicServiceDevice(supabase, device_code);

  if (!device) {
    notFound();
  }

  const store = await getPublicServiceStoreInfo(supabase, device.store_id);

  return (
    <SubPageShell
      title={
        <>
          Cihaz <span className="text-emerald-600">Takibi</span>
        </>
      }
      description="Teknik servise bıraktığınız cihazın güncel durumunu buradan görüntüleyebilirsiniz."
    >
      <div className="mx-auto max-w-xl space-y-6">
        <Card>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-slate-500">Cihaz</p>
              <p className="mt-1 text-lg font-semibold text-gray-900">
                {device.device_model?.trim() || "—"}
              </p>
            </div>
            <span
              className={`inline-flex shrink-0 rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${getServiceStatusStyle(device.status)}`}
            >
              {getServiceStatusLabel(device.status)}
            </span>
          </div>

          {device.issue_description && (
            <p className="mt-4 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
              {device.issue_description}
            </p>
          )}
        </Card>

        <ServiceTrackingTimeline status={device.status} />

        {store && <ServicePointCard store={store} />}

        <p className="text-center text-xs text-slate-400">
          Takip kodu: <span className="font-mono">{device.device_code}</span>
        </p>
      </div>
    </SubPageShell>
  );
}
