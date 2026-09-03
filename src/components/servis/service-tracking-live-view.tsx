"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { ServiceTrackingTimeline } from "@/components/servis/service-tracking-timeline";
import {
  getServiceStatusLabel,
  getServiceStatusStyle,
  mapTechnicalServiceStatusToPublic,
} from "@/lib/constants/service-status";
import { createClient } from "@/lib/supabase/client";
import type { PublicServiceDevice } from "@/lib/dukkan/service-device-public";
import { cn } from "@/lib/utils/cn";

type ServiceTrackingLiveViewProps = {
  device: PublicServiceDevice;
};

type RealtimeConnectionState = "connecting" | "live" | "offline";

export function ServiceTrackingLiveView({ device }: ServiceTrackingLiveViewProps) {
  const [status, setStatus] = useState(device.status);
  const [connectionState, setConnectionState] =
    useState<RealtimeConnectionState>("connecting");

  const technicalServiceId = device.technical_service_id?.trim() ?? "";

  useEffect(() => {
    setStatus(device.status);
  }, [device.status]);

  useEffect(() => {
    if (!technicalServiceId) {
      setConnectionState("offline");
      return;
    }

    const supabase = createClient();
    const channelName = `servis-takip:ts:${technicalServiceId}`;

    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "technical_service",
          filter: `id=eq.${technicalServiceId}`,
        },
        (payload) => {
          const raw = payload.new;
          if (!raw || typeof raw !== "object") return;

          const nextStatus = (raw as { status?: unknown }).status;
          if (typeof nextStatus !== "string" || !nextStatus.trim()) return;

          setStatus(mapTechnicalServiceStatusToPublic(nextStatus));
        }
      )
      .subscribe((subscriptionStatus) => {
        if (subscriptionStatus === "SUBSCRIBED") {
          setConnectionState("live");
          return;
        }

        if (
          subscriptionStatus === "CLOSED" ||
          subscriptionStatus === "CHANNEL_ERROR"
        ) {
          setConnectionState("offline");
        }
      });

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [technicalServiceId]);

  return (
    <>
      <Card>
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm text-slate-500">Cihaz</p>
              {connectionState === "live" && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-700 ring-1 ring-inset ring-emerald-600/15">
                  <span className="size-1.5 animate-pulse rounded-full bg-emerald-500" />
                  Canlı
                </span>
              )}
            </div>
            <p className="mt-1 text-lg font-semibold text-gray-900">
              {device.device_model?.trim() || "—"}
            </p>
          </div>
          <span
            className={cn(
              "inline-flex shrink-0 rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset transition-colors duration-300",
              getServiceStatusStyle(status)
            )}
          >
            {getServiceStatusLabel(status)}
          </span>
        </div>

        {device.issue_description && (
          <p className="mt-4 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
            {device.issue_description}
          </p>
        )}
      </Card>

      <ServiceTrackingTimeline status={status} />
    </>
  );
}
