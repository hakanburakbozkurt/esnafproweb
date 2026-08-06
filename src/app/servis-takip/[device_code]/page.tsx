import Link from "next/link";
import { notFound } from "next/navigation";
import { SubPageShell } from "@/components/layout/sub-page-shell";
import { Card } from "@/components/ui/card";
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

const TIMELINE_STEPS = [
  { key: "tamirde", label: "Tamirde" },
  { key: "hazir", label: "Hazır" },
  { key: "teslim_edildi", label: "Teslim Edildi" },
  { key: "İncelemede", label: "İncelemede" },
] as const;

function getStepIndex(status: string) {
  const index = TIMELINE_STEPS.findIndex((step) => step.key === status);
  return index === -1 ? 0 : index;
}

export default async function ServisTakipPage({ params }: PageProps) {
  const { device_code } = await params;
  const supabase = await createClient();

  const device = await getPublicServiceDevice(supabase, device_code);

  if (!device) {
    notFound();
  }

  const store = await getPublicServiceStoreInfo(supabase, device.store_id);
  const activeStep = getStepIndex(device.status);

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
              <p className="mt-1 text-lg font-semibold text-slate-900">
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

        <Card>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
            Süreç
          </h2>
          <ol className="mt-6 space-y-4">
            {TIMELINE_STEPS.map((step, index) => {
              const isComplete = index <= activeStep;
              const isCurrent = index === activeStep;

              return (
                <li key={step.key} className="flex items-center gap-4">
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                      isComplete
                        ? "bg-emerald-600 text-white"
                        : "bg-slate-100 text-slate-400"
                    }`}
                  >
                    {index + 1}
                  </span>
                  <span
                    className={`text-sm font-medium ${
                      isCurrent ? "text-emerald-600" : isComplete ? "text-slate-900" : "text-slate-400"
                    }`}
                  >
                    {step.label}
                  </span>
                </li>
              );
            })}
          </ol>
        </Card>

        {store && (
          <Card>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
              Servis Noktası
            </h2>
            <p className="mt-3 font-semibold text-slate-900">{store.dukkan_adi}</p>
            {store.telefon && (
              <p className="mt-1 text-sm text-slate-500">{store.telefon}</p>
            )}
            <Link
              href={`/${store.slug}`}
              className="mt-4 inline-block text-sm font-medium text-emerald-600 hover:text-emerald-700"
            >
              Mağaza vitrini →
            </Link>
          </Card>
        )}

        <p className="text-center text-xs text-slate-400">
          Takip kodu: <span className="font-mono">{device.device_code}</span>
        </p>
      </div>
    </SubPageShell>
  );
}
