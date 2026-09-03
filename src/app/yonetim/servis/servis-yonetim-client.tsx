"use client";

import { useCallback, useEffect, useState, useTransition, type FormEvent } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { TechnicalServiceDetailModal } from "@/components/servis/technical-service-detail-modal";
import {
  getServiceStatusLabel,
  getServiceStatusStyle,
} from "@/lib/constants/service-status";
import {
  getTechnicalServiceDetail,
  searchTechnicalServices,
} from "@/lib/servis/servis-yonetim-actions";
import {
  APPROVAL_STATUS_LABELS,
  APPROVAL_STATUS_STYLES,
  formatServiceDateTime,
} from "@/lib/servis/servis-yonetim-utils";
import type {
  TechnicalServiceListItem,
  TechnicalServiceRecord,
} from "@/lib/servis/technical-service.types";
import { cn } from "@/lib/utils/cn";

type ServisYonetimClientProps = {
  initialRecords: TechnicalServiceListItem[];
};

export function ServisYonetimClient({
  initialRecords,
}: ServisYonetimClientProps) {
  const [records, setRecords] = useState(initialRecords);
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [listError, setListError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detailRecord, setDetailRecord] = useState<TechnicalServiceRecord | null>(
    null
  );
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  const runSearch = useCallback(
    (overrides?: { search?: string; dateFrom?: string; dateTo?: string }) => {
      startTransition(async () => {
        setListError(null);
        const result = await searchTechnicalServices({
          search: overrides?.search ?? search,
          dateFrom: overrides?.dateFrom ?? dateFrom,
          dateTo: overrides?.dateTo ?? dateTo,
        });

        if (!result.ok) {
          setListError(result.error);
          return;
        }

        setRecords(result.records);
      });
    },
    [search, dateFrom, dateTo]
  );

  useEffect(() => {
    if (!selectedId) {
      setDetailRecord(null);
      setDetailError(null);
      return;
    }

    let cancelled = false;
    setDetailLoading(true);
    setDetailError(null);
    setDetailRecord(null);

    void getTechnicalServiceDetail(selectedId).then((result) => {
      if (cancelled) return;

      setDetailLoading(false);
      if (!result.ok) {
        setDetailError(result.error);
        return;
      }

      setDetailRecord(result.record);
    });

    return () => {
      cancelled = true;
    };
  }, [selectedId]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    runSearch();
  }

  function handleClearFilters() {
    setSearch("");
    setDateFrom("");
    setDateTo("");
    setListError(null);
    startTransition(async () => {
      const result = await searchTechnicalServices({});
      if (result.ok) {
        setRecords(result.records);
      } else {
        setListError(result.error);
      }
    });
  }

  return (
    <div className="space-y-6">
      <form
        onSubmit={handleSubmit}
        className="rounded-3xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-5"
      >
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
          <SlidersHorizontal className="size-4 text-emerald-600" aria-hidden />
          Arama ve Tarih Filtresi
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <label className="block sm:col-span-2 lg:col-span-2">
            <span className="mb-1.5 block text-xs font-medium text-slate-500">
              Müşteri adı, telefon veya cihaz modeli
            </span>
            <span className="relative block">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Örn. Ahmet, iPhone 13, 0532…"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/80 py-2.5 pl-10 pr-3 text-sm text-slate-900 outline-none ring-emerald-500/30 transition focus:border-emerald-300 focus:bg-white focus:ring-2"
              />
            </span>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-slate-500">
              Başlangıç tarihi
            </span>
            <input
              type="date"
              value={dateFrom}
              onChange={(event) => setDateFrom(event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2.5 text-sm text-slate-900 outline-none ring-emerald-500/30 transition focus:border-emerald-300 focus:bg-white focus:ring-2"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-slate-500">
              Bitiş tarihi
            </span>
            <input
              type="date"
              value={dateTo}
              onChange={(event) => setDateTo(event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2.5 text-sm text-slate-900 outline-none ring-emerald-500/30 transition focus:border-emerald-300 focus:bg-white focus:ring-2"
            />
          </label>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex min-h-10 items-center rounded-full bg-emerald-600 px-5 text-sm font-bold text-white shadow-md shadow-emerald-600/20 transition hover:bg-emerald-700 disabled:opacity-60"
          >
            {isPending ? "Filtreleniyor…" : "Filtrele"}
          </button>
          <button
            type="button"
            onClick={handleClearFilters}
            disabled={isPending}
            className="inline-flex min-h-10 items-center rounded-full border border-slate-200 px-5 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 disabled:opacity-60"
          >
            Filtreleri Temizle
          </button>
        </div>
      </form>

      <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-slate-600">
        <p>
          <span className="font-semibold text-slate-900">{records.length}</span>{" "}
          servis kaydı
          {(search || dateFrom || dateTo) && " (filtre uygulandı)"}
        </p>
      </div>

      {listError && (
        <div
          role="alert"
          className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {listError}
        </div>
      )}

      {records.length === 0 ? (
        <div className="rounded-3xl border border-emerald-100 bg-emerald-50/50 px-6 py-12 text-center">
          <p className="text-sm text-slate-600">
            Seçilen kriterlere uygun servis kaydı bulunamadı.
          </p>
        </div>
      ) : (
        <>
          <div className="hidden overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm md:block">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="border-b border-slate-100 bg-slate-50/80 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Teslim Alım</th>
                    <th className="px-4 py-3 font-semibold">Müşteri</th>
                    <th className="px-4 py-3 font-semibold">Cihaz</th>
                    <th className="px-4 py-3 font-semibold">Durum</th>
                    <th className="px-4 py-3 font-semibold">Personel</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {records.map((record) => (
                    <tr
                      key={record.id}
                      tabIndex={0}
                      onClick={() => setSelectedId(record.id)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          setSelectedId(record.id);
                        }
                      }}
                      className="cursor-pointer transition hover:bg-emerald-50/40 focus-visible:bg-emerald-50/60 focus-visible:outline-none"
                    >
                      <td className="px-4 py-3.5 align-top">
                        <p className="font-medium text-slate-900">
                          {formatServiceDateTime(record.created_at)}
                        </p>
                        {record.service_id && (
                          <p className="mt-0.5 font-mono text-xs text-slate-400">
                            {record.service_id}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3.5 align-top">
                        <p className="font-semibold text-slate-900">
                          {record.customer_name}
                        </p>
                        <p className="mt-0.5 text-slate-600">
                          {record.customer_phone?.trim() || "—"}
                        </p>
                      </td>
                      <td className="px-4 py-3.5 align-top">
                        <p className="font-medium text-slate-900">
                          {record.device_info}
                        </p>
                        {record.device_imei?.trim() && (
                          <p className="mt-0.5 font-mono text-xs text-slate-500">
                            {record.device_imei}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3.5 align-top">
                        <div className="flex flex-col gap-1.5">
                          {record.status && (
                            <span
                              className={cn(
                                "inline-flex w-fit rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1 ring-inset",
                                getServiceStatusStyle(record.status)
                              )}
                            >
                              {getServiceStatusLabel(record.status)}
                            </span>
                          )}
                          <span
                            className={cn(
                              "inline-flex w-fit rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1 ring-inset",
                              APPROVAL_STATUS_STYLES[record.approval_status] ??
                                "bg-slate-100 text-slate-600 ring-slate-500/20"
                            )}
                          >
                            {APPROVAL_STATUS_LABELS[record.approval_status] ??
                              record.approval_status}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 align-top text-slate-700">
                        {record.technician_name?.trim() || "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <ul className="space-y-3 md:hidden">
            {records.map((record) => (
              <li key={record.id}>
                <button
                  type="button"
                  onClick={() => setSelectedId(record.id)}
                  className="w-full rounded-2xl border border-slate-200/80 bg-white p-4 text-left shadow-sm transition hover:border-emerald-200 hover:bg-emerald-50/30"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs text-slate-500">
                        {formatServiceDateTime(record.created_at)}
                      </p>
                      <p className="mt-1 truncate font-bold text-slate-900">
                        {record.customer_name}
                      </p>
                      <p className="truncate text-sm text-slate-600">
                        {record.device_info}
                      </p>
                    </div>
                    {record.status && (
                      <span
                        className={cn(
                          "inline-flex shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-semibold ring-1 ring-inset",
                          getServiceStatusStyle(record.status)
                        )}
                      >
                        {getServiceStatusLabel(record.status)}
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-xs text-slate-500">
                    {record.customer_phone?.trim() || "Telefon yok"} ·{" "}
                    {record.technician_name?.trim() || "Personel atanmadı"}
                  </p>
                </button>
              </li>
            ))}
          </ul>
        </>
      )}

      {selectedId && (
        <TechnicalServiceDetailModal
          record={detailRecord}
          isLoading={detailLoading}
          error={detailError}
          onClose={() => setSelectedId(null)}
        />
      )}
    </div>
  );
}
