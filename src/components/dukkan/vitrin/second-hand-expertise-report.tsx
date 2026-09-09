"use client";

import { useState } from "react";
import {
  getDeviceConditionMarkers,
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
  const conditionMarkers = getDeviceConditionMarkers(device);
  const [activeTab, setActiveTab] = useState<ReportTab>("overview");

  const overviewDescription =
    device.web_description?.trim() ||
    "Bu ilan için ek açıklama girilmemiş.";
  const notes = device.notes?.trim() ?? "";

  return (
    <section
      className={cn(
        "rounded-3xl border border-neutral-100 bg-white p-5 shadow-sm sm:p-7",
        className
      )}
      aria-labelledby="ekspertiz-raporu-baslik"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-600/80">
            Durum Raporu
          </p>
          <h2
            id="ekspertiz-raporu-baslik"
            className="mt-2 text-xl font-bold text-neutral-900 lg:text-2xl"
          >
            Genel Bakış & Ekspertiz
          </h2>
        </div>

        <div
          role="tablist"
          aria-label="Rapor sekmeleri"
          className="inline-flex rounded-full border border-neutral-100 bg-emerald-50/50 p-1"
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

      {conditionMarkers.length > 0 && (
        <div className="mt-5 rounded-2xl border border-emerald-100 bg-emerald-50/50 px-4 py-4 sm:px-5">
          <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">
            Cihaz Kondisyonu
          </h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {conditionMarkers.map((marker) => (
              <span
                key={marker.key}
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-semibold ring-1",
                  marker.tone === "emerald" &&
                    "bg-emerald-100 text-emerald-800 ring-emerald-200",
                  marker.tone === "amber" &&
                    "bg-amber-50 text-amber-800 ring-amber-100",
                  marker.tone === "sky" &&
                    "bg-sky-50 text-sky-700 ring-sky-100"
                )}
              >
                {marker.label}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6">
        {activeTab === "overview" ? (
          <div className="space-y-4">
            <div className="rounded-2xl border border-neutral-100 bg-neutral-50/70 px-4 py-4 sm:px-5 sm:py-5">
              <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">
                İlan Açıklaması
              </h3>
              <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-neutral-700">
                {overviewDescription}
              </p>
            </div>

            {notes ? (
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 px-4 py-4 sm:px-5 sm:py-5">
                <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">
                  Notlar
                </h3>
                <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-emerald-950/80">
                  {notes}
                </p>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-neutral-200 bg-neutral-50/50 px-4 py-4 text-sm text-neutral-500">
                Mağaza notu eklenmemiş.
              </div>
            )}
          </div>
        ) : report.hasContent ? (
          <div className="space-y-5">
            {report.highlights.length > 0 && (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {report.highlights.map((item) => (
                  <div
                    key={item.label}
                    className="rounded-2xl border border-emerald-100 bg-emerald-50/70 px-4 py-4"
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
                    "rounded-2xl border px-4 py-4 sm:px-5 sm:py-5",
                    section.tone === "warning"
                      ? "border-amber-200/80 bg-amber-50/60"
                      : section.tone === "success"
                        ? "border-emerald-200/80 bg-emerald-50/50"
                        : "border-neutral-100 bg-neutral-50/70"
                  )}
                >
                  <h3 className="text-sm font-semibold text-neutral-900">
                    {section.title}
                  </h3>
                  <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-neutral-700">
                    {section.content}
                  </p>
                </article>
              ))}
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-neutral-200 bg-neutral-50/60 px-4 py-8 text-center">
            <p className="text-sm font-medium text-neutral-700">
              Bu cihaz için henüz ek ekspertiz bilgisi girilmemiş.
            </p>
            <p className="mt-1 text-xs text-neutral-500">
              Tramer ve boya kayıtları burada görünür. Değişen parça ve arıza
              bilgileri yukarıda ayrıca vurgulanır.
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
          : "text-neutral-600 hover:text-emerald-700"
      )}
    >
      {label}
    </button>
  );
}
