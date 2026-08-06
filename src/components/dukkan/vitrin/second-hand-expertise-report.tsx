"use client";

import { useState } from "react";
import {
  getSecondHandExpertiseReport,
  type PublicSecondHandDeviceDetail,
} from "@/lib/dukkan/second-hand-devices";
import { cn } from "@/lib/utils/cn";

type SecondHandExpertiseReportProps = {
  device: PublicSecondHandDeviceDetail;
  className?: string;
};

type ReportTab = "overview" | "expertise";

export function SecondHandExpertiseReport({
  device,
  className,
}: SecondHandExpertiseReportProps) {
  const report = getSecondHandExpertiseReport(device);
  const [activeTab, setActiveTab] = useState<ReportTab>("expertise");

  const overviewText =
    device.web_description?.trim() ||
    "Bu ilan için ek açıklama girilmemiş. Ekspertiz sekmesinden teknik durumu inceleyebilirsiniz.";

  return (
    <section
      className={cn(
        "rounded-2xl border border-slate-200/80 bg-white/85 p-5 shadow-sm lg:p-6",
        className
      )}
      aria-labelledby="ekspertiz-raporu-baslik"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
            Durum Raporu
          </p>
          <h2
            id="ekspertiz-raporu-baslik"
            className="mt-2 text-xl font-bold text-emerald-700 lg:text-2xl"
          >
            Ekspertiz Raporu
          </h2>
        </div>

        <div
          role="tablist"
          aria-label="Rapor sekmeleri"
          className="inline-flex rounded-full border border-slate-200/80 bg-slate-50/90 p-1"
        >
          <ReportTabButton
            active={activeTab === "overview"}
            onClick={() => setActiveTab("overview")}
            label="Genel Bakış"
          />
          <ReportTabButton
            active={activeTab === "expertise"}
            onClick={() => setActiveTab("expertise")}
            label="Ekspertiz"
          />
        </div>
      </div>

      <div className="mt-6">
        {activeTab === "overview" ? (
          <div className="rounded-xl bg-slate-50/80 px-4 py-4">
            <p className="whitespace-pre-line text-sm leading-relaxed text-slate-600">
              {overviewText}
            </p>
          </div>
        ) : report.hasContent ? (
          <div className="space-y-5">
            {report.highlights.length > 0 && (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {report.highlights.map((item) => (
                  <div
                    key={item.label}
                    className="rounded-xl border border-emerald-100 bg-emerald-50/70 px-4 py-4"
                  >
                    <p className="text-xs font-medium uppercase tracking-[0.12em] text-emerald-600/80">
                      {item.label}
                    </p>
                    <p className="mt-1 text-lg font-semibold text-emerald-800">
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-3">
              {report.sections.map((section) => (
                <article
                  key={section.title}
                  className={cn(
                    "rounded-xl border px-4 py-4",
                    section.tone === "warning"
                      ? "border-amber-200/80 bg-amber-50/60"
                      : section.tone === "success"
                        ? "border-emerald-200/80 bg-emerald-50/50"
                        : "border-slate-200/70 bg-slate-50/70"
                  )}
                >
                  <h3 className="text-sm font-semibold text-slate-800">
                    {section.title}
                  </h3>
                  <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-slate-600">
                    {section.content}
                  </p>
                </article>
              ))}
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/60 px-4 py-8 text-center">
            <p className="text-sm font-medium text-slate-600">
              Bu cihaz için henüz ekspertiz bilgisi girilmemiş.
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Detaylı bilgi için mağaza ile iletişime geçebilirsiniz.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

function ReportTabButton({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        "rounded-full px-4 py-2 text-xs font-semibold transition sm:text-sm",
        active
          ? "bg-emerald-600 text-white shadow-sm"
          : "text-slate-600 hover:text-emerald-600"
      )}
    >
      {label}
    </button>
  );
}
