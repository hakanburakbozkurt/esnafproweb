"use client";

import { useEffect, useRef } from "react";
import type { Map as LeafletMap, Marker as LeafletMarker } from "leaflet";
import {
  DEFAULT_MAP_CENTER,
  formatCoordinate,
} from "@/lib/dukkan/location";
import { cn } from "@/lib/utils/cn";

type LocationMapPickerProps = {
  enlem: number | null;
  boylam: number | null;
  onChange: (coords: { enlem: number; boylam: number } | null) => void;
  className?: string;
};

export function LocationMapPicker({
  enlem,
  boylam,
  onChange,
  className,
}: LocationMapPickerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markerRef = useRef<LeafletMarker | null>(null);
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    let disposed = false;

    async function initMap() {
      if (!containerRef.current || mapRef.current) return;

      const L = (await import("leaflet")).default;
      await import("leaflet/dist/leaflet.css");

      if (disposed || !containerRef.current) return;

      const hasCoords = enlem != null && boylam != null;
      const center = hasCoords
        ? { lat: enlem, lng: boylam }
        : { lat: DEFAULT_MAP_CENTER.enlem, lng: DEFAULT_MAP_CENTER.boylam };

      const map = L.map(containerRef.current, {
        center,
        zoom: hasCoords ? 16 : 12,
        scrollWheelZoom: true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      const icon = L.icon({
        iconRetinaUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      });

      function placeMarker(lat: number, lng: number) {
        if (markerRef.current) {
          markerRef.current.setLatLng([lat, lng]);
        } else {
          markerRef.current = L.marker([lat, lng], {
            icon,
            draggable: true,
          }).addTo(map);

          markerRef.current.on("dragend", () => {
            const position = markerRef.current?.getLatLng();
            if (!position) return;
            onChangeRef.current({
              enlem: position.lat,
              boylam: position.lng,
            });
          });
        }
      }

      if (hasCoords) {
        placeMarker(enlem, boylam);
      }

      map.on("click", (event) => {
        placeMarker(event.latlng.lat, event.latlng.lng);
        onChangeRef.current({
          enlem: event.latlng.lat,
          boylam: event.latlng.lng,
        });
      });

      mapRef.current = map;
    }

    void initMap();

    return () => {
      disposed = true;
      mapRef.current?.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- map init once; coords synced below
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (enlem != null && boylam != null) {
      map.setView([enlem, boylam], Math.max(map.getZoom(), 15), {
        animate: true,
      });

      if (markerRef.current) {
        markerRef.current.setLatLng([enlem, boylam]);
      } else {
        void import("leaflet").then((leafletModule) => {
          const L = leafletModule.default;
          const icon = L.icon({
            iconRetinaUrl:
              "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
            iconUrl:
              "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
            shadowUrl:
              "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41],
          });

          if (!markerRef.current && mapRef.current) {
            markerRef.current = L.marker([enlem, boylam], {
              icon,
              draggable: true,
            }).addTo(mapRef.current);

            markerRef.current.on("dragend", () => {
              const position = markerRef.current?.getLatLng();
              if (!position) return;
              onChangeRef.current({
                enlem: position.lat,
                boylam: position.lng,
              });
            });
          }
        });
      }
    } else if (markerRef.current) {
      markerRef.current.remove();
      markerRef.current = null;
    }
  }, [enlem, boylam]);

  return (
    <div className={cn("space-y-3", className)}>
      <div
        ref={containerRef}
        className="h-72 w-full overflow-hidden rounded-2xl border border-gray-100 bg-slate-100 shadow-sm sm:h-80 lg:h-96"
        aria-label="Harita üzerinden mağaza konumu seçin"
      />

      <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
        <p className="text-slate-500">
          Haritaya tıklayın veya pini sürükleyerek mağaza konumunu belirleyin.
        </p>

        {enlem != null && boylam != null ? (
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
              {formatCoordinate(enlem)}, {formatCoordinate(boylam)}
            </span>
            <button
              type="button"
              onClick={() => onChange(null)}
              className="rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600 transition hover:border-red-200 hover:text-red-600"
            >
              Pini temizle
            </button>
          </div>
        ) : (
          <span className="text-xs text-slate-400">Henüz konum seçilmedi</span>
        )}
      </div>
    </div>
  );
}
