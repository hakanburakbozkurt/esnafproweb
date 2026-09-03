import { notFound } from "next/navigation";
import { SubPageShell } from "@/components/layout/sub-page-shell";
import { ServicePointCard } from "@/components/servis/service-point-card";
import { ServiceTrackingLiveView } from "@/components/servis/service-tracking-live-view";
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
        <ServiceTrackingLiveView device={device} />

        {store && <ServicePointCard store={store} />}

        <p className="text-center text-xs text-slate-400">
          Takip kodu: <span className="font-mono">{device.device_code}</span>
        </p>
      </div>
    </SubPageShell>
  );
}
