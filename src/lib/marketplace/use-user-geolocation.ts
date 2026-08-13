"use client";

import { useEffect, useState } from "react";
import type { GeoCoordinates } from "@/lib/geo/haversine";

export type UserGeolocationStatus =
  | "idle"
  | "loading"
  | "granted"
  | "denied"
  | "unsupported";

export type UserGeolocationState = {
  coords: GeoCoordinates | null;
  status: UserGeolocationStatus;
};

export function useUserGeolocation(): UserGeolocationState {
  const [state, setState] = useState<UserGeolocationState>({
    coords: null,
    status: "idle",
  });

  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setState({ coords: null, status: "unsupported" });
      return;
    }

    setState((current) =>
      current.status === "idle" ? { ...current, status: "loading" } : current
    );

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          coords: {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          },
          status: "granted",
        });
      },
      () => {
        setState({ coords: null, status: "denied" });
      },
      {
        enableHighAccuracy: false,
        timeout: 10_000,
        maximumAge: 300_000,
      }
    );
  }, []);

  return state;
}
