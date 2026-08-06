import {
  getServiceStatusLabel,
  getServiceStatusStyle,
} from "@/lib/constants/service-status";
import type { PublicServiceDevice } from "@/types/database.types";

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

export function QrServiceView({ device }: { device: PublicServiceDevice }) {
  const activeStep = getStepIndex(device.status);
  const deviceTitle = device.device_model?.trim() || "Cihazınız";

  return (
    <article className="space-y-6">
      <header>
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-600">
          Size Özel Servis Görünümü
        </p>
        <h3 className="mt-2 text-xl font-bold text-emerald-700 lg:text-2xl">
          {deviceTitle}
        </h3>
      </header>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
            Güncel Durum
          </p>
          <span
            className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${getServiceStatusStyle(device.status)}`}
          >
            {getServiceStatusLabel(device.status)}
          </span>
        </div>
        <p className="text-xs text-slate-500">
          Kod:{" "}
          <span className="font-mono font-medium text-slate-700">
            {device.device_code}
          </span>
        </p>
      </div>

      {device.issue_description && (
        <p className="text-sm leading-relaxed text-slate-500 lg:text-base">
          {device.issue_description}
        </p>
      )}

      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
          Süreç
        </p>
        <ol className="mt-4 space-y-3">
          {TIMELINE_STEPS.map((step, index) => {
            const isComplete = index <= activeStep;
            const isCurrent = index === activeStep;

            return (
              <li key={step.key} className="flex items-center gap-3">
                <span
                  className={`flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                    isComplete
                      ? "bg-emerald-600 text-white"
                      : "bg-slate-100 text-slate-400"
                  }`}
                >
                  {index + 1}
                </span>
                <span
                  className={`text-sm font-medium ${
                    isCurrent
                      ? "text-emerald-600"
                      : isComplete
                        ? "text-slate-900"
                        : "text-slate-400"
                  }`}
                >
                  {step.label}
                </span>
              </li>
            );
          })}
        </ol>
      </div>
    </article>
  );
}
